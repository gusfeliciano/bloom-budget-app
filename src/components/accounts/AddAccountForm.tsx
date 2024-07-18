'use client';

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp } from 'lucide-react'
import { createUserAccount } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function AddAccountForm({ onAccountAdded }: { onAccountAdded: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [accountName, setAccountName] = useState('')
  const [accountType, setAccountType] = useState('')
  const [balance, setBalance] = useState('')
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted', { accountName, accountType, balance });
    if (!user) {
      console.error('User not authenticated');
      return;
    }
    try {
      console.log('Attempting to create user account', { userId: user.id, accountName, accountType, balance });
      const newAccount = await createUserAccount(user.id, {
        name: accountName,
        type: accountType,
        balance: parseFloat(balance),
      });
      console.log('Account created successfully', newAccount);
      // Reset form
      setAccountName('')
      setAccountType('')
      setBalance('')
      setIsExpanded(false)
      onAccountAdded();
    } catch (error) {
      console.error('Failed to add account:', error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>Add New Account</span>
          {isExpanded ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="accountType">Account Type</Label>
              <Input
                id="accountType"
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="balance">Initial Balance</Label>
              <Input
                id="balance"
                type="number"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-between">
              <Button type="submit">Add Account</Button>
              <Button type="button" variant="outline" onClick={() => setIsExpanded(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      )}
    </Card>
  )
}