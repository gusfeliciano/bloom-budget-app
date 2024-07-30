import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCategory, updateCategory, TransactionCategory } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
  categories: TransactionCategory[];
  userId: string | undefined;
  editCategory?: TransactionCategory;
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onCategoryAdded,
  categories,
  userId,
  editCategory
}: CategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [parentId, setParentId] = useState<string>('none');
  const [categoryType, setCategoryType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    if (editCategory) {
      setCategoryName(editCategory.name);
      setParentId(editCategory.parent_id ? editCategory.parent_id.toString() : 'none');
      setCategoryType(editCategory.type);
    } else {
      setCategoryName('');
      setParentId('none');
      setCategoryType('expense');
    }
  }, [editCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('User ID is missing');
      return;
    }
  
    try {
      if (editCategory) {
        const updatedCategory = await updateCategory(editCategory.id, {
          name: categoryName,
          parent_id: parentId === 'none' ? null : parseInt(parentId),
          type: categoryType
        });
        if (updatedCategory) {
          toast.success('Category updated successfully');
        } else {
          throw new Error('Failed to update category');
        }
      } else {
        await createCategory(userId, categoryName, parentId === 'none' ? null : parseInt(parentId), categoryType);
        toast.success('Category added successfully');
      }
      onCategoryAdded();
      onClose();
    } catch (error) {
      console.error('Failed to add/update category:', error);
      toast.error('Failed to add/update category. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {editCategory ? 'Update the category details.' : 'Create a new category for organizing your transactions.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            required
          />
          <Select onValueChange={setParentId} value={parentId}>
            <SelectTrigger>
              <SelectValue placeholder="Parent Category (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Parent</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => setCategoryType(value as 'income' | 'expense')} value={categoryType}>
            <SelectTrigger>
              <SelectValue placeholder="Category Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit">{editCategory ? 'Update Category' : 'Add Category'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}