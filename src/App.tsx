import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from './contexts/ThemeContext';
import { TaskProvider } from './contexts/TaskContext';
import { QuoteProvider } from './contexts/QuoteContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Layout } from './components/layout/Layout';
import Index from "./pages/Index";
import Calendar from "./pages/Calendar";
import Recent from "./pages/Recent";
import AddTask from "./pages/AddTask";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Capacitor } from '@capacitor/core';
import { useEffect } from "react";

const queryClient = new QueryClient();

// Only register service worker for web platform
if (Capacitor.getPlatform() === 'web' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        
        // Check if there's an update
        registration.update();
        
        // Set up regular checks for updates
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // Check every hour
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

const AppContent = () => {
  useEffect(() => {
    // Force a repaint to ensure theme is applied correctly
    document.body.style.display = 'none';
    setTimeout(() => {
      document.body.style.display = '';
    }, 10);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/add" element={<AddTask />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <SettingsProvider>
        <TaskProvider>
          <QuoteProvider>
            <NotificationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppContent />
              </TooltipProvider>
            </NotificationProvider>
          </QuoteProvider>
        </TaskProvider>
      </SettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
