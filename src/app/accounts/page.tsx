'use client';

import { useState } from 'react';
import AccountsList from '@/components/accounts/AccountsList';
import AccountSummary from '@/components/accounts/AccountSummary';
import AddAccountForm from '@/components/accounts/AddAccountForm';

export default function AccountsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAccountsChanged = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Accounts</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <AccountsList 
            refreshTrigger={refreshTrigger} 
            onAccountsChanged={handleAccountsChanged} 
          />
          <AddAccountForm onAccountAdded={handleAccountsChanged} />
        </div>
        <div>
          <AccountSummary refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
}