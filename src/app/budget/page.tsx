'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AddCategoryModal from '@/components/transactions/AddCategoryModal';
import { 
  fetchCategories, 
  TransactionCategory, 
  fetchBudget, 
  updateBudget, 
  Budget, 
  fetchBudgetSummary, 
  addDefaultCategories 
} from '@/lib/api';

interface BudgetCategory extends TransactionCategory {
  budget: number;
  actual: number;
  remaining: number;
}

interface ParentCategory extends Omit<BudgetCategory, 'parent_id'> {
  children: BudgetCategory[];
}

export default function BudgetPage() {
  const { user } = useAuth();
  const [budget, setBudget] = useState<ParentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [readyToAssign, setReadyToAssign] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState({ income: 0, expenses: 0 });

  useEffect(() => {
    if (user) {
      (async () => {
        await addDefaultCategories(user.id);
        await loadBudget();
        await loadSummary();
      })();
    }
  }, [user, currentMonth]);

  const loadBudget = async () => {
    setIsLoading(true);
    try {
      const categories = await fetchCategories(user!.id);
      const budgetData = await fetchBudget(user!.id, currentMonth);
      
      const budgetByCategory = new Map(budgetData.map(b => [b.category_id, b]));
  
      const formattedBudget: ParentCategory[] = categories.map(parent => {
        const children = (parent.children || []).map(child => {
          const budgetEntry = budgetByCategory.get(child.id) || { assigned: 0, actual: 0 };
          return {
            ...child,
            budget: budgetEntry.assigned,
            actual: budgetEntry.actual,
            remaining: budgetEntry.assigned - budgetEntry.actual
          } as BudgetCategory;
        });
  
        const parentBudget = children.reduce((sum, child) => sum + child.budget, 0);
        const parentActual = children.reduce((sum, child) => sum + child.actual, 0);
  
        return {
          ...parent,
          budget: parentBudget,
          actual: parentActual,
          remaining: parentBudget - parentActual,
          children
        } as ParentCategory;
      });
  
      setBudget(formattedBudget);
    } catch (error) {
      console.error('Failed to load budget:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryData = await fetchBudgetSummary(user!.id, currentMonth);
      setSummary(summaryData);
      setReadyToAssign(summaryData.income - summaryData.expenses);
    } catch (error) {
      console.error('Failed to load summary:', error);
    }
  };

  const handleBudgetChange = async (parentId: number, childId: number, value: number) => {
    const updatedBudget = budget.map(parent => {
      if (parent.id === parentId) {
        const updatedChildren = parent.children.map(child => 
          child.id === childId 
            ? { ...child, budget: value, remaining: value - child.actual }
            : child
        );
        return {
          ...parent,
          children: updatedChildren,
          budget: updatedChildren.reduce((sum, child) => sum + child.budget, 0),
          actual: updatedChildren.reduce((sum, child) => sum + child.actual, 0),
          remaining: updatedChildren.reduce((sum, child) => sum + child.remaining, 0)
        };
      }
      return parent;
    });
  
    setBudget(updatedBudget);
  
    const updatedChild = updatedBudget
      .find(parent => parent.id === parentId)
      ?.children.find(child => child.id === childId);
  
    if (updatedChild) {
      const budgetEntry: Budget = {
        id: 0,
        user_id: user!.id,
        category_id: childId,
        month: currentMonth,
        assigned: value,
        actual: updatedChild.actual
      };
      await updateBudget(budgetEntry);
    }
  };

  const renderCategoryGroup = (category: ParentCategory) => (
    <AccordionItem key={category.id} value={category.id.toString()} className="no-underline">
    <AccordionTrigger className="accordion-trigger">
      <div className="flex items-center justify-between w-full">
        <span>{category.name}</span>
        <Badge variant={category.type === 'income' ? 'success' : 'destructive'}>
          {category.type}
        </Badge>
      </div>
    </AccordionTrigger>
      <AccordionContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Category</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Actual</TableHead>
              <TableHead>Remaining</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {category.children.map((childCategory) => (
              <TableRow key={childCategory.id}>
                <TableCell>{childCategory.name}</TableCell>
                <TableCell>
                  <div className="relative w-24">
                    <Input 
                      type="number" 
                      value={childCategory.budget || 0} 
                      onChange={(e) => handleBudgetChange(category.id, childCategory.id, Number(e.target.value))}
                      className="pl-6 py-1"
                      onFocus={(e) => e.target.select()}
                    />
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
                  </div>
                </TableCell>
                <TableCell>${(childCategory.actual || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className={((childCategory.budget || 0) - (childCategory.actual || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${((childCategory.budget || 0) - (childCategory.actual || 0)).toFixed(2)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {((childCategory.budget || 0) - (childCategory.actual || 0)) >= 0 ? 'Under budget' : 'Over budget'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionContent>
    </AccordionItem>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{new Date(currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</h1>
      </div>
      <div className="flex justify-between">
        <div className="w-3/4 pr-6">
          <Accordion type="multiple" className="w-full">
            {budget.map((category) => renderCategoryGroup(category))}
          </Accordion>
        </div>
        <div className="w-1/4">
          <Card className="mb-4 bg-green-100">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">Ready to Assign</h2>
              <div className="text-3xl font-bold">${readyToAssign.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold mb-4">Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Income</span>
                  <span>${summary.income.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expenses</span>
                  <span>${summary.expenses.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
        <DialogTrigger asChild>
          <Button>Add Category</Button>
        </DialogTrigger>
        <DialogContent>
          <AddCategoryModal
            isOpen={isAddingCategory}
            onClose={() => setIsAddingCategory(false)}
            onCategoryAdded={() => {
              loadBudget();
              setIsAddingCategory(false);
            }}
            categories={budget}
            userId={user?.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}