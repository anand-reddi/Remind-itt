import React, { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, isSameDay } from 'date-fns';
import { toast } from 'sonner';

interface ReminderTimeProps {
  reminderTime: string;
  onReminderTimeChange: (time: string) => void;
  selectedDate?: Date; // Add selected date prop to check against today
}

export const ReminderTime: React.FC<ReminderTimeProps> = ({ 
  reminderTime, 
  onReminderTimeChange,
  selectedDate = new Date()
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

  // Check if a time is in the past for today
  const isTimeInPast = (timeStr: string): boolean => {
    if (!timeStr || !isSameDay(selectedDate, new Date())) {
      return false; // Not for today, so not in the past
    }

    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return false;
    }
    
    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);
    
    return selectedTime < now;
  };

  // Handle time input change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    
    // Check if the new time is in the past for today
    if (isTimeInPast(newTime) && isSameDay(selectedDate, new Date())) {
      // Show a toast warning instead of changing the time
      toast.warning("The time you selected has already passed today");
    }
    
    // Always update the time value regardless
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
          className={`pl-10 ${isTimeInPast(reminderTime) ? 'border-red-500 focus:ring-red-500' : ''}`}
          value={formatTimeForInput(reminderTime)}
          onChange={handleTimeChange}
        />
        {reminderTime && (
          <div className="text-xs text-muted-foreground mt-1 ml-1">
            Time set: {formatDisplayTime(reminderTime)}
          </div>
        )}
        {isTimeInPast(reminderTime) && isSameDay(selectedDate, new Date()) && (
          <div className="text-xs text-red-500 mt-1 ml-1">
            Warning: The selected time has already passed today
          </div>
        )}
      </div>
    </div>
  );
};
