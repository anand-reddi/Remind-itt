
import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Home, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useTasks } from '@/contexts/TaskContext';
import { useQuote } from '@/contexts/QuoteContext';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { theme, toggleTheme } = useTheme();
  const { getTodaysTasks } = useTasks();
  const { quote } = useQuote();
  
  const todaysTasks = getTodaysTasks();
  const pendingTasksCount = todaysTasks.filter(task => !task.completed).length;

  return (
    <div className="flex h-screen flex-col bg-sidebar border-r border-border">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="h-6 w-6 rounded-full bg-primary text-white text-center">S</span>
          <span className="text-sidebar-foreground">Spark</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto py-6 px-4">
        <div className="space-y-1">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Home className="h-5 w-5" />
              <span>Dashboard</span>
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
              <span>Add Reminder</span>
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
      <div className="border-t border-border p-4">
        <div className="flex flex-col space-y-2">
          <div className="rounded-lg bg-sidebar-accent p-3 text-sm italic text-sidebar-accent-foreground">
            {quote && (
              <>
                <p>"{quote.text}"</p>
                <p className="mt-1 text-right text-xs">— {quote.author}</p>
              </>
            )}
          </div>
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center justify-center rounded-md p-2 text-sm font-medium",
              "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
            )}
          >
            {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
