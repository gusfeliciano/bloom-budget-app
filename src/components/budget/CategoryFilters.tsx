import React from 'react';
import { Button } from '@/components/ui/button';

export default function CategoryFilters() {
  return (
    <div className="flex space-x-2 mb-4">
      <Button variant="secondary" className="bg-blue-100 text-blue-700">All</Button>
      <Button variant="outline" className="text-red-600">Overspent</Button>
      <Button variant="outline">Snoozed</Button>
      <Button variant="outline">Underfunded</Button>
      <Button variant="outline">Overfunded</Button>
      <Button variant="outline">Money Available</Button>
    </div>
  );
}