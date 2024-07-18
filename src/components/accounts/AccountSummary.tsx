'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchUserAccounts } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Account } from '@/types/accounts';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountSummary({ refreshTrigger }: { refreshTrigger: number }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
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
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }
 
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="flex justify-between text-sm">
              <span>{account.name}</span>
              <span>${account.balance.toLocaleString()}</span>
            </div>
          ))}
          <div className="pt-2 border-t">
            <div className="flex justify-between font-bold">
              <span>Total Balance</span>
              <span>${totalBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}