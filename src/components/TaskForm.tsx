
import React, { useState } from 'react';
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

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, editTask }) => {
  const [title, setTitle] = useState(editTask?.title || '');
  const [description, setDescription] = useState(editTask?.description || '');
  const [date, setDate] = useState<Date | undefined>(editTask?.date || new Date());
  const [reminderTime, setReminderTime] = useState(editTask?.startTime || '');
  const [category, setCategory] = useState<TaskCategory>(editTask?.category || 'Work');
  const [recurrence, setRecurrence] = useState<RecurrencePattern>(editTask?.recurrence || 'none');
  const [priority, setPriority] = useState<TaskPriority>(editTask?.priority || 'Medium');
  
  const { addTask, updateTask } = useTasks();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    if (!date) {
      toast.error('Please select a date');
      return;
    }

    const taskData = {
      title,
      description,
      date: date.toISOString(),
      startTime: reminderTime,
      endTime: '',
      category,
      recurrence,
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
    setPriority('Medium');

    if (onSubmit) onSubmit();
    navigate('/');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Task Title</Label>
        <Input 
          id="title" 
          placeholder="Enter task title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea 
          id="description" 
          placeholder="Enter task description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DatePicker date={date} onDateChange={setDate} />
        <CategorySelect category={category} onCategoryChange={setCategory} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReminderTime 
          reminderTime={reminderTime} 
          onReminderTimeChange={setReminderTime} 
        />
        <PrioritySelect priority={priority} onPriorityChange={setPriority} />
      </div>

      <RecurrenceSelect recurrence={recurrence} onRecurrenceChange={setRecurrence} />

      <Button type="submit" className="w-full">
        {editTask ? 'Update Task' : 'Add Task'}
      </Button>
    </form>
  );
};

export default TaskForm;
