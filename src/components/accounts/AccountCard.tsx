import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Trash, Edit, Check } from 'lucide-react';
import { Account } from '@/types/accounts';
import { deleteUserAccount, updateUserAccount } from '@/lib/api';

interface AccountCardProps {
  type: string;
  accounts: Account[];
  onAccountsChanged: () => void;
}

export default function AccountCard({ type, accounts, onAccountsChanged }: AccountCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteUserAccount(id);
        console.log('Account deleted, triggering refresh');
        onAccountsChanged();
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, account: Account) => {
    e.stopPropagation();
    setEditingId(account.id);
    setEditName(account.name);
  };

  const handleSaveEdit = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await updateUserAccount(id, { name: editName });
      setEditingId(null);
      console.log('Account updated, triggering refresh');
      onAccountsChanged();
    } catch (error) {
      console.error('Failed to update account:', error);
    }
  };

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
            <div key={account.id} className="flex justify-between items-center mt-2">
              {editingId === account.id ? (
                <div className="flex items-center">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <Button variant="ghost" size="icon" onClick={(e) => handleSaveEdit(e, account.id)}>
                    <Check size={16} />
                  </Button>
                </div>
              ) : (
                <span>{account.name}</span>
              )}
              <div>
                <span className="mr-2">${account.balance.toFixed(2)}</span>
                <Button variant="ghost" size="icon" onClick={(e) => handleEdit(e, account)}>
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, account.id)}>
                  <Trash size={16} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      )}
    </Card>
  );
}