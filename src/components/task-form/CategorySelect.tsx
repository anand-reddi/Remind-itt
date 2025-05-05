
import React from 'react';
import { TaskCategory } from '@/contexts/TaskContext';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { BriefcaseBusiness, User, ShoppingCart, Heart } from 'lucide-react';

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
      <ToggleGroup 
        type="single" 
        value={category}
        onValueChange={(value) => {
          if (value) onCategoryChange(value as TaskCategory);
        }}
        className="flex justify-between w-full"
        id="category"
      >
        <ToggleGroupItem value="Work" className="flex-1 flex flex-col items-center py-1.5" aria-label="Work">
          <BriefcaseBusiness size={18} className="mb-1" />
          <span className="text-xs">Work</span>
        </ToggleGroupItem>
        
        <ToggleGroupItem value="Personal" className="flex-1 flex flex-col items-center py-1.5" aria-label="Personal">
          <User size={18} className="mb-1" />
          <span className="text-xs">Personal</span>
        </ToggleGroupItem>
        
        <ToggleGroupItem value="Shopping" className="flex-1 flex flex-col items-center py-1.5" aria-label="Shopping">
          <ShoppingCart size={18} className="mb-1" />
          <span className="text-xs">Shopping</span>
        </ToggleGroupItem>
        
        <ToggleGroupItem value="Health" className="flex-1 flex flex-col items-center py-1.5" aria-label="Health">
          <Heart size={18} className="mb-1" />
          <span className="text-xs">Health</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
