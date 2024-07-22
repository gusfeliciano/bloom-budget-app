'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight } from 'lucide-react';
import AddCategoryModal from '@/components/transactions/AddCategoryModal';
import { fetchCategories, TransactionCategory } from '@/lib/api';

interface BudgetCategory {
  id: number;
  name: string;
  budget: number;
  actual: number;
  remaining: number;
  parentId: number | null;
}

interface ParentCategory {
  id: number;
  name: string;
  children: BudgetCategory[];
  isCollapsed: boolean;
  budget: number;
  actual: number;
  remaining: number;
}

type Budget = ParentCategory[];

export default function BudgetPage() {
  const { user } = useAuth();
  const [budget, setBudget] = useState<Budget>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [readyToAssign, setReadyToAssign] = useState(0);
  const [currentMonth, setCurrentMonth] = useState(new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
  const [summary, setSummary] = useState({ income: 0, expenses: 0, goals: 0 });

  useEffect(() => {
    if (user) {
      loadBudget();
      loadCategories();
      loadReadyToAssign();
    }
  }, [user]);

  const loadBudget = async () => {
    setIsLoading(true);
    // Fetch budget from API
    // For now, we'll use dummy data
    const dummyBudget: Budget = [
      {
        id: 1,
        name: 'Housing',
        isCollapsed: false,
        budget: 1500,
        actual: 1450,
        remaining: 50,
        children: [
          { id: 2, name: 'Rent', budget: 1200, actual: 1200, remaining: 0, parentId: 1 },
          { id: 3, name: 'Utilities', budget: 300, actual: 250, remaining: 50, parentId: 1 },
        ]
      },
      {
        id: 4,
        name: 'Food',
        isCollapsed: false,
        budget: 820,
        actual: 733,
        remaining: 87,
        children: [
          { id: 5, name: 'Groceries', budget: 500, actual: 471, remaining: 29, parentId: 4 },
          { id: 6, name: 'Restaurants & Bars', budget: 300, actual: 237, remaining: 63, parentId: 4 },
          { id: 7, name: 'Coffee Shops', budget: 20, actual: 25, remaining: -5, parentId: 4 },
        ]
      },
      {
        id: 8,
        name: 'Transportation',
        isCollapsed: false,
        budget: 400,
        actual: 380,
        remaining: 20,
        children: [
          { id: 9, name: 'Gas', budget: 200, actual: 180, remaining: 20, parentId: 8 },
          { id: 10, name: 'Public Transit', budget: 100, actual: 100, remaining: 0, parentId: 8 },
          { id: 11, name: 'Car Maintenance', budget: 100, actual: 100, remaining: 0, parentId: 8 },
        ]
      },
    ];
    setBudget(dummyBudget);
    setIsLoading(false);
  };

  const loadCategories = async () => {
    if (!user) return;
    try {
      const fetchedCategories = await fetchCategories(user.id);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const loadReadyToAssign = async () => {
    // In a real app, this would be calculated based on income and existing budget allocations
    setReadyToAssign(1515);
  };

  const handleBudgetChange = (parentId: number, childId: number, value: number) => {
    setBudget(prevBudget => 
      prevBudget.map(parent => {
        if (parent.id === parentId) {
          const updatedChildren = parent.children.map(child => 
            child.id === childId 
              ? { ...child, budget: value, remaining: value - child.actual }
              : child
          );
          const totalBudget = updatedChildren.reduce((sum, child) => sum + child.budget, 0);
          const totalActual = updatedChildren.reduce((sum, child) => sum + child.actual, 0);
          return {
            ...parent,
            children: updatedChildren,
            budget: totalBudget,
            actual: totalActual,
            remaining: totalBudget - totalActual
          };
        }
        return parent;
      })
    );
  };

  const toggleCollapse = (parentId: number) => {
    setBudget(prevBudget => 
      prevBudget.map(parent => 
        parent.id === parentId 
          ? { ...parent, isCollapsed: !parent.isCollapsed }
          : parent
      )
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{currentMonth}</h1>
        <div className="flex space-x-4">
          {/* TBD on if we include buttons for other pages here.
          <Button variant="outline">Budget</Button>
          <Button variant="outline">Forecast</Button>
          */}
        </div>
      </div>
      <div className="flex justify-between">
        <div className="w-3/4 pr-6">
          {budget.map((parentCategory) => (
            <Card key={parentCategory.id} className="mb-4">
              <CardHeader 
                className="bg-gray-100 cursor-pointer" 
                onClick={() => toggleCollapse(parentCategory.id)}
              >
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    {parentCategory.isCollapsed ? <ChevronRight className="mr-2" /> : <ChevronDown className="mr-2" />}
                    {parentCategory.name}
                  </CardTitle>
                  <div className="grid grid-cols-3 gap-8 text-sm font-semibold w-1/2">
                    <div className="text-center">BUDGET</div>
                    <div className="text-center">ACTUAL</div>
                    <div className="text-center">REMAINING</div>
                  </div>
                </div>
              </CardHeader>
              {!parentCategory.isCollapsed && (
                <CardContent>
                  {parentCategory.children.map((childCategory) => (
                    <div key={childCategory.id} className="grid grid-cols-4 gap-8 py-2 items-center">
                      <div>{childCategory.name}</div>
                      <div className="relative">
                        <Input 
                          type="number" 
                          value={childCategory.budget} 
                          onChange={(e) => handleBudgetChange(parentCategory.id, childCategory.id, Number(e.target.value))}
                          className="w-24 text-right pl-6 py-1"
                          onFocus={(e) => e.target.select()}
                        />
                        <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
                      </div>
                      <div className="text-center">${childCategory.actual.toFixed(2)}</div>
                      <div className={`text-center ${childCategory.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${childCategory.remaining.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
        <div className="w-1/4">
          <Card className="mb-4 bg-green-100">
            <CardContent className="p-4">
              <h2 className="font-semibold mb-2">Left to budget</h2>
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
                <div className="flex justify-between">
                  <span>Goals</span>
                  <span>${summary.goals.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <AddCategoryModal
        isOpen={isAddingCategory}
        onClose={() => setIsAddingCategory(false)}
        onCategoryAdded={() => {
          loadCategories();
          loadBudget();
          setIsAddingCategory(false);
        }}
        categories={categories}
        userId={user?.id}
      />
    </div>
  );
}