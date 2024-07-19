import React from 'react';
import { Transaction, TransactionCategory } from '@/lib/api';
import TransactionItem from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
  categories: TransactionCategory[];
  onTransactionUpdated: () => void;
  onTransactionDeleted: () => void;
}

export default function TransactionList({ 
  transactions, 
  categories, 
  onTransactionUpdated, 
  onTransactionDeleted 
}: TransactionListProps) {
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const grouped = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);

    return Object.entries(grouped).sort((a, b) => 
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  };

  const groupedTransactions = groupTransactionsByDate(transactions);

  return (
    <div className="space-y-6">
      {groupedTransactions.map(([date, transactions]) => (
        <div key={date}>
          <h2 className="text-lg font-semibold mb-2">{date}</h2>
          <ul className="space-y-2">
            {transactions.map((transaction) => (
              <TransactionItem 
                key={transaction.id} 
                transaction={transaction} 
                categories={categories}
                onTransactionUpdated={onTransactionUpdated}
                onTransactionDeleted={onTransactionDeleted}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}