'use client';

import { useState } from 'react';
import AccountCard from './AccountCard';
import { Account } from '@/types/accounts';
import AddSubAccountModal from './AddSubAccountModal';

// Temporary mock data
const initialAccounts: Account[] = [
  {
    id: 1,
    name: "Cash",
    type: "Asset",
    balance: 160495.28,
    subAccounts: [
      { id: 11, name: "Checking", type: "Cash", balance: 130357.28 },
      { id: 12, name: "Savings", type: "Cash", balance: 30138.00 },
    ]
  },
  {
    id: 2,
    name: "Investments",
    type: "Asset",
    balance: 390000.00,
    subAccounts: [
      { id: 21, name: "401k", type: "Investments", balance: 180000.00 },
      { id: 22, name: "IRA", type: "Investments", balance: 200000.00 },
      { id: 23, name: "Brokerage", type: "Investments", balance: 10000.00 },
    ]
  },
  // Add other top-level categories as needed
];

export default function AccountsList() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<number | null>(null);

  const handleAddSubAccount = (parentId: number) => {
    setSelectedParentId(parentId);
    setIsModalOpen(true);
  };

  const addSubAccount = (subAccount: Omit<Account, 'id'>) => {
    setAccounts(prevAccounts => {
      return prevAccounts.map(account => {
        if (account.id === selectedParentId) {
          return {
            ...account,
            subAccounts: [
              ...(account.subAccounts || []),
              { ...subAccount, id: Date.now() } // Use a proper ID generation method in production
            ]
          };
        }
        return account;
      });
    });
    setIsModalOpen(false);
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