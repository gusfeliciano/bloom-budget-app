'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createTransaction, TransactionCategory } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Account } from '@/types/accounts';

interface AddTransactionFormProps {
  onTransactionAdded: () => void;
  accounts: Account[];
  categories: TransactionCategory[];
}

export default function AddTransactionForm({ onTransactionAdded, accounts, categories }: AddTransactionFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !accountId || !categoryId) return;

    setIsLoading(true);
    try {
      await createTransaction(user.id, {
        account_id: parseInt(accountId),
        description,
        amount: parseFloat(amount),
        category_id: parseInt(categoryId),
        type,
        date,
      });
      onTransactionAdded();
      setDescription('');
      setAmount('');
      setCategoryId('');
      setType('expense');
      setDate(new Date().toISOString().split('T')[0]);
      setAccountId('');
    } catch (error) {
      console.error('Failed to add transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select onValueChange={setCategoryId} value={categoryId}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select onValueChange={(value: 'income' | 'expense') => setType(value)} defaultValue={type}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="account">Account</Label>
        <Select onValueChange={setAccountId} value={accountId}>
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id.toString()}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={isLoading || !accountId || !categoryId}>
        {isLoading ? 'Adding...' : 'Add Transaction'}
      </Button>
    </form>
  );
}