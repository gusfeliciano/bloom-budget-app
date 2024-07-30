'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AddCategoryModal from '@/components/transactions/AddCategoryModal';
import MonthPicker from '@/components/ui/MonthPicker';
import { 
  fetchCategories, 
  fetchBudget, 
  updateBudget,  
  fetchBudgetSummary, 
  addDefaultCategories,
  fetchTransactions,
  fetchReadyToAssign,
  calculateAndUpdateReadyToAssign,
  updateCategoryOrder,
  deleteCategory,
  updateCategory
} from '@/lib/api';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { debounce } from 'lodash';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import CategoryRow from '@/components/ui/CategoryRow';
import { BudgetData, ParentCategory, TransactionCategory, Budget, ReadyToAssign, BudgetCategory } from '@/types/budget';
import MonthNavigation from '@/components/budget/MonthNavigation';
import ReadyToAssignDisplay from '@/components/budget/ReadyToAssignDisplay';
import CategoryFilters from '@/components/budget/CategoryFilters';
import BudgetTable from '@/components/budget/BudgetTable';

function flattenBudget(budget: BudgetData): TransactionCategory[] {
  return budget.reduce((acc, parent) => {
    acc.push({
      ...parent,
      children: [],
      type: 'parent',
      parent_id: null
    });

    acc.push(...parent.children.map(child => ({
      ...child,
      user_id: parent.user_id,
      parent_id: parent.id,
      type: 'child',
      children: []
    })));

    return acc;
  }, [] as TransactionCategory[]);
}

export default function BudgetPage() {
  const { user } = useAuth();
  const [budget, setBudget] = useState<BudgetData>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReadyToAssignLoading, setIsReadyToAssignLoading] = useState(true);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const [openAccordions, setOpenAccordions] = useLocalStorage<string[]>('openAccordions', []);
  const [earliestMonth, setEarliestMonth] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | undefined>(undefined);
  const [readyToAssign, setReadyToAssign] = useState<number>(0);
  const [summary, setSummary] = useState({ income: 0, expenses: 0 });

  useEffect(() => {
    if (user) {
      loadBudget();
      loadReadyToAssign();
      loadSummary();
    }
  }, [user, currentMonth]);

  const fetchEarliestMonth = async () => {
    if (user) {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('date')
          .eq('user_id', user.id)
          .order('date', { ascending: true })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setEarliestMonth(data[0].date.slice(0, 7));
        }
      } catch (error) {
        console.error('Error fetching earliest month:', error);
      }
    }
  };

  const loadReadyToAssign = async () => {
    if (user) {
      const amount = await fetchReadyToAssign(user.id, currentMonth);
      setReadyToAssign(amount);
    }
  };

  const loadBudget = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const categories = await fetchCategories(user.id);
      const budgetData = await fetchBudget(user.id, currentMonth);
      const transactions = await fetchTransactions(user.id, 1, 1000, currentMonth);
      const readyToAssignAmount = await fetchReadyToAssign(user.id, currentMonth);
  
      const budgetByCategory = new Map(budgetData.map(b => [b.category_id, b]));
      const activityByCategory = new Map();
  
      transactions.transactions.forEach(transaction => {
        const categoryId = transaction.category_id;
        const amount = transaction.amount;
        activityByCategory.set(categoryId, (activityByCategory.get(categoryId) || 0) + amount);
      });
  
      const formattedBudget: BudgetData = categories.map(parent => {
        const children: BudgetCategory[] = (parent.children || []).map(child => {
          const budgetEntry = budgetByCategory.get(child.id) || { assigned: 0, actual: 0 };
          const activity = activityByCategory.get(child.id) || 0;
          return {
            id: child.id,
            name: child.name,
            budget: budgetEntry.assigned,
            activity: activity,
            remaining: budgetEntry.assigned - activity,
            parentId: parent.id,
            user_id: user.id,
            type: child.type
          };
        });
  
        const parentBudget = children.reduce((sum, child) => sum + child.budget, 0);
        const parentActivity = children.reduce((sum, child) => sum + child.activity, 0);
  
        return {
          id: parent.id,
          name: parent.name,
          budget: parentBudget,
          activity: parentActivity,
          remaining: parentBudget - parentActivity,
          children,
          user_id: user.id,
          type: parent.type
        };
      });
  
      setBudget(formattedBudget);
      setReadyToAssign(readyToAssignAmount);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading budget:', error);
      toast.error('Failed to load budget. Please try again.');
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    if (user) {
      const summaryData = await fetchBudgetSummary(user.id, currentMonth);
      setSummary(summaryData);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    setCurrentMonth(newMonth);
  };

  const debouncedUpdateBudget = useCallback(
    debounce((budget: Omit<Budget, 'id'>) => {
      updateBudget(budget).catch(error => {
        console.error('Error updating budget:', error);
        toast.error('Failed to update budget. Please try again.');
      });
    }, 500),
    []
  );

  const handleBudgetChange = (parentId: number, childId: number, value: number) => {
    setBudget(prevBudget =>
      prevBudget.map(category =>
        category.id === parentId
          ? {
              ...category,
              children: category.children.map(child =>
                child.id === childId
                  ? { ...child, budget: value, remaining: value - child.activity }
                  : child
              ),
              budget: category.children.reduce((sum, child) => 
                child.id === childId ? sum + value : sum + child.budget, 0
              ),
              remaining: category.children.reduce((sum, child) => 
                child.id === childId ? sum + (value - child.activity) : sum + child.remaining, 0
              )
            }
          : category
      )
    );
  
    if (user) {
      const budgetEntry: Omit<Budget, 'id'> = {
        user_id: user.id,
        category_id: childId,
        month: currentMonth,
        assigned: value,
        actual: budget.find(cat => cat.id === parentId)?.children.find(child => child.id === childId)?.activity || 0
      };
      debouncedUpdateBudget(budgetEntry);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !user) return;

    const items = Array.from(budget);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBudget(items);

    try {
      await updateCategoryOrder(user.id, items.map((item, index) => ({ id: item.id, order: index })));
      toast.success('Categories reordered successfully');
    } catch (error) {
      console.error('Failed to update category order:', error);
      toast.error('Failed to update category order. Please try again.');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!user) return;

    try {
      await deleteCategory(categoryId);
      setBudget(prevBudget => prevBudget.filter(category => 
        category.id !== categoryId && category.children.every(child => child.id !== categoryId)
      ));
      toast.success('Category deleted successfully');
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category. Please try again.');
    }
  };

  const handleUpdateCategoryName = async (categoryId: number, newName: string) => {
    try {
      const updatedCategory = await updateCategory(categoryId, { name: newName });
      if (updatedCategory) {
        setBudget(prevBudget => 
          prevBudget.map(category => 
            category.id === categoryId 
              ? { ...category, name: newName }
              : {
                  ...category,
                  children: category.children.map(child =>
                    child.id === categoryId ? { ...child, name: newName } : child
                  )
                }
          )
        );
        toast.success('Category name updated successfully');
      } else {
        throw new Error('Failed to update category');
      }
    } catch (error) {
      console.error('Failed to update category name:', error);
      toast.error('Failed to update category name. Please try again.');
    }
  };

  const filteredBudget = budget.filter(category => 
    category.name !== 'Income' && category.name !== 'Initial Balance'
  );
  
  const handleAddChildCategory = (parentId: number) => {
    setEditingCategory(undefined);
    setIsAddingCategory(true);
    // You might want to add some state to keep track of the parent category
    // when adding a new child category
  };

  const renderCategoryGroup = (category: ParentCategory, index: number) => (
    <Draggable key={category.id} draggableId={category.id.toString()} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <AccordionItem value={category.id.toString()} className="border-b">
            <AccordionTrigger className="hover:no-underline">
              <CategoryRow
                category={category}
                isParent={true}
                onEdit={handleUpdateCategoryName}
                onDelete={handleDeleteCategory}
              />
            </AccordionTrigger>
            <AccordionContent>
              {category.children.map((childCategory) => (
                <CategoryRow
                  key={childCategory.id}
                  category={childCategory}
                  isParent={false}
                  onEdit={handleUpdateCategoryName}
                  onDelete={handleDeleteCategory}
                  onBudgetChange={(id, value) => handleBudgetChange(category.id, id, value)}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </div>
      )}
    </Draggable>
  );

  // Return statement
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-white border-b">
        <MonthNavigation 
          currentMonth={currentMonth} 
          onMonthChange={handleMonthChange} 
        />
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Budget</button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded">Forecast</button>
        </div>
        <div className="flex space-x-4">
          <button>Today</button>
          <button>&lt;</button>
          <button>&gt;</button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 bg-white z-10 border-b">
            <div className="px-4 py-2">
              <CategoryFilters />
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-gray-600 bg-gray-100 px-4 py-2">
              <span>CATEGORY</span>
              <span className="text-right">ASSIGNED</span>
              <span className="text-right">ACTIVITY</span>
              <span className="text-right">AVAILABLE</span>
            </div>
          </div>
          <div className="px-4">
            <BudgetTable 
              budget={filteredBudget}
              onBudgetChange={handleBudgetChange}
              onCategoryNameUpdate={handleUpdateCategoryName}
              onCategoryDelete={handleDeleteCategory}
              onDragEnd={onDragEnd}
            />
          </div>
        </div>
        <div className="w-80 bg-white p-4 border-l">
          <div className="bg-green-400 text-white p-4 rounded-lg mb-4">
            <h2 className="text-2xl font-bold">${readyToAssign.toFixed(2)}</h2>
            <p>Left to budget</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Summary</h3>
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
          </div>
        </div>
      </div>
    </div>
  );
}