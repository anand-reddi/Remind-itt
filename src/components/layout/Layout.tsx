
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNavbar } from './MobileNavbar';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block w-64 shrink-0">
        <Sidebar />
      </div>
      <ScrollArea className="flex-1 h-screen pb-16 md:pb-0">
        <div className="container py-8">
          <Outlet />
        </div>
      </ScrollArea>
      <MobileNavbar />
    </div>
  );
}
