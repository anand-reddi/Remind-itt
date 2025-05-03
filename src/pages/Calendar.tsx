
import React, { useState } from 'react';
import { format, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { Task, useTasks } from '@/contexts/TaskContext';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { tasks } = useTasks();

  // Functions to navigate between months
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  // Generate month grid
  const generateMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month and how many days to show before it
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay() || 7; // Adjust Sunday from 0 to 7
    const daysToShowBeforeMonth = startingDayOfWeek - 1;
    
    // Calculate days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Calculate days from previous month to display
    const previousMonth = month === 0 ? 11 : month - 1;
    const previousMonthYear = month === 0 ? year - 1 : year;
    const daysInPreviousMonth = new Date(previousMonthYear, previousMonth + 1, 0).getDate();
    
    // Generate calendar days
    const days = [];
    
    // Add days from previous month
    for (let i = daysInPreviousMonth - daysToShowBeforeMonth + 1; i <= daysInPreviousMonth; i++) {
      days.push({
        date: new Date(previousMonthYear, previousMonth, i),
        isCurrentMonth: false
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Add days from next month to complete the grid
    const totalDaysDisplayed = days.length;
    const daysToAdd = 42 - totalDaysDisplayed; // Always show 6 rows (6 * 7 = 42)
    
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= daysToAdd; i++) {
      days.push({
        date: new Date(nextMonthYear, nextMonth, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      const taskDate = new Date(task.date);
      return isSameDay(taskDate, date);
    });
  };

  // Check if a date has tasks
  const hasTasksOnDate = (date: Date) => {
    return getTasksForDate(date).length > 0;
  };

  // Handle date selection
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  // Get tasks for selected date
  const tasksForSelectedDate = getTasksForDate(selectedDate);

  // TaskCard component
  const TaskCard = ({ task }: { task: Task }) => {
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
        className={`${bgColor} p-3 rounded-lg border mb-2 ${
          task.completed ? 'opacity-50' : ''
        }`}
      >
        <div className="font-medium">{task.title}</div>
        {task.description && (
          <div className="text-sm mt-1 line-clamp-2">{task.description}</div>
        )}
        {timeDisplay && (
          <div className="text-xs mt-1 opacity-70">{timeDisplay}</div>
        )}
        <div className="text-xs mt-1 opacity-70">{task.category} · {task.priority} Priority</div>
      </div>
    );
  };

  // Calendar grid
  const calendarDays = generateMonthView();

  return (
    <div className="px-2 pb-16 md:px-4 md:pb-0 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">{format(currentDate, 'MMMM yyyy')}</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="mb-6">
        {/* Calendar days of week header */}
        <div className="grid grid-cols-7 text-center mb-1">
          <div className="text-xs md:text-sm font-medium">Mon</div>
          <div className="text-xs md:text-sm font-medium">Tue</div>
          <div className="text-xs md:text-sm font-medium">Wed</div>
          <div className="text-xs md:text-sm font-medium">Thu</div>
          <div className="text-xs md:text-sm font-medium">Fri</div>
          <div className="text-xs md:text-sm font-medium">Sat</div>
          <div className="text-xs md:text-sm font-medium">Sun</div>
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {calendarDays.map((day, index) => {
            const isToday = isSameDay(day.date, new Date());
            const isSelected = isSameDay(day.date, selectedDate);
            const hasTasks = hasTasksOnDate(day.date);
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(day.date)}
                className={`aspect-square flex flex-col items-center justify-center relative rounded-md transition-colors
                  ${!day.isCurrentMonth ? 'opacity-40' : ''}
                  ${isToday ? 'bg-primary/20' : ''}
                  ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}
                `}
              >
                <span className="text-sm md:text-base">{format(day.date, 'd')}</span>
                {hasTasks && (
                  <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-primary"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Selected date tasks */}
      <div className="pb-6">
        <div className="text-base font-medium mb-3">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </div>
        
        <div className="space-y-2">
          {tasksForSelectedDate.length > 0 ? (
            tasksForSelectedDate.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <div className="text-center p-8 text-muted-foreground bg-muted/50 rounded-lg">
              No tasks scheduled for this day
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
