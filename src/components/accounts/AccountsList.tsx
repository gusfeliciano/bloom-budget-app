'use client';

import { useState, useEffect } from 'react';
import AccountCard from './AccountCard';
import { Account } from '@/types/accounts';
import AddSubAccountModal from './AddSubAccountModal';
import { fetchUserAccounts, addAccount } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('Loading accounts');
      loadAccounts();
    }
  }, [user]);

  async function loadAccounts() {
    if (!user) return;
    try {
      const fetchedAccounts = await fetchUserAccounts(user.id);
      const structuredAccounts = structureAccounts(fetchedAccounts);
      setAccounts(structuredAccounts);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    }
  }

      function structureAccounts(flatAccounts: Account[]): Account[] {
        const accountMap = new Map<number, Account>();
        const topLevelAccounts: Account[] = [];
    
        flatAccounts.forEach(account => {
          account.subAccounts = [];
          accountMap.set(account.id, account);
        });
    
        flatAccounts.forEach(account => {
          if (account.parent_id) {
            const parentAccount = accountMap.get(account.parent_id);
            if (parentAccount) {
              parentAccount.subAccounts?.push(account);
            }
          } else {
            topLevelAccounts.push(account);
          }
        });
    
        return topLevelAccounts;
      }
  
    const handleAddSubAccount = (parentId: number) => {
    setSelectedParentId(parentId);
    setIsModalOpen(true);
  };

  const addSubAccount = async (subAccount: Omit<Account, 'id'>) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    try {
      const newSubAccount = await addAccount({ ...subAccount, parent_id: selectedParentId! }, user.id);
      setAccounts(prevAccounts => {
        return prevAccounts.map(account => {
          if (account.id === selectedParentId) {
            return {
              ...account,
              subAccounts: [...(account.subAccounts || []), newSubAccount]
            };
          }
          return account;
        });
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to add sub-account:', error);
    }
  };

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <AccountCard 
          key={account.id} 
          account={account}
          onAddSubAccount={handleAddSubAccount}
        />
      ))}
      <AddSubAccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSubAccount={addSubAccount}
      />
    </div>
  );
}