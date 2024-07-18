'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTransactions, Transaction, fetchUserAccounts } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import AddTransactionForm from '@/components/transactions/AddTransactionForm';
import TransactionItem from '@/components/transactions/TransactionItem';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Account } from '@/types/accounts';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadAccounts();
    }
  }, [user]);

  async function loadTransactions() {
    if (!user) return;
    setIsLoading(true);
    try {
      const fetchedTransactions = await fetchTransactions(user.id);
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
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

  const handleTransactionAdded = () => {
    loadTransactions();
  };

  const handleTransactionUpdated = () => {
    loadTransactions();
  };

  const handleTransactionDeleted = () => {
    loadTransactions();
  };

  const filteredAndSortedTransactions = transactions
    .filter(transaction => {
      if (filterType !== 'all' && transaction.type !== filterType) return false;
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

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
      <h1 className="text-3xl font-bold">Transactions</h1>
      <AddTransactionForm onTransactionAdded={handleTransactionAdded} accounts={accounts} />
      <div className="flex space-x-4">
        <Select onValueChange={(value: 'date' | 'amount') => setSortBy(value)} defaultValue={sortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)} defaultValue={sortOrder}>
          <SelectTrigger>
            <SelectValue placeholder="Sort order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)} defaultValue={filterType}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Input 
          placeholder="Search transactions" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {filteredAndSortedTransactions.length === 0 ? (
        <p>No transactions found. Add a new transaction to get started.</p>
      ) : (
        <ul className="space-y-2">
          {filteredAndSortedTransactions.map((transaction) => (
            <TransactionItem 
              key={transaction.id} 
              transaction={transaction} 
              onTransactionUpdated={handleTransactionUpdated}
              onTransactionDeleted={handleTransactionDeleted}
            />
          ))}
        </ul>
      )}
    </div>
  );
}