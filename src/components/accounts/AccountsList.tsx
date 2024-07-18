'use client';

import { useState, useEffect } from 'react';
import AccountCard from './AccountCard';
import { Account } from '@/types/accounts';
import { fetchUserAccounts } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountsList({ refreshTrigger, onAccountsChanged }: { refreshTrigger: number, onAccountsChanged: () => void }) {
  const [accountsByType, setAccountsByType] = useState<Record<string, Account[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user, refreshTrigger]);

  async function loadAccounts() {
    if (!user) return;
    setIsLoading(true);
    try {
      const fetchedAccounts = await fetchUserAccounts(user.id);
      const grouped = fetchedAccounts.reduce((acc, account) => {
        if (!acc[account.type]) {
          acc[account.type] = [];
        }
        acc[account.type].push(account);
        return acc;
      }, {} as Record<string, Account[]>);
      setAccountsByType(grouped);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(accountsByType).map(([type, accounts]) => (
        <AccountCard 
          key={type}
          type={type}
          accounts={accounts}
          onAccountsChanged={onAccountsChanged}
        />
      ))}
    </div>
  );
}