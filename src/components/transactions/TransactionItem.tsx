import { useState } from 'react';
import { Transaction, TransactionCategory, updateTransaction, deleteTransaction } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, X, Check } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  categories: TransactionCategory[];
  onTransactionUpdated: () => void;
  onTransactionDeleted: () => void;
}

export default function TransactionItem({ 
  transaction, 
  categories, 
  onTransactionUpdated, 
  onTransactionDeleted 
}: TransactionItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState(transaction);

  const childCategories = categories.filter(category => category.parent_id !== null);

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

  const category = categories.find(c => c.id === transaction.category_id);

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
        <Select
          value={editedTransaction.category_id.toString()}
          onValueChange={(value) => setEditedTransaction({ ...editedTransaction, category_id: parseInt(value) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {childCategories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex justify-end space-x-2">
          <Button onClick={handleSave} size="sm"><Check size={16} /></Button>
          <Button onClick={handleCancel} size="sm" variant="outline"><X size={16} /></Button>
        </div>
      </li>
    );
  }

  return (
    <li className="bg-white p-4 rounded shadow flex justify-between items-center">
      <div>
        <span className="font-medium">{transaction.description}</span>
        <span className="text-sm text-gray-500 ml-2">{category?.name}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
          {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
        </span>
        <Button onClick={handleEdit} size="sm" variant="ghost"><Pencil size={16} /></Button>
        <Button onClick={handleDelete} size="sm" variant="ghost"><Trash2 size={16} /></Button>
      </div>
    </li>
  );
}