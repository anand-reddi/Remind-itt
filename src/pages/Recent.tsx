import React, { useState } from 'react';
import { useTasks, TaskCategory, TaskPriority, Task } from '@/contexts/TaskContext';
import { SimpleTaskCard } from '@/components/SimpleTaskCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Save, CalendarClock } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';
import { subDays, addDays, isAfter, isBefore, isWithinInterval } from 'date-fns';

type FilterOption = 'all' | TaskCategory | TaskPriority;
type TaskMode = 'saved' | 'scheduled';

const Recent = () => {
  const { tasks } = useTasks();
  const [filterType, setFilterType] = useState<'category' | 'priority'>('category');
  const [filterValue, setFilterValue] = useState<FilterOption>('all');
  const [taskMode, setTaskMode] = useState<TaskMode>('saved');
  
  const today = new Date();
  
  // Different date ranges based on task mode
  const oneWeekAgo = subDays(today, 7);
  const twoDaysAgo = subDays(today, 2);
  const twoDaysFromNow = addDays(today, 2);
  
  // Filter tasks based on date range and sort by most recent first
  const filteredByDateTasks = tasks
    .filter(task => {
      const taskDate = new Date(task.date);
      
      if (taskMode === 'saved') {
        // For saved tasks - show last week only
        return isAfter(taskDate, oneWeekAgo);
      } else {
        // For scheduled tasks - show 2 days before and 2 days after today
        return isWithinInterval(taskDate, {
          start: twoDaysAgo,
          end: twoDaysFromNow
        });
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Filter tasks based on selected mode
  const modeTasks = filteredByDateTasks.filter((task) => {
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

  const getDateRangeText = () => {
    if (taskMode === 'saved') {
      return 'in the last week';
    } else {
      return 'in the -2 to +2 day range';
    }
  };

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
      
      <div className="mb-6 space-y-4">
        <div className="space-y-2 w-full">
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
        
        <div className="space-y-2 w-full">
          <Label htmlFor="filter-value">Select {filterType}</Label>
          
          {filterType === 'category' ? (
            <ToggleGroup 
              type="single" 
              value={filterValue}
              onValueChange={(value) => {
                if (value) setFilterValue(value as FilterOption);
              }}
              className="flex justify-between w-full"
            >
              <ToggleGroupItem value="all" className="flex-1 text-center py-2">
                All
              </ToggleGroupItem>
              <ToggleGroupItem value="Work" className="flex-1 text-center py-2">
                Work
              </ToggleGroupItem>
              <ToggleGroupItem value="Personal" className="flex-1 text-center py-2">
                Personal
              </ToggleGroupItem>
              <ToggleGroupItem value="Shopping" className="flex-1 text-center py-2">
                Shopping
              </ToggleGroupItem>
              <ToggleGroupItem value="Health" className="flex-1 text-center py-2">
                Health
              </ToggleGroupItem>
            </ToggleGroup>
          ) : (
            <ToggleGroup 
              type="single" 
              value={filterValue}
              onValueChange={(value) => {
                if (value) setFilterValue(value as FilterOption);
              }}
              className="flex justify-between w-full"
            >
              <ToggleGroupItem value="all" className="flex-1 text-center py-2">
                All
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="High" 
                className="flex-1 text-center py-2 data-[state=on]:bg-red-100 data-[state=on]:text-red-700"
              >
                <div className="flex flex-col items-center">
                  <ArrowUp size={10} className="mb-0.5" />
                  <span className="text-xs">High</span>
                </div>
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="Medium" 
                className="flex-1 text-center py-2 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700"
              >
                <div className="flex flex-col items-center">
                  <ArrowRight size={10} className="mb-0.5" />
                  <span className="text-xs">Medium</span>
                </div>
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="Low" 
                className="flex-1 text-center py-2 data-[state=on]:bg-green-100 data-[state=on]:text-green-700"
              >
                <div className="flex flex-col items-center">
                  <ArrowDown size={10} className="mb-0.5" />
                  <span className="text-xs">Low</span>
                </div>
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <SimpleTaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No tasks found {getDateRangeText()} with the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default Recent;
