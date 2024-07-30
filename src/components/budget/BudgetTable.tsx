import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { BudgetData, ParentCategory } from '@/types/budget';
import CategoryRow from '@/components/ui/CategoryRow';

interface BudgetTableProps {
  budget: BudgetData;
  onBudgetChange: (parentId: number, childId: number, value: number) => void;
  onCategoryNameUpdate: (categoryId: number, newName: string) => void;
  onCategoryDelete: (categoryId: number) => void;
  onDragEnd: (result: DropResult) => void;
}

export default function BudgetTable({ 
  budget, 
  onBudgetChange, 
  onCategoryNameUpdate, 
  onCategoryDelete, 
  onDragEnd 
}: BudgetTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="budget-categories">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {budget.map((category, index) => (
              <Draggable key={category.id} draggableId={category.id.toString()} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-1"
                  >
                    <CategoryRow
                      category={category}
                      isParent={true}
                      onEdit={onCategoryNameUpdate}
                      onDelete={onCategoryDelete}
                      isExpanded={expandedCategories.has(category.id)}
                      onToggleExpand={() => toggleCategory(category.id)}
                    />
                    {expandedCategories.has(category.id) && category.children.map((childCategory) => (
                      <CategoryRow
                        key={childCategory.id}
                        category={childCategory}
                        isParent={false}
                        onEdit={onCategoryNameUpdate}
                        onDelete={onCategoryDelete}
                        onBudgetChange={(id, value) => onBudgetChange(category.id, id, value)}
                      />
                    ))}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}