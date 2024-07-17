'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { Account } from '@/types/accounts';
import { Button } from "@/components/ui/button";

interface AccountProps {
  account: Account;
  onAddSubAccount: (parentId: number) => void;
}

export default function AccountCard({ account, onAddSubAccount }: AccountProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card>
      <CardHeader 
        className="flex flex-row items-center justify-between cursor-pointer"
        onClick={toggleExpand}
      >
        <CardTitle>{account.name}</CardTitle>
        <div className="flex items-center">
          <span className="mr-2">${account.balance.toLocaleString()}</span>
          {account.subAccounts && (
            isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{account.type}</p>
        {isExpanded && account.subAccounts && (
          <div className="mt-4 space-y-2">
            {account.subAccounts.map(subAccount => (
              <div key={subAccount.id} className="pl-4 border-l-2">
                <p className="font-semibold">{subAccount.name}</p>
                <p className="text-sm">${subAccount.balance.toLocaleString()}</p>
              </div>
            ))}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                onAddSubAccount(account.id);
              }}
            >
              <Plus size={16} className="mr-2" />
              Add Sub-Account
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}