
import React from 'react';
import TaskForm from '@/components/TaskForm';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Save, CalendarClock } from 'lucide-react';

const AddTask = () => {
  return (
    <div className="max-w-2xl mx-auto pb-16 md:pb-0 animate-fade-in">
      <TaskForm />
    </div>
  );
};

export default AddTask;
