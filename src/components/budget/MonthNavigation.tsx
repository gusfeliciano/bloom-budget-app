import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MonthNavigationProps {
  currentMonth: string;
  onMonthChange: (newMonth: string) => void;
}

export default function MonthNavigation({ currentMonth, onMonthChange }: MonthNavigationProps) {
  const date = new Date(currentMonth);

  const handlePrevMonth = () => {
    date.setMonth(date.getMonth() - 1);
    onMonthChange(date.toISOString().slice(0, 7));
  };

  const handleNextMonth = () => {
    date.setMonth(date.getMonth() + 1);
    onMonthChange(date.toISOString().slice(0, 7));
  };

  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-lg font-semibold">
        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </span>
      <Button variant="ghost" size="icon" onClick={handleNextMonth}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}