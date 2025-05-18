import React, { createContext, useContext, useEffect, useState } from 'react';
import { format, addDays, addMonths, addYears, parseISO, isAfter, isSameDay } from 'date-fns';

export type TaskCategory = 'Work' | 'Personal' | 'Shopping' | 'Health';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export type RecurrencePattern = 
  | 'none' 
  | 'daily' 
  | 'weekly' 
  | 'monthly' 
  | 'yearly';

export interface Task {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string
  startTime?: string; // 24h format '14:00'
  endTime?: string; // 24h format '15:00'
  category: TaskCategory;
  completed: boolean;
  recurrence: RecurrencePattern;
  recurrenceEndDate?: string; // ISO string
  selectedDays?: string[]; // Days of week for weekly recurrence
  priority: TaskPriority;
  parentTaskId?: string; // Reference to original recurring task
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  getTasksByDate: (date: Date) => Task[];
  getTasksForCurrentWeek: () => Task[];
  getTasksForCurrentMonth: () => Task[];
  getTodaysTasks: () => Task[];
  clearCompletedTasks: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on initial load
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        // Add default priority if it doesn't exist in saved tasks
        const parsedTasks = JSON.parse(savedTasks);
        const updatedTasks = parsedTasks.map((task: Task) => ({
          ...task,
          priority: task.priority || 'Medium'
        }));
        setTasks(updatedTasks);
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
  }, []);

  // Process recurring tasks every time tasks changes or when app loads
  useEffect(() => {
    generateRecurringTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Generate a unique ID for a new task
  const generateTaskId = (): string => {
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  };

  // Generate recurring tasks
  const generateRecurringTasks = () => {
    const today = new Date();
    
    // Find all recurring tasks
    const recurringTasks = tasks.filter(task => 
      task.recurrence !== 'none' && !task.parentTaskId
    );

    let newTasks: Task[] = [];

    recurringTasks.forEach(task => {
      const taskDate = parseISO(task.date);
      
      // For tasks in the past or today that don't have a future instance yet,
      // we need to generate the next occurrence(s)
      if (!isAfter(taskDate, today) || isSameDay(taskDate, today)) {
        // Look ahead for the next 3 occurrences
        let nextOccurrences: Date[] = [];
        
        switch (task.recurrence) {
          case 'daily':
            // Generate the next 3 daily occurrences
            for (let i = 1; i <= 3; i++) {
              nextOccurrences.push(addDays(taskDate, i));
            }
            break;

          case 'weekly':
            // For weekly tasks, we need to check if we should generate tasks for the selected days
            if (task.selectedDays && task.selectedDays.length > 0) {
              const dayMap = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
              
              // Get the next occurrence for each selected day for the next 2 weeks
              task.selectedDays.forEach(dayCode => {
                const dayIndex = dayMap.indexOf(dayCode);
                if (dayIndex !== -1) {
                  // Look for occurrences in the next 14 days (2 weeks)
                  for (let daysToAdd = 1; daysToAdd <= 14; daysToAdd++) {
                    const possibleDate = addDays(taskDate, daysToAdd);
                    if (possibleDate.getDay() === dayIndex && isAfter(possibleDate, today)) {
                      nextOccurrences.push(possibleDate);
                      break; // Only take the next occurrence for each selected day
                    }
                  }
                }
              });
            } else {
              // If no specific days are selected, just do regular weekly recurrence
              for (let i = 1; i <= 3; i++) {
                nextOccurrences.push(addDays(taskDate, i * 7));
              }
            }
            break;

          case 'monthly':
            // Generate the next 3 monthly occurrences
            for (let i = 1; i <= 3; i++) {
              nextOccurrences.push(addMonths(taskDate, i));
            }
            break;

          case 'yearly':
            // Generate the next 3 yearly occurrences
            for (let i = 1; i <= 3; i++) {
              nextOccurrences.push(addYears(taskDate, i));
            }
            break;

          default:
            return;
        }
        
        // Filter to only keep future dates
        nextOccurrences = nextOccurrences.filter(date => isAfter(date, today));
        
        // Create tasks for each occurrence if they don't exist yet
        nextOccurrences.forEach(nextDate => {
          // Check if a task already exists for this date and parent
          const existingTaskForDay = tasks.some(t => 
            t.parentTaskId === task.id && 
            isSameDay(parseISO(t.date), nextDate)
          );
          
          if (!existingTaskForDay) {
            newTasks.push(createRecurringTask(task, nextDate));
          }
        });
      }
    });

    if (newTasks.length > 0) {
      setTasks(prevTasks => [...prevTasks, ...newTasks]);
    }
  };

  // Create a recurring task based on a template task and new date
  const createRecurringTask = (templateTask: Task, newDate: Date): Task => {
    return {
      ...templateTask,
      id: generateTaskId(),
      date: newDate.toISOString(),
      completed: false,
      parentTaskId: templateTask.id
    };
  };

  // Add a new task
  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: generateTaskId(),
      completed: false,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    
    // If this is a recurring task, we should immediately generate future tasks
    if (task.recurrence !== 'none') {
      setTimeout(() => {
        generateRecurringTasks();
      }, 100);
    }
  };

  // Update an existing task
  const updateTask = (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
    
    // If we're updating recurrence settings, regenerate recurring tasks
    if ('recurrence' in updates || 'date' in updates || 'selectedDays' in updates) {
      setTimeout(() => {
        generateRecurringTasks();
      }, 100);
    }
  };

  // Delete a task
  const deleteTask = (taskId: string) => {
    // Find if this is a parent task and remove all children
    const isParentTask = tasks.some(task => task.parentTaskId === taskId);
    
    if (isParentTask) {
      setTasks((prevTasks) => 
        prevTasks.filter((task) => task.id !== taskId && task.parentTaskId !== taskId)
      );
    } else {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    }
  };

  // Toggle task completion status
  const toggleTaskComplete = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Get tasks for a specific date
  const getTasksByDate = (date: Date): Task[] => {
    const dateString = format(date, 'yyyy-MM-dd');
    return tasks.filter((task) => task.date.startsWith(dateString));
  };

  // Get tasks for the current week
  const getTasksForCurrentWeek = (): Task[] => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return tasks.filter((task) => {
      const taskDate = new Date(task.date);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });
  };

  // Get tasks for the current month
  const getTasksForCurrentMonth = (): Task[] => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    return tasks.filter((task) => {
      const taskDate = new Date(task.date);
      return taskDate.getFullYear() === year && taskDate.getMonth() === month;
    });
  };

  // Get today's tasks
  const getTodaysTasks = (): Task[] => {
    return getTasksByDate(new Date());
  };

  // Clear all completed tasks
  const clearCompletedTasks = () => {
    setTasks((prevTasks) => prevTasks.filter((task) => !task.completed));
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        getTasksByDate,
        getTasksForCurrentWeek,
        getTasksForCurrentMonth,
        getTodaysTasks,
        clearCompletedTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
