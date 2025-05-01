
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTasks } from './TaskContext';
import { toast } from '@/components/ui/sonner';

interface NotificationContextType {
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  showNotification: (title: string, body: string) => void;
  toggleNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const { getTodaysTasks } = useTasks();

  // Check if notifications are supported and permission on mount
  useEffect(() => {
    const checkNotificationStatus = async () => {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      if (Notification.permission === 'granted') {
        setNotificationsEnabled(localStorage.getItem('notificationsEnabled') === 'true');
      }
    };

    checkNotificationStatus();
  }, []);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      toast.error('Notifications are not supported in this browser');
      return false;
    }

    if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      localStorage.setItem('notificationsEnabled', 'true');
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        toast.success('Notifications enabled successfully');
        return true;
      } else {
        toast.error('Permission for notifications was denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
      return false;
    }
  };

  const showNotification = (title: string, body: string) => {
    if (!notificationsEnabled || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  };

  const toggleNotifications = async () => {
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
      toast.info('Notifications disabled');
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        // Send a test notification to confirm it's working
        setTimeout(() => {
          showNotification('Notifications Enabled', 'You will now receive task reminders');
        }, 1000);
      }
    }
  };

  // Check for due tasks every minute when notifications are enabled
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkDueTasks = () => {
      const now = new Date();
      const tasks = getTodaysTasks();
      
      const dueTasks = tasks.filter(task => {
        if (!task.completed && task.startTime) {
          const [hours, minutes] = task.startTime.split(':').map(Number);
          return now.getHours() === hours && now.getMinutes() === minutes;
        }
        return false;
      });

      dueTasks.forEach(task => {
        showNotification('Task Reminder', `It's time for: ${task.title}`);
      });
    };

    // Run immediately to check for any tasks due now
    checkDueTasks();
    
    const intervalId = setInterval(checkDueTasks, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [notificationsEnabled, getTodaysTasks]);

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        requestNotificationPermission,
        showNotification,
        toggleNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
