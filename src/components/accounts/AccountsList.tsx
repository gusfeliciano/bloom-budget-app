'use client';

import { useState, useEffect } from 'react';
import AccountCard from './AccountCard';
import { Account } from '@/types/accounts';
import AddSubAccountModal from './AddSubAccountModal';
import { fetchAccounts, addAccount, updateAccount, deleteAccount } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Temporary mock data
const initialAccounts: Account[] = [
  {
    id: 1,
    name: "Cash",
    type: "Asset",
    balance: 0.28,
    subAccounts: [
      { id: 11, name: "Checking", type: "Cash", balance: 130357.28 },
      { id: 12, name: "Savings", type: "Cash", balance: 30138.00 },
    ]
  },
  {
    id: 2,
    name: "Investments",
    type: "Asset",
    balance: 0.00,
    subAccounts: [
      { id: 21, name: "401k", type: "Investments", balance: 180000.00 },
      { id: 22, name: "IRA", type: "Investments", balance: 200000.00 },
      { id: 23, name: "Brokerage", type: "Investments", balance: 10000.00 },
    ]
  },
  // Add other top-level categories as needed
];

export default function AccountsList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      loadAccounts();
    }
  }, [user]);

  async function loadAccounts() {
    try {
      const fetchedAccounts = await fetchAccounts(user!.id);
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

  console.log("Current accounts state:", accounts);

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