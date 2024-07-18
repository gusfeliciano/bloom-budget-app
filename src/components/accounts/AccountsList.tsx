'use client';

import { useState, useEffect } from 'react';
import AccountCard from './AccountCard';
import { Account } from '@/types/accounts';
import { fetchUserAccounts } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountsList({ refreshTrigger, onAccountsChanged }: { refreshTrigger: number, onAccountsChanged: () => void }) {
  const [accountsByType, setAccountsByType] = useState<Record<string, Account[]>>({});
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user, refreshTrigger]);

  async function loadAccounts() {
    if (!user) return;
    try {
      console.log('Loading accounts...');
      const fetchedAccounts = await fetchUserAccounts(user.id);
      console.log('Fetched accounts:', fetchedAccounts);
      const grouped = fetchedAccounts.reduce((acc, account) => {
        if (!acc[account.type]) {
          acc[account.type] = [];
        }
        acc[account.type].push(account);
        return acc;
      }, {} as Record<string, Account[]>);
      setAccountsByType(grouped);
      console.log('Grouped accounts:', grouped);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  }

  const handleAccountChange = () => {
    console.log('Account changed, triggering refresh');
    onAccountsChanged();
    loadAccounts();
  };

  return (
    <div className="space-y-4">
      {Object.entries(accountsByType).map(([type, accounts]) => (
        <AccountCard 
          key={type}
          type={type}
          accounts={accounts}
          onAccountsChanged={handleAccountChange}
        />
      ))}
    </div>
  );
}