
import React, { useState, useEffect } from 'react';
import { RecurrencePattern } from '@/contexts/TaskContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface RecurrenceSelectProps {
  recurrence: RecurrencePattern;
  onRecurrenceChange: (recurrence: RecurrencePattern) => void;
  selectedDays?: string[];
  onSelectedDaysChange?: (days: string[]) => void;
}

export const RecurrenceSelect: React.FC<RecurrenceSelectProps> = ({ 
  recurrence, 
  onRecurrenceChange,
  selectedDays = [],
  onSelectedDaysChange
}) => {
  const daysOfWeek = [
    { value: 'SUN', label: 'S' },
    { value: 'MON', label: 'M' },
    { value: 'TUE', label: 'T' },
    { value: 'WED', label: 'W' },
    { value: 'THU', label: 'T' },
    { value: 'FRI', label: 'F' },
    { value: 'SAT', label: 'S' }
  ];

  const [localSelectedDays, setLocalSelectedDays] = useState<string[]>(selectedDays);

  useEffect(() => {
    setLocalSelectedDays(selectedDays);
  }, [selectedDays]);

  const handleDayToggle = (day: string) => {
    const updatedDays = localSelectedDays.includes(day)
      ? localSelectedDays.filter(d => d !== day)
      : [...localSelectedDays, day];
    
    setLocalSelectedDays(updatedDays);
    if (onSelectedDaysChange) {
      onSelectedDaysChange(updatedDays);
    }
  };

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

      {recurrence === 'weekly' && (
        <div className="mt-3">
          <Label className="mb-2 block">Repeat on</Label>
          <div className="flex gap-1 justify-between">
            {daysOfWeek.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayToggle(day.value)}
                className={`w-8 h-8 rounded-full text-xs font-medium flex items-center justify-center transition-colors
                  ${localSelectedDays.includes(day.value) 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground hover:bg-primary/20'
                  }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
