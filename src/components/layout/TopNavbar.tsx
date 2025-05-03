
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

export function TopNavbar() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="h-16 border-b border-border bg-background flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2 font-semibold text-lg mr-8">
          <span className="h-6 w-6 rounded-full bg-primary text-white text-center">S</span>
          <span>Spark</span>
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
          className="p-2 rounded-md hover:bg-secondary transition-colors"
        >
          {theme === 'dark' ? '🌞' : '🌙'}
        </button>
      </div>
    </div>
  );
}
