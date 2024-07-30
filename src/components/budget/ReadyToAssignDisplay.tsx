import React from 'react';
import { Button } from '@/components/ui/button';

interface ReadyToAssignDisplayProps {
  amount: number;
}

export default function ReadyToAssignDisplay({ amount }: ReadyToAssignDisplayProps) {
  return (
    <div className="flex items-center space-x-2 bg-green-100 p-2 rounded-md">
      <div>
        <div className="text-sm font-medium text-green-800">Ready to Assign</div>
        <div className="text-2xl font-bold text-green-700">${amount.toFixed(2)}</div>
      </div>
      <Button variant="outline" className="text-green-700 border-green-700">
        Assign
      </Button>
    </div>
  );
}