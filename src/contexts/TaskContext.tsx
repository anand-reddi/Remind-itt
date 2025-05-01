
import React, { createContext, useContext, useEffect, useState } from 'react';
import { format } from 'date-fns';

export type TaskCategory = 'Work' | 'Personal' | 'Shopping' | 'Health';

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
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error('Failed to parse saved tasks', e);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Generate a unique ID for a new task
  const generateTaskId = (): string => {
    return `task_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  };

  // Add a new task
  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: generateTaskId(),
      completed: false,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  // Update an existing task
  const updateTask = (taskId: string, updates: Partial<Omit<Task, 'id'>>) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  // Delete a task
  const deleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
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
