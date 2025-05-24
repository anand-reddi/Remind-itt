import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNavbar } from './MobileNavbar';
import { TopNavbar } from './TopNavbar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/contexts/ThemeContext';

export function Layout() {
  const { theme } = useTheme();
  
  useEffect(() => {
    // Ensure the body background matches the theme to prevent flashing
    document.body.style.backgroundColor = theme === 'dark' ? '#121212' : '#ffffff';
  }, [theme]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block w-64 shrink-0">
          <Sidebar />
        </div>
        <ScrollArea className="flex-1 h-full pb-16 md:pb-0">
          <div className="px-3 py-4 md:container md:py-8">
            <Outlet />
          </div>
        </ScrollArea>
      </div>
      <MobileNavbar />
    </div>
  );
}
