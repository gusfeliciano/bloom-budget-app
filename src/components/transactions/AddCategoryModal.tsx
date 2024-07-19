import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCategory, TransactionCategory } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void;
  categories: TransactionCategory[];
  userId: string | undefined;
}

export default function AddCategoryModal({
  isOpen,
  onClose,
  onCategoryAdded,
  categories,
  userId
}: AddCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [parentId, setParentId] = useState<string>('none');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('User ID is missing');
      return;
    }

    try {
      await createCategory(userId, categoryName, parentId === 'none' ? null : parseInt(parentId));
      toast.success('Category added successfully');
      onCategoryAdded();
      setCategoryName('');
      setParentId('none');
      onClose();
    } catch (error) {
      console.error('Failed to add category:', error);
      toast.error('Failed to add category. Please try again.');
    }
  };

  const parentCategories = categories.filter(c => c.parent_id === null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
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
              {parentCategories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">Add Category</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}