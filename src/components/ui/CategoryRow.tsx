import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { BudgetCategory, ParentCategory } from '@/types/budget';

interface CategoryRowProps {
  category: BudgetCategory | ParentCategory;
  isParent: boolean;
  onEdit: (id: number, newName: string) => void;
  onDelete: (id: number) => void;
  onBudgetChange?: (id: number, value: number) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ 
  category, 
  isParent, 
  onEdit, 
  onDelete, 
  onBudgetChange,
  isExpanded,
  onToggleExpand
}) => {
  const [editedBudget, setEditedBudget] = useState(category.budget);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedBudget(parseFloat(e.target.value) || 0);
  };

  const handleBudgetBlur = () => {
    setIsEditing(false);
    if (onBudgetChange) {
      onBudgetChange(category.id, editedBudget);
    }
  };

  const handleBudgetKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleBudgetBlur();
    }
  };

  return (
    <div className={`grid grid-cols-4 gap-4 items-center py-1 ${isParent ? 'bg-gray-100 font-semibold' : 'pl-8'}`}>
      <div className="flex items-center space-x-2">
        {isParent && (
          <button onClick={onToggleExpand} className="w-4">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        <span>{category.name}</span>
      </div>
      {isParent ? (
        <div className="text-right">${category.budget.toFixed(2)}</div>
      ) : (
        <div className="text-right">
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              value={editedBudget}
              onChange={handleBudgetChange}
              onBlur={handleBudgetBlur}
              onKeyDown={handleBudgetKeyDown}
              className="text-right w-full px-1 py-0.5 border rounded"
              step="0.01"
            />
          ) : (
            <span onClick={() => setIsEditing(true)} className="cursor-pointer">
              ${editedBudget.toFixed(2)}
            </span>
          )}
        </div>
      )}
      <div className="text-right">${category.activity.toFixed(2)}</div>
      <div className={`text-right ${category.remaining < 0 ? 'text-red-500' : 'text-green-500'}`}>
        ${category.remaining.toFixed(2)}
      </div>
    </div>
  );
};

export default CategoryRow;