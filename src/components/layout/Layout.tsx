
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block w-64 shrink-0">
        <Sidebar />
      </div>
      <ScrollArea className="flex-1 h-screen">
        <div className="container py-8">
          <Outlet />
        </div>
      </ScrollArea>
    </div>
  );
}
