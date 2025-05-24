
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export function TopNavbar() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="h-16 border-b border-border bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center">
   <Link to="/" className="flex items-center gap-2 font-semibold text-lg mr-8">
  <span className="font-caveat text-2xl tracking-wide text-primary font-bold">Remind itt</span>
</Link>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/recent" className="text-sm font-medium hover:text-primary transition-colors">
            Recent
          </Link>
          <Link to="/calendar" className="text-sm font-medium hover:text-primary transition-colors">
            Calendar
          </Link>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md hover:bg-accent transition-colors relative w-8 h-8 flex items-center justify-center"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 animate-theme-toggle" />
          ) : (
            <Moon className="w-5 h-5 animate-theme-toggle" />
          )}
        </button>
      </div>
    </div>
  );
}
