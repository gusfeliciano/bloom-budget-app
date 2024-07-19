'use client';

import { useState } from 'react';
import { TransactionCategory, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryManagerProps {
  categories: TransactionCategory[];
  onCategoryChange: () => void;
  userId: string;
}

export default function CategoryManager({ categories, onCategoryChange, userId }: CategoryManagerProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    await createCategory(
        userId,
        newCategoryName,
        selectedParentId ? parseInt(selectedParentId) : null
      );
    setNewCategoryName('');
    setSelectedParentId(null);
    onCategoryChange();
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    
    await updateCategory(editingCategory.id, {
      name: editingCategory.name,
      parent_id: editingCategory.parent_id
    });
    setEditingCategory(null);
    onCategoryChange();
  };

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      await deleteCategory(id);
      onCategoryChange();
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Manage Categories</h2>
      <div className="flex space-x-2">
        <Input
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="New category name"
        />
        <Select onValueChange={setSelectedParentId} value={selectedParentId || undefined}>
          <SelectTrigger>
            <SelectValue placeholder="Parent category (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No parent</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddCategory}>Add Category</Button>
      </div>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id} className="flex items-center space-x-2">
            {editingCategory?.id === category.id ? (
              <>
                <Input
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
                <Select
                  onValueChange={(value) => setEditingCategory({ ...editingCategory, parent_id: value === 'none' ? null : parseInt(value) })}
                  value={editingCategory.parent_id?.toString() || 'none'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent</SelectItem>
                    {categories
                      .filter((c) => c.id !== category.id)
                      .map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleUpdateCategory}>Save</Button>
                <Button onClick={() => setEditingCategory(null)} variant="outline">Cancel</Button>
              </>
            ) : (
              <>
                <span>{category.name}</span>
                {category.parent_id && (
                  <span className="text-sm text-gray-500">
                    (Child of {categories.find((c) => c.id === category.parent_id)?.name})
                  </span>
                )}
                <Button onClick={() => setEditingCategory(category)} variant="outline">Edit</Button>
                <Button onClick={() => handleDeleteCategory(category.id)} variant="destructive">Delete</Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}