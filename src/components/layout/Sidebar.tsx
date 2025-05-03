
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Home, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useTasks } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { getTodaysTasks } = useTasks();
  
  const todaysTasks = getTodaysTasks();
  const pendingTasksCount = todaysTasks.filter(task => !task.completed).length;

  return (
    <div className="flex h-screen flex-col bg-sidebar border-r border-border">
      <nav className="flex-1 overflow-auto py-6 px-4">
        <div className="space-y-1">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
            </Button>
          </Link>
          <Link to="/recent">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Home className="h-5 w-5" />
              <span>Recent</span>
            </Button>
          </Link>
          <Link to="/calendar">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <CalendarDays className="h-5 w-5" />
              <span>Calendar</span>
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
          </Link>
        </div>
        
        <div className="mt-10">
          <Link to="/add">
            <Button className="w-full gap-2">
              <Plus className="h-5 w-5" />
              <span>Add Task</span>
            </Button>
          </Link>
        </div>
        
        <div className="mt-8 rounded-xl bg-sidebar-accent p-4">
          <div className="text-sidebar-accent-foreground">
            <div className="text-sm font-medium">Today's tasks</div>
            <div className="mt-1 text-2xl font-bold">{pendingTasksCount}</div>
            <div className="mt-1 text-xs opacity-70">
              {pendingTasksCount === 0 
                ? "You're all caught up!" 
                : `You have ${pendingTasksCount} task${pendingTasksCount !== 1 ? 's' : ''} remaining`}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
