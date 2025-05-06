import React, { createContext, useContext, useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { useTasks } from './TaskContext';
import { toast } from '@/components/ui/sonner';
import webNotificationService from '@/services/webNotificationService';
import nativeNotificationService from '@/services/nativeNotificationService';
import { 
  isNativePlatform, 
  checkNotificationPermissions, 
  requestNotificationPermission, 
  setupNotificationListeners, 
  debugNotificationCapabilities,
  CHECK_INTERVAL
} from '@/utils/notificationUtils';
import { TaskPriority } from './TaskContext';

interface NotificationContextType {
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  showNotification: (title: string, body: string, options?: {
    priority?: TaskPriority;
    id?: number;
    schedule?: Date;
    sound?: boolean;
  }) => void;
  toggleNotifications: () => void;
  sendTestNotification: () => Promise<void>;
  rescheduleAllNotifications: () => Promise<void>;
  cancelNotificationForTask: (taskId: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const { getTodaysTasks } = useTasks();
  const [isNative, setIsNative] = useState<boolean>(false);

  // Initialize platform detection and setup
  useEffect(() => {
    const nativePlatform = isNativePlatform();
    setIsNative(nativePlatform);
    
    console.log('Platform detected:', Capacitor.getPlatform(), 'isNative:', nativePlatform);
    
    // Debug notification capabilities
    debugNotificationCapabilities();
    
    // Set up app state change listeners for native platforms
    if (nativePlatform) {
      try {
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active:', isActive);
          if (isActive) {
            console.log('App became active, checking notifications');
            checkNotificationPermissions().then((hasPermission) => {
              if (hasPermission) {
                setNotificationsEnabled(true);
              }
            });
          }
        });
        console.log('App state listeners registered');
      } catch (error) {
        console.error('Failed to register app state listeners:', error);
      }
    }
  }, []);

  // Set up native notification handlers
  useEffect(() => {
    const setupNativeNotifications = async () => {
      if (isNative) {
        try {
          console.log('Setting up native notifications handlers');
          
          // Register push notification handlers without requesting permissions yet
          await nativeNotificationService.setupPushNotifications();
          
          // Setup notification listeners
          await setupNotificationListeners();
          
          // Check if notifications were previously enabled
          const savedPref = localStorage.getItem('notificationsEnabled');
          if (savedPref === 'true') {
            const hasPermission = await checkNotificationPermissions();
            if (hasPermission) {
              console.log('Notifications were previously enabled and permission is granted');
              setNotificationsEnabled(true);
            }
          }
        } catch (error) {
          console.error('Error setting up native notification handlers:', error);
        }
      }
    };
    
    setupNativeNotifications();
  }, [isNative]);

  // Toggle notifications on/off
  const toggleNotifications = async () => {
    console.log('Toggling notifications, current state:', notificationsEnabled);
    
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
      toast.info('Notifications disabled');
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        // Send an immediate test notification
        setTimeout(() => {
          sendTestNotification();
        }, 1000);
      }
    }
  };

  // Show notification using the appropriate service
  const showNotification = async (title: string, body: string, options?: {
    priority?: TaskPriority;
    id?: number;
    schedule?: Date;
    sound?: boolean;
  }) => {
    if (!notificationsEnabled) return;

    if (isNative) {
      await nativeNotificationService.showNotification(title, body, options);
    } else if ('Notification' in window && Notification.permission === 'granted') {
      webNotificationService.showNotification(title, body, options);
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    if (isNative) {
      await nativeNotificationService.sendTestNotification();
    } else {
      // Web notification
      if ('Notification' in window && Notification.permission === 'granted') {
        webNotificationService.showNotification('Test Notification', 'This is a test notification');
        console.log('Web test notification sent');
      } else {
        toast.info('Test notification would appear here (web)');
      }
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    if (!isNative) return;
    await nativeNotificationService.clearAllNotifications();
  };

  // Cancel notification for a specific task
  const cancelNotificationForTask = async (taskId: string) => {
    if (!isNative) return;
    await nativeNotificationService.cancelNotificationForTask(taskId);
  };

  // Schedule all task notifications
  const scheduleAllTaskNotifications = async () => {
    if (!isNative || !notificationsEnabled) return;
    
    console.log('Scheduling all task notifications');
    const allTasks = getTodaysTasks();
    await nativeNotificationService.scheduleTaskNotifications(allTasks);
  };

  // Method for external components to trigger full reschedule
  const rescheduleAllNotifications = async () => {
    if (!notificationsEnabled) {
      console.log('Notifications not enabled - skipping reschedule');
      return;
    }
    
    console.log('Manual reschedule of all notifications requested');
    await scheduleAllTaskNotifications();
    console.log('Manual reschedule completed');
  };

  // Set up task reminder system and scheduled notifications
  useEffect(() => {
    if (!notificationsEnabled) return;

    console.log('Setting up task reminder system');

    // Reschedule all notifications whenever enabled
    const setupNotifications = async () => {
      await scheduleAllTaskNotifications();
    };

    setupNotifications();

    // Use throttled interval for checking due tasks
    const checkDueTasks = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Only run a full check at the start of each minute (when seconds are near 0)
      if (now.getSeconds() <= 3) {
        console.log(`Checking tasks at ${currentHour}:${currentMinute}`);
        
        const tasks = getTodaysTasks();
        tasks.forEach(task => {
          if (!task.completed && task.startTime) {
            const [h, m] = task.startTime.split(':').map(Number);
            const taskHour = h === undefined ? -1 : h;
            const taskMinute = m === undefined ? -1 : m;
            
            if (taskHour >= 0 && taskMinute >= 0 && 
                taskHour === currentHour && 
                taskMinute === currentMinute) {
              console.log(`Real-time check sending notification for task: ${task.title}`);
              showNotification('Task Reminder', `It's time for: ${task.title}`, { priority: task.priority });
            }
          }
        });
      }
    };

    // Throttle checking to reduce resource usage
    const intervalId = setInterval(checkDueTasks, CHECK_INTERVAL);
    
    // Handle app focus for rescheduling
    const handleAppFocus = () => {
      console.log('App regained focus, rescheduling notifications');
      scheduleAllTaskNotifications();
    };
    
    // Add focus listeners - these work on both web and Capacitor
    window.addEventListener('focus', handleAppFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleAppFocus();
      }
    });
    
    // Simple cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleAppFocus);
      document.removeEventListener('visibilitychange', handleAppFocus);
    };
  }, [notificationsEnabled, getTodaysTasks, isNative]);

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        requestNotificationPermission,
        showNotification,
        toggleNotifications,
        sendTestNotification,
        rescheduleAllNotifications,
        cancelNotificationForTask,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
