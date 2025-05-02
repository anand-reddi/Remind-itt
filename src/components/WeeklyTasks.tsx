
import React, { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { Task, useTasks } from '@/contexts/TaskContext';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

export function WeeklyTasks() {
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Functions to navigate between weeks
  const goToPreviousWeek = () => {
    setCurrentDate(prevDate => subWeeks(prevDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentDate(prevDate => addWeeks(prevDate, 1));
  };
  
  // Get start of the selected week
  const startDay = startOfWeek(currentDate);
  
  // Generate array of days for the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => ({
    date: addDays(startDay, i),
    formattedDate: format(addDays(startDay, i), 'yyyy-MM-dd'),
    day: format(addDays(startDay, i), 'EEE'),
    dayNumber: format(addDays(startDay, i), 'd')
  }));
  
  // Group tasks by date
  const tasksByDate: Record<string, Task[]> = {};
  
  weekDays.forEach(day => {
    tasksByDate[day.formattedDate] = tasks.filter(task => 
      task.date.startsWith(day.formattedDate)
    );
  });

  return (
    <div className="animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <CalendarDays className="mr-2 h-5 w-5" />
          <h2 className="text-xl font-bold">Weekly View</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-4 mb-6">
        {weekDays.map((day, index) => {
          const isToday = isSameDay(new Date(), day.date);
          return (
            <div key={index} className="text-center">
              <div className="text-sm text-muted-foreground">{day.day}</div>
              <div className={`text-lg font-medium rounded-full w-8 h-8 mx-auto flex items-center justify-center ${
                isToday ? 'bg-primary text-primary-foreground' : ''
              }`}>
                {day.dayNumber}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="space-y-4">
        {weekDays.map((day, index) => {
          const dayTasks = tasksByDate[day.formattedDate] || [];
          return (
            <div key={index} className="rounded-lg border p-3 shadow-sm">
              <h3 className="font-semibold mb-2">
                {format(day.date, 'EEEE, MMMM d')}
                <span className="text-muted-foreground ml-2">
                  ({dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''})
                </span>
              </h3>
              
              {dayTasks.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {dayTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No tasks for this day
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
