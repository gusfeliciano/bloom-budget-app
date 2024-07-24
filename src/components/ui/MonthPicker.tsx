import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MonthPicker({ value, onChange }: MonthPickerProps) {
  const currentDate = new Date(value + "-01");
  const currentYear = currentDate.getFullYear();

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const handleMonthClick = (monthIndex: number) => {
    const newDate = new Date(currentYear, monthIndex);
    onChange(newDate.toISOString().slice(0, 7));
  };

  const handleYearChange = (increment: number) => {
    const newDate = new Date(currentDate.setFullYear(currentYear + increment));
    onChange(newDate.toISOString().slice(0, 7));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2">
          <div className="flex justify-between items-center mb-2">
            <Button size="sm" variant="outline" onClick={() => handleYearChange(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-semibold">{currentYear}</span>
            <Button size="sm" variant="outline" onClick={() => handleYearChange(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => (
              <Button
                key={month}
                size="sm"
                variant={currentDate.getMonth() === index ? "default" : "outline"}
                onClick={() => handleMonthClick(index)}
              >
                {month}
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}