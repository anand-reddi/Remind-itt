
import React, { useState } from 'react';
import { format, addDays, startOfWeek, addMonths, subMonths, isSameDay } from 'date-fns';
import { Task, useTasks } from '@/contexts/TaskContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const { tasks } = useTasks();

  // Functions to navigate between months
  const goToPrevious = () => {
    if (view === 'month') {
      setCurrentDate(prevDate => subMonths(prevDate, 1));
    } else if (view === 'week') {
      setCurrentDate(prevDate => addDays(prevDate, -7));
    } else {
      setCurrentDate(prevDate => addDays(prevDate, -1));
    }
  };

  const goToNext = () => {
    if (view === 'month') {
      setCurrentDate(prevDate => addMonths(prevDate, 1));
    } else if (view === 'week') {
      setCurrentDate(prevDate => addDays(prevDate, 7));
    } else {
      setCurrentDate(prevDate => addDays(prevDate, 1));
    }
  };

  // Generate month grid
  const generateMonthView = () => {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startDate = startOfWeek(firstDayOfMonth);
    const daysArray = [];

    // Generate days for 6 weeks to ensure we cover the month
    for (let i = 0; i < 42; i++) {
      const date = addDays(startDate, i);
      daysArray.push(date);
    }

    // Break days into week chunks
    const weeks = [];
    for (let i = 0; i < daysArray.length; i += 7) {
      weeks.push(daysArray.slice(i, i + 7));
    }

    return (
      <div className="animate-fade-in">
        <div className="grid grid-cols-7 text-center font-medium mb-2">
          <div>M</div>
          <div>T</div>
          <div>W</div>
          <div>T</div>
          <div>F</div>
          <div>S</div>
          <div>S</div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {daysArray.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(date, new Date());
            const dayTasks = tasks.filter(task => isSameDay(new Date(task.date), date));
            const hasTask = dayTasks.length > 0;
            
            return (
              <div 
                key={index} 
                className={`aspect-square flex flex-col items-center justify-center rounded-full relative ${
                  isCurrentMonth ? '' : 'opacity-30'
                } ${
                  isToday ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <span className="text-sm md:text-base">{format(date, 'd')}</span>
                {hasTask && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary"></span>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          {getTasksForDate(currentDate).map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  };

  // Generate day view
  const generateDayView = () => {
    const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);
    const dayTasks = getTasksForDate(currentDate);
    
    return (
      <div className="animate-fade-in">
        <div className="space-y-4">
          {hoursOfDay.map((hour) => {
            const hourTasks = dayTasks.filter(task => {
              const taskTime = task.startTime ? parseInt(task.startTime.split(':')[0]) : null;
              return taskTime === hour;
            });
            
            if (hourTasks.length === 0) return null;
            
            return (
              <div key={hour} className="border-t pt-2">
                <div className="text-sm text-muted-foreground mb-1">{hour.toString().padStart(2, '0')}:00</div>
                <div className="space-y-2">
                  {hourTasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            );
          })}
          
          {dayTasks.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              No tasks for this day
            </div>
          )}
        </div>
      </div>
    );
  };

  // Generate week view
  const generateWeekView = () => {
    const startOfCurrentWeek = startOfWeek(currentDate);
    const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(startOfCurrentWeek, i));
    const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="animate-fade-in overflow-x-auto">
        <div className="grid grid-cols-7 gap-1 mb-4 min-w-[700px]">
          {daysOfWeek.map((date, index) => {
            const isToday = isSameDay(date, new Date());
            return (
              <div 
                key={index} 
                className={`text-center py-2 ${isToday ? 'bg-primary/10 rounded-md' : ''}`}
              >
                <div className="text-sm">{format(date, 'EEE')}</div>
                <div className={`text-lg font-medium ${isToday ? 'text-primary' : ''}`}>
                  {format(date, 'd')}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="space-y-4 min-w-[700px] pt-2">
          {hoursOfDay.map((hour) => {
            const hasTasksInHour = daysOfWeek.some(day => {
              const tasksForDay = getTasksForDate(day);
              return tasksForDay.some(task => {
                const taskTime = task.startTime ? parseInt(task.startTime.split(':')[0]) : null;
                return taskTime === hour;
              });
            });
            
            if (!hasTasksInHour) return null;
            
            return (
              <div key={hour} className="grid grid-cols-7 gap-1 border-t pt-2">
                <div className="col-span-7 text-xs text-muted-foreground mb-1">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {daysOfWeek.map((day, dayIndex) => {
                  const tasksForDay = getTasksForDate(day);
                  const tasksForHour = tasksForDay.filter(task => {
                    const taskTime = task.startTime ? parseInt(task.startTime.split(':')[0]) : null;
                    return taskTime === hour;
                  });
                  
                  return (
                    <div key={dayIndex} className="min-h-[60px]">
                      {tasksForHour.map(task => (
                        <TaskCard key={task.id} task={task} compact />
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return isSameDay(taskDate, date);
    });
  };

  // TaskCard component
  const TaskCard = ({ task, compact = false }: { task: Task, compact?: boolean }) => {
    let bgColor = 'bg-primary/10';
    
    if (task.category === 'Work') bgColor = 'bg-blue-100 dark:bg-blue-900/30';
    if (task.category === 'Personal') bgColor = 'bg-pink-100 dark:bg-pink-900/30';
    if (task.category === 'Shopping') bgColor = 'bg-yellow-100 dark:bg-yellow-900/30';
    if (task.category === 'Health') bgColor = 'bg-green-100 dark:bg-green-900/30';
    
    const timeDisplay = task.startTime ? 
      `${task.startTime}${task.endTime ? ` - ${task.endTime}` : ''}` : 
      '';
    
    return (
      <div 
        className={`${bgColor} p-2 rounded-lg border mb-2 ${
          task.completed ? 'opacity-50' : ''
        } ${compact ? 'text-xs p-1' : ''}`}
      >
        <div className="font-medium truncate">{task.title}</div>
        {timeDisplay && (
          <div className="text-xs opacity-70">{timeDisplay}</div>
        )}
      </div>
    );
  };

  return (
    <div className="px-2 pb-16 md:px-4 md:pb-0 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{format(currentDate, 'PPP')}</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="month" className="mb-4" onValueChange={(value) => setView(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {view === 'month' && generateMonthView()}
      {view === 'week' && generateWeekView()}
      {view === 'day' && generateDayView()}
    </div>
  );
};

export default Calendar;
