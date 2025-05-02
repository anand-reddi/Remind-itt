
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
  return (
    <div className="space-y-2">
      <Label htmlFor="reminderTime">Reminder Time</Label>
      <div className="relative">
        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          id="reminderTime" 
          type="time" 
          value={reminderTime} 
          onChange={(e) => onReminderTimeChange(e.target.value)} 
          className="pl-10"
        />
      </div>
    </div>
  );
};
