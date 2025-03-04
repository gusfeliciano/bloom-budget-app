'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTransactions, Transaction, fetchUserAccounts, fetchCategories, TransactionCategory, addDefaultCategories } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Account } from '@/types/accounts';
import AddCategoryModal from '@/components/transactions/AddCategoryModal';
import { toast } from 'react-hot-toast';
import MonthPicker from '@/components/ui/MonthPicker';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7));
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadAccounts();
      loadCategories();
      addDefaultCategories(user.id).catch(error => {
        console.error('Failed to add default categories:', error);
        toast.error('There was an issue setting up your account. Some features may be limited.');
      });
    }
  }, [user, currentPage, currentMonth]);


  async function loadTransactions() {
    if (!user) return;
    setIsLoading(true);
    try {
      const { transactions: fetchedTransactions, total } = await fetchTransactions(user.id, currentPage, 10, currentMonth);
      setTransactions(fetchedTransactions);
      setTotalPages(Math.ceil(total / 10));
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      toast.error('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAccounts() {
    if (!user) return;
    try {
      const fetchedAccounts = await fetchUserAccounts(user.id);
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  }

  async function loadCategories() {
    if (!user) return;
    try {
      const fetchedCategories = await fetchCategories(user.id);
      // Flatten the category hierarchy
      const flatCategories = flattenCategories(fetchedCategories);
      setCategories(flatCategories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }

    // Helper function to flatten the category hierarchy
    function flattenCategories(categories: TransactionCategory[]): TransactionCategory[] {
      return categories.reduce((acc, category) => {
        acc.push(category);
        if (category.children) {
          acc.push(...flattenCategories(category.children));
        }
        return acc;
      }, [] as TransactionCategory[]);
    }

  const handleTransactionAdded = () => {
    loadTransactions();
    setIsAddingTransaction(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const date = new Date(currentMonth + "-01");
    if (direction === 'prev') {
      date.setMonth(date.getMonth() - 1);
    } else {
      date.setMonth(date.getMonth() + 1);
    }
    setCurrentMonth(date.toISOString().slice(0, 7));
    setCurrentPage(1); // Reset to first page when changing months
  };

  const handleMonthChange = (newMonth: string) => {
    setCurrentMonth(newMonth);
    setCurrentPage(1); // Reset to first page when changing months
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <div className="space-x-2">
          <Button onClick={() => setIsAddingTransaction(true)}>Add Transaction</Button>
          <Button onClick={() => setIsAddingCategory(true)}>Add Category</Button>
        </div>
      </div>
      <div className="flex justify-center items-center space-x-4">
      <div className="flex justify-center items-center space-x-4">
        <MonthPicker value={currentMonth} onChange={handleMonthChange} />
      </div>
      </div>
      {isAddingTransaction && (
        <Card>
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <AddTransactionForm 
            onTransactionAdded={handleTransactionAdded} 
            accounts={accounts} 
            categories={categories}
            onCancel={() => setIsAddingTransaction(false)}
          />
        </CardContent>
      </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionList 
            transactions={transactions} 
            categories={categories}
            onTransactionUpdated={loadTransactions}
            onTransactionDeleted={loadTransactions}
          />
        </CardContent>
      </Card>
      <div className="flex justify-between items-center">
        <Button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages}</span>
        <Button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>
      <AddCategoryModal
        isOpen={isAddingCategory}
        onClose={() => setIsAddingCategory(false)}
        onCategoryAdded={() => {
          loadCategories();
          setIsAddingCategory(false);
        }}
        categories={categories}
        userId={user?.id}
      />
    </div>
  );
}