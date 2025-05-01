
import React, { useState } from 'react';
import { format, getDaysInMonth, startOfMonth, getDay, addDays, isToday, isSameDay } from 'date-fns';
import { Task, useTasks } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function MonthlyCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { tasks } = useTasks();

  const startOfCurrentMonth = startOfMonth(currentDate);
  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getDay(startOfCurrentMonth);

  // Generate array of days for the current month plus padding
  const daysArray = [...Array(startDay).fill(null), ...Array(daysInMonth).keys()].map((day, i) => {
    if (day === null) return null;
    return addDays(startOfCurrentMonth, day);
  });

  // Break days into week chunks
  const weeks = [];
  for (let i = 0; i < daysArray.length; i += 7) {
    weeks.push(daysArray.slice(i, i + 7));
  }

  // Previous and next month navigation
  const goToPrevMonth = () => {
    const prevMonth = new Date(currentDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentDate(prevMonth);
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentDate(nextMonth);
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date | null) => {
    if (!date) return [];
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return isSameDay(taskDate, date);
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-bold">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={goToPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Link to="/add">
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              <span>Add Reminder</span>
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="rounded-lg border shadow-sm">
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-center font-semibold">
              {day}
            </div>
          ))}
        </div>
        
        <div className="divide-y">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 divide-x">
              {week.map((day, dayIndex) => {
                const dayTasks = getTasksForDate(day);
                return (
                  <div 
                    key={dayIndex} 
                    className={cn(
                      "min-h-[120px] p-2",
                      day && isToday(day) && "bg-secondary/30",
                      !day && "bg-muted/20"
                    )}
                  >
                    {day && (
                      <>
                        <div className={cn(
                          "mb-2 text-right text-sm",
                          isToday(day) && "font-bold text-primary"
                        )}>
                          {format(day, 'd')}
                        </div>
                        <div className="space-y-1">
                          {dayTasks.slice(0, 3).map(task => (
                            <div 
                              key={task.id}
                              className={cn(
                                "text-xs truncate rounded px-2 py-1",
                                task.category === 'Work' && "bg-task-work/10 text-task-work",
                                task.category === 'Personal' && "bg-task-personal/10 text-task-personal",
                                task.category === 'Shopping' && "bg-task-shopping/10 text-task-shopping",
                                task.category === 'Health' && "bg-task-health/10 text-task-health",
                                task.completed && "opacity-50"
                              )}
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 3 && (
                            <div className="text-xs text-muted-foreground text-right">
                              +{dayTasks.length - 3} more
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
