
import React from 'react';
import { TaskPriority } from '@/contexts/TaskContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
      <Select 
        value={priority} 
        onValueChange={(value) => onPriorityChange(value as TaskPriority)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select priority level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="High">High</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="Low">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
