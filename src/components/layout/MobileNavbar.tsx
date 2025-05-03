
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, Plus, Settings, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNavbar() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link 
          to="/" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-xs",
            isActive('/') ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Home size={20} />
          <span className="mt-1">Home</span>
        </Link>
        
        <Link 
          to="/recent" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-xs",
            isActive('/recent') ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Clock size={20} />
          <span className="mt-1">Recent</span>
        </Link>
        
        <Link 
          to="/add" 
          className="flex flex-col items-center justify-center w-full h-full"
        >
          <div className="flex items-center justify-center rounded-full bg-primary w-12 h-12 text-primary-foreground">
            <Plus size={24} />
          </div>
        </Link>
        
        <Link 
          to="/calendar" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-xs",
            isActive('/calendar') ? "text-primary" : "text-muted-foreground"
          )}
        >
          <CalendarDays size={20} />
          <span className="mt-1">Calendar</span>
        </Link>
        
        <Link 
          to="/settings" 
          className={cn(
            "flex flex-col items-center justify-center w-full h-full text-xs",
            isActive('/settings') ? "text-primary" : "text-muted-foreground"
          )}
        >
          <Settings size={20} />
          <span className="mt-1">Settings</span>
        </Link>
      </div>
    </div>
  );
}
