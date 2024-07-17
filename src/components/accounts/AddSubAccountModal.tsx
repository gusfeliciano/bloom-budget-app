'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AddSubAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSubAccount: (subAccount: { name: string; type: string; balance: number }) => void;
}

export default function AddSubAccountModal({ isOpen, onClose, onAddSubAccount }: AddSubAccountModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [balance, setBalance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSubAccount({
      name,
      type,
      balance: parseFloat(balance),
    });
    setName('');
    setType('');
    setBalance('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Sub-Account</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="type">Account Type</Label>
            <Input
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
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
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Sub-Account</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}