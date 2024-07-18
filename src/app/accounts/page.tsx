'use client';

import { useState } from 'react';
import AccountsList from '@/components/accounts/AccountsList';
import AddAccountForm from '@/components/accounts/AddAccountForm';

export default function AccountsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAccountAdded = () => {
    console.log('Account added, triggering refresh');
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Accounts</h1>
      <div className="space-y-6">
        <AccountsList refreshTrigger={refreshTrigger} />
        <AddAccountForm onAccountAdded={handleAccountAdded} />
      </div>
    </div>
  );
}