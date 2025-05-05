import React from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ReminderTimeProps {
  reminderTime: string;
  onReminderTimeChange: (time: string) => void;
}

export const ReminderTime: React.FC<ReminderTimeProps> = ({ 
  reminderTime, 
  onReminderTimeChange 
}) => {
  // Convert HH:MM to HH:MM format needed for time input
  const formatTimeForInput = (time: string): string => {
    if (!time) return '';
    return time;
  };

  // Format the time for display (12-hour format)
  const formatDisplayTime = (timeValue: string): string => {
    if (!timeValue) return "";
    
    const [hours, minutes] = timeValue.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return "";
    
    let displayHour = hours % 12;
    if (displayHour === 0) displayHour = 12;
    const ampm = hours < 12 ? 'AM' : 'PM';
    
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Handle time input change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    onReminderTimeChange(newTime);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="reminderTime">Reminder Time</Label>
      <div className="relative">
        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          id="reminderTime"
          type="time"
          className="pl-10"
          value={formatTimeForInput(reminderTime)}
          onChange={handleTimeChange}
        />
        {reminderTime && (
          <div className="text-xs text-muted-foreground mt-1 ml-1">
            Time set: {formatDisplayTime(reminderTime)}
          </div>
        )}
      </div>
    </div>
  );
};
