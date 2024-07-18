'use client';

import { useState } from 'react';
import { Transaction, updateTransaction, deleteTransaction } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, X, Check } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onTransactionUpdated: () => void;
  onTransactionDeleted: () => void;
}

export default function TransactionItem({ transaction, onTransactionUpdated, onTransactionDeleted }: TransactionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState(transaction);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTransaction(transaction);
  };

  const handleSave = async () => {
    try {
      await updateTransaction(transaction.id, editedTransaction);
      setIsEditing(false);
      onTransactionUpdated();
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteTransaction(transaction.id);
        onTransactionDeleted();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  if (isEditing) {
    return (
      <li className="bg-white p-4 rounded shadow space-y-2">
        <Input
          value={editedTransaction.description}
          onChange={(e) => setEditedTransaction({ ...editedTransaction, description: e.target.value })}
        />
        <Input
          type="number"
          step="0.01"
          value={editedTransaction.amount}
          onChange={(e) => setEditedTransaction({ ...editedTransaction, amount: parseFloat(e.target.value) })}
        />
        <Input
          value={editedTransaction.category}
          onChange={(e) => setEditedTransaction({ ...editedTransaction, category: e.target.value })}
        />
        <Select
          onValueChange={(value: 'income' | 'expense') => setEditedTransaction({ ...editedTransaction, type: value })}
          defaultValue={editedTransaction.type}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={editedTransaction.date}
          onChange={(e) => setEditedTransaction({ ...editedTransaction, date: e.target.value })}
        />
        <div className="flex justify-end space-x-2">
          <Button onClick={handleSave} size="sm"><Check size={16} /></Button>
          <Button onClick={handleCancel} size="sm" variant="outline"><X size={16} /></Button>
        </div>
      </li>
    );
  }

  return (
    <li className="bg-white p-4 rounded shadow">
      <div className="flex justify-between items-center">
        <span>{transaction.description}</span>
        <div className="flex items-center space-x-2">
          <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
            {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
          </span>
          <Button onClick={handleEdit} size="sm" variant="ghost"><Pencil size={16} /></Button>
          <Button onClick={handleDelete} size="sm" variant="ghost"><Trash2 size={16} /></Button>
        </div>
      </div>
      <div className="text-sm text-gray-500">
        <span>{new Date(transaction.date).toLocaleDateString()}</span>
        <span className="mx-2">•</span>
        <span>{transaction.category}</span>
      </div>
    </li>
  );
}