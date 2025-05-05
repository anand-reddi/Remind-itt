
import React, { useState } from 'react';
import { useTasks, TaskCategory, TaskPriority, Task } from '@/contexts/TaskContext';
import { TaskCard } from '@/components/TaskCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Save, CalendarClock } from 'lucide-react';

type FilterOption = 'all' | TaskCategory | TaskPriority;
type TaskMode = 'saved' | 'scheduled';

const Recent = () => {
  const { tasks } = useTasks();
  const [filterType, setFilterType] = useState<'category' | 'priority'>('category');
  const [filterValue, setFilterValue] = useState<FilterOption>('all');
  const [taskMode, setTaskMode] = useState<TaskMode>('saved');
  
  // Sort tasks by date (most recent first)
  const sortedTasks = [...tasks].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Filter tasks based on selected mode
  const modeTasks = sortedTasks.filter((task) => {
    if (taskMode === 'saved') {
      return !task.startTime; // Tasks without start time are considered saved
    } else {
      return !!task.startTime; // Tasks with start time are considered scheduled
    }
  });
  
  // Filter tasks based on selected filter
  const filteredTasks = modeTasks.filter((task) => {
    if (filterValue === 'all') return true;
    
    if (filterType === 'category') {
      return task.category === filterValue;
    } else if (filterType === 'priority') {
      return task.priority === filterValue;
    }
    
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto pb-16 md:pb-0 animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Recent Tasks</h1>
      
      <Tabs defaultValue="saved" className="mb-6">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="saved" onClick={() => setTaskMode('saved')} className="flex items-center gap-2">
            <Save size={16} /> Saved
          </TabsTrigger>
          <TabsTrigger value="scheduled" onClick={() => setTaskMode('scheduled')} className="flex items-center gap-2">
            <CalendarClock size={16} /> Scheduled
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-end">
        <div className="space-y-2 w-full md:w-1/3">
          <Label htmlFor="filter-type">Filter By</Label>
          <Select
            value={filterType}
            onValueChange={(value) => {
              setFilterType(value as 'category' | 'priority');
              setFilterValue('all');
            }}
          >
            <SelectTrigger id="filter-type" className="w-full">
              <SelectValue placeholder="Select filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="category">Category</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2 w-full md:w-2/3">
          <Label htmlFor="filter-value">Select {filterType}</Label>
          <Select
            value={filterValue}
            onValueChange={(value) => setFilterValue(value as FilterOption)}
          >
            <SelectTrigger id="filter-value" className="w-full">
              <SelectValue placeholder={`Select ${filterType}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              
              {filterType === 'category' ? (
                <>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No tasks found with the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default Recent;
