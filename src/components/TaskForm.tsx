import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTasks, TaskCategory, RecurrencePattern, TaskPriority } from '@/contexts/TaskContext';
import { toast } from 'sonner';
import { TaskFormProps } from '@/types/task';
import { DatePicker } from './task-form/DatePicker';
import { ReminderTime } from './task-form/ReminderTime';
import { CategorySelect } from './task-form/CategorySelect';
import { PrioritySelect } from './task-form/PrioritySelect';
import { RecurrenceSelect } from './task-form/RecurrenceSelect';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Save, CalendarClock } from 'lucide-react';

// Helper function to check if a date is today
const isDateToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() && 
          date.getMonth() === today.getMonth() && 
          date.getFullYear() === today.getFullYear();
};

// Helper function to check if a time is in the past
const isTimeInPast = (timeStr: string): boolean => {
  const now = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  if (isNaN(hours) || isNaN(minutes)) {
    return false;
  }
  
  const selectedTime = new Date();
  selectedTime.setHours(hours, minutes, 0, 0);
  
  return selectedTime < now;
};

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, editTask }) => {
  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [date, setDate] = useState<Date | undefined>(editTask?.date || new Date());
  const [reminderTime, setReminderTime] = useState(editTask?.startTime || '');
  const [category, setCategory] = useState<TaskCategory>(editTask?.category || 'Work');
  const [recurrence, setRecurrence] = useState<RecurrencePattern>(editTask?.recurrence || 'none');
  const [selectedDays, setSelectedDays] = useState<string[]>(editTask?.selectedDays || []);
  const [priority, setPriority] = useState<TaskPriority>(editTask?.priority || 'Medium');
  const [mode, setMode] = useState<'save' | 'schedule'>('save');
  
  const { addTask, updateTask } = useTasks();
  const navigate = useNavigate();

  // Check if form is valid based on required fields and mode
  const isFormValid = 
    title.trim() !== '' && 
    (mode !== 'schedule' || (date !== undefined && reminderTime !== '')) &&
    (recurrence !== 'weekly' || selectedDays.length > 0) &&
    // Add check to prevent scheduling tasks with past times
    !(mode === 'schedule' && date && isDateToday(date) && isTimeInPast(reminderTime));

  // Set default day selection when recurrence is changed to weekly
  useEffect(() => {
    if (recurrence === 'weekly' && selectedDays.length === 0) {
      const today = new Date().getDay();
      const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      setSelectedDays([dayMap[today]]);
    }
  }, [recurrence, selectedDays]);

  // Add effect to check for past times when date is changed to today
  useEffect(() => {
    if (mode === 'schedule' && date && isDateToday(date) && reminderTime && isTimeInPast(reminderTime)) {
      toast.warning('The selected time has already passed for today. Please select a future time.');
    }
  }, [date, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    if (mode === 'schedule') {
      if (!date) {
        toast.error('Please select a date');
        return;
      }
      
      if (!reminderTime) {
        toast.error('Please select a reminder time');
        return;
      }

      // Check if the time is in the past for today's date
      if (date && isDateToday(date) && isTimeInPast(reminderTime)) {
        toast.error('You cannot schedule a task for a time that has already passed. Please select a future time.');
        return;
      }
    }

    if (recurrence === 'weekly' && selectedDays.length === 0) {
      toast.error('Please select at least one day for weekly recurrence');
      return;
    }

    const taskData = {
      title,
      description,
      date: date ? date.toISOString() : new Date().toISOString(),
      startTime: reminderTime,
      endTime: '',
      category,
      recurrence,
      selectedDays: recurrence === 'weekly' ? selectedDays : [],
      priority
    };

    if (editTask) {
      updateTask(editTask.id, taskData);
      toast.success('Task updated successfully!');
    } else {
      addTask(taskData);
      toast.success('Task added successfully!');
    }
    
    // Reset form
    setTitle('');
    setDescription('');
    setDate(new Date());
    setReminderTime('');
    setCategory('Work');
    setRecurrence('none');
    setSelectedDays([]);
    setPriority('Medium');

    if (onSubmit) onSubmit();
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs 
        defaultValue="save" 
        className="w-full" 
        onValueChange={(value) => setMode(value as 'save' | 'schedule')}
      >
        <TabsList className="grid grid-cols-2 mb-6 w-full">
          <TabsTrigger value="save" className="flex items-center gap-2">
            <Save size={16} /> Save Task
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <CalendarClock size={16} /> Schedule Task
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input 
            id="title" 
            placeholder="Enter task title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            autoComplete="on"
            autoCapitalize="sentences"
            spellCheck="true"
            enterKeyHint="next"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea 
            id="description" 
            placeholder="Enter task description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            autoComplete="on"
            autoCapitalize="sentences"
            spellCheck="true"
            enterKeyHint="done"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CategorySelect category={category} onCategoryChange={setCategory} />
          <PrioritySelect priority={priority} onPriorityChange={setPriority} />
        </div>
      </div>

      {mode === 'schedule' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePicker date={date} onDateChange={setDate} />
            <ReminderTime 
              reminderTime={reminderTime} 
              onReminderTimeChange={setReminderTime}
              selectedDate={date}
            />
          </div>
          <RecurrenceSelect 
            recurrence={recurrence} 
            onRecurrenceChange={setRecurrence}
            selectedDays={selectedDays}
            onSelectedDaysChange={setSelectedDays}
          />
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full text-2xl font-bold font-caveat"
        disabled={!isFormValid}
      >
        {mode === 'save' ? 'Save itt' : 'Remind itt'}
      </Button>
    </form>
  );
};

export default TaskForm;
