'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  addDefaultCategories,
  fetchTransactions,
  fetchReadyToAssign,
  updateReadyToAssign,
  calculateAndUpdateReadyToAssign 
} from '@/lib/api';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { debounce } from 'lodash';
import { toast } from 'react-hot-toast';


interface BudgetCategory extends TransactionCategory {
  budget: number;
  activity: number;
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
  const [openAccordions, setOpenAccordions] = useLocalStorage<string[]>('openAccordions', []);
  

  useEffect(() => {
    if (user) {
      (async () => {
        await addDefaultCategories(user.id);
        await loadBudget();
        await loadSummary();
        await loadReadyToAssign();
      })();
    }
  }, [user, currentMonth]);

  const loadReadyToAssign = async () => {
    if (user) {
      try {
        const amount = await calculateAndUpdateReadyToAssign(user.id, currentMonth);
        console.log('Loaded Ready to Assign:', amount);
        setReadyToAssign(amount);
      } catch (error) {
        console.error('Error loading Ready to Assign:', error);
        toast.error('Failed to load Ready to Assign amount');
      }
    }
  };

  const loadBudget = async () => {
    setIsLoading(true);
    try {
      const categories = await fetchCategories(user!.id);
      const budgetData = await fetchBudget(user!.id, currentMonth);
      const transactions = await fetchTransactions(user!.id, 1, 1000);
      const readyToAssignAmount = await fetchReadyToAssign(user!.id, currentMonth);
  
      const budgetByCategory = new Map(budgetData.map(b => [b.category_id, b]));
      const activityByCategory = new Map();
  
      transactions.transactions.forEach(transaction => {
        const categoryId = transaction.category_id;
        const amount = transaction.amount;
        activityByCategory.set(categoryId, (activityByCategory.get(categoryId) || 0) + amount);
      });
  
      const formattedBudget: ParentCategory[] = categories.map(parent => {
        const children = (parent.children || []).map(child => {
          const budgetEntry = budgetByCategory.get(child.id) || { assigned: 0, activity: 0 };
          const activity = activityByCategory.get(child.id) || 0;
          return {
            ...child,
            budget: budgetEntry.assigned,
            activity: activity,
            remaining: budgetEntry.assigned - activity
          } as BudgetCategory;
        });
  
        const parentBudget = children.reduce((sum, child) => sum + child.budget, 0);
        const parentActivity = children.reduce((sum, child) => sum + child.activity, 0);
  
        return {
          ...parent,
          budget: parentBudget,
          activity: parentActivity,
          remaining: parentBudget - parentActivity,
          children
        } as ParentCategory;
      });
  
      setBudget(formattedBudget);
      setReadyToAssign(readyToAssignAmount);
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

  const updateBudgetEntry = useCallback(async (budgetEntry: Budget) => {
    try {
      const updatedBudget = await updateBudget(budgetEntry);
      
      // Update local state
      setBudget(prevBudget => 
        prevBudget.map(category => {
          if (category.id === updatedBudget.category_id) {
            return {
              ...category,
              budget: updatedBudget.assigned,
              remaining: updatedBudget.assigned - category.activity
            };
          }
          if (category.children) {
            return {
              ...category,
              children: category.children.map(child => 
                child.id === updatedBudget.category_id
                  ? { ...child, budget: updatedBudget.assigned, remaining: updatedBudget.assigned - child.activity }
                  : child
              )
            };
          }
          return category;
        })
      );
  
      // Update Ready to Assign
      const newReadyToAssign = await fetchReadyToAssign(user!.id, currentMonth);
      setReadyToAssign(newReadyToAssign);
  
      toast.success('Budget updated successfully');
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget. Please try again.');
    }
  }, [user, currentMonth]);

  const debouncedUpdateBudget = useCallback(
    debounce(updateBudgetEntry, 1000),
    [updateBudgetEntry]
  );

  const handleBudgetChange = (parentId: number, childId: number, value: number) => {
    const updatedBudget = budget.map(parent => {
      if (parent.id === parentId) {
        const updatedChildren = parent.children.map(child => 
          child.id === childId 
            ? { ...child, budget: value, remaining: value - child.activity }
            : child
        );
        return {
          ...parent,
          children: updatedChildren,
          budget: updatedChildren.reduce((sum, child) => sum + child.budget, 0),
          activity: updatedChildren.reduce((sum, child) => sum + child.activity, 0),
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
        actual: updatedChild.activity
      };
      debouncedUpdateBudget(budgetEntry);
    }
  };

  const handleBudgetBlur = (parentId: number, childId: number, value: number) => {
    debouncedUpdateBudget.cancel(); // Cancel any pending debounced updates
    const updatedChild = budget
      .find(parent => parent.id === parentId)
      ?.children.find(child => child.id === childId);
  
    if (updatedChild) {
      const budgetEntry: Budget = {
        id: 0,
        user_id: user!.id,
        category_id: childId,
        month: currentMonth,
        assigned: value,
        actual: updatedChild.activity
      };
      updateBudgetEntry(budgetEntry);
    }
  };

  const handleBudgetKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>,
    parentId: number,
    childId: number,
    value: number
  ) => {
    if (event.key === 'Enter') {
      handleBudgetBlur(parentId, childId, value);
      event.currentTarget.blur(); // This line will remove focus from the input field
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
              <TableHead>Activity</TableHead>
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
                      onBlur={(e) => handleBudgetBlur(category.id, childCategory.id, Number(e.target.value))}
                      onKeyPress={(e) => handleBudgetKeyPress(e, category.id, childCategory.id, Number(e.currentTarget.value))}
                      className="pl-6 py-1"
                      onFocus={(e) => e.target.select()}
                    />
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
                  </div>
                </TableCell>
                <TableCell>${(childCategory.activity || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className={childCategory.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                          ${childCategory.remaining.toFixed(2)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {childCategory.remaining >= 0 ? 'Under budget' : 'Over budget'}
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
          <Accordion 
            type="multiple" 
            className="w-full" 
            value={openAccordions}
            onValueChange={setOpenAccordions}
          >
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