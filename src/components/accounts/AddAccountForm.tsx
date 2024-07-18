'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { createUserAccount } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const accountTypes = [
  "Checking",
  "Savings",
  "Credit Card",
  "Investment",
  "Loan",
  "Other"
];

export default function AddAccountForm({ onAccountAdded }: { onAccountAdded: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState(accountTypes[0]);
  const [balance, setBalance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('User not authenticated');
      return;
    }
    
    // Validation
    if (accountName.trim().length === 0) {
      toast.error('Account name cannot be empty');
      return;
    }
    
    const balanceNum = parseFloat(balance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      toast.error('Balance must be a non-negative number');
      return;
    }

    setIsLoading(true);
    try {
      await createUserAccount(user.id, {
        name: accountName.trim(),
        type: accountType,
        balance: balanceNum,
      });
      // Reset form and notify parent
      setAccountName('');
      setAccountType(accountTypes[0]);
      setBalance('');
      setIsExpanded(false);
      onAccountAdded();
    } catch (error) {
      console.error('Failed to add account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span>Add New Account</span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
              <Select onValueChange={setAccountType} defaultValue={accountType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="balance">Initial Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
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
  );
}