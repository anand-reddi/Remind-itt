
import React from 'react';
import { RecurrencePattern } from '@/contexts/TaskContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface RecurrenceSelectProps {
  recurrence: RecurrencePattern;
  onRecurrenceChange: (recurrence: RecurrencePattern) => void;
}

export const RecurrenceSelect: React.FC<RecurrenceSelectProps> = ({ 
  recurrence, 
  onRecurrenceChange 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="recurrence">Recurrence</Label>
      <Select 
        value={recurrence} 
        onValueChange={(value) => onRecurrenceChange(value as RecurrencePattern)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select recurrence pattern" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None (One-time)</SelectItem>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
