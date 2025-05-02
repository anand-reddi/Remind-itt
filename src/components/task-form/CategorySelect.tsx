
import React from 'react';
import { TaskCategory } from '@/contexts/TaskContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CategorySelectProps {
  category: TaskCategory;
  onCategoryChange: (category: TaskCategory) => void;
}

export const CategorySelect: React.FC<CategorySelectProps> = ({ 
  category, 
  onCategoryChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="category">Category</Label>
      <Select 
        value={category} 
        onValueChange={(value) => onCategoryChange(value as TaskCategory)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Work">Work</SelectItem>
          <SelectItem value="Personal">Personal</SelectItem>
          <SelectItem value="Shopping">Shopping</SelectItem>
          <SelectItem value="Health">Health</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
