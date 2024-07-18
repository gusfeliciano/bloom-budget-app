'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Account } from '@/types/accounts';

interface AccountCardProps {
  type: string;
  accounts: Account[];
}

export default function AccountCard({ type, accounts }: AccountCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <Card className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{type}</CardTitle>
        <div className="flex items-center">
          <span className="mr-2">${totalBalance.toFixed(2)}</span>
          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {accounts.map(account => (
            <div key={account.id} className="flex justify-between mt-2">
              <span>{account.name}</span>
              <span>${account.balance.toFixed(2)}</span>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}