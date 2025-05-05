
import React from 'react';
import { TaskPriority } from '@/contexts/TaskContext';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface PrioritySelectProps {
  priority: TaskPriority;
  onPriorityChange: (priority: TaskPriority) => void;
}

export const PrioritySelect: React.FC<PrioritySelectProps> = ({ 
  priority, 
  onPriorityChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="priority">Priority</Label>
      <ToggleGroup 
        type="single" 
        value={priority}
        onValueChange={(value) => {
          if (value) onPriorityChange(value as TaskPriority);
        }}
        className="flex justify-between w-full"
        id="priority"
      >
        <ToggleGroupItem 
          value="High" 
          className="flex-1 text-center py-1.5 data-[state=on]:bg-red-100 data-[state=on]:text-red-700" 
          aria-label="High priority"
        >
          High
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value="Medium" 
          className="flex-1 text-center py-1.5 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700" 
          aria-label="Medium priority"
        >
          Medium
        </ToggleGroupItem>
        
        <ToggleGroupItem 
          value="Low" 
          className="flex-1 text-center py-1.5 data-[state=on]:bg-green-100 data-[state=on]:text-green-700" 
          aria-label="Low priority"
        >
          Low
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};
