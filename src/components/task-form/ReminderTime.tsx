
import React from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReminderTimeProps {
  reminderTime: string;
  onReminderTimeChange: (time: string) => void;
}

export const ReminderTime: React.FC<ReminderTimeProps> = ({ 
  reminderTime, 
  onReminderTimeChange 
}) => {
  // Generate time options in 30-minute increments
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of [0, 30]) {
        const hourStr = hour.toString().padStart(2, '0');
        const minStr = minute.toString().padStart(2, '0');
        const timeValue = `${hourStr}:${minStr}`;
        
        // Format for display (12-hour format)
        let displayHour = hour % 12;
        if (displayHour === 0) displayHour = 12;
        const ampm = hour < 12 ? 'AM' : 'PM';
        const displayValue = `${displayHour}:${minStr} ${ampm}`;
        
        options.push({ value: timeValue, display: displayValue });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="space-y-2">
      <Label htmlFor="reminderTime">Reminder Time</Label>
      <div className="relative">
        <Select
          value={reminderTime}
          onValueChange={onReminderTimeChange}
        >
          <SelectTrigger className="w-full pl-10">
            <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {timeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
