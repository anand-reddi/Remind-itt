import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTasks, TaskPriority } from './TaskContext';
import { toast } from '@/components/ui/sonner';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

interface NotificationContextType {
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  showNotification: (title: string, body: string, priority?: TaskPriority) => void;
  toggleNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const { getTodaysTasks } = useTasks();
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isNative, setIsNative] = useState<boolean>(false);

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    setIsNative(platform === 'android' || platform === 'ios');
    
    console.log('Platform detected:', platform, 'isNative:', platform === 'android' || platform === 'ios');
    
    // Register service worker for web
    if (platform === 'web' && 'serviceWorker' in navigator && 'Notification' in window) {
      console.log('Setting up web service worker');
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful');
          setSwRegistration(registration);
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    }
  }, []);

  useEffect(() => {
    const initNotifications = async () => {
      if (isNative) {
        try {
          console.log('Initializing native notifications');
          
          // For native platforms, always consider notification capability available
          const savedPref = localStorage.getItem('notificationsEnabled');
          setNotificationsEnabled(savedPref === 'true');
          
          // Set up Push Notifications
          await PushNotifications.addListener('registration', (token) => {
            console.log('Push registration success:', token.value);
          });
          
          await PushNotifications.addListener('registrationError', (err) => {
            console.error('Push registration failed:', err.error);
          });

          // Check Local Notifications permission
          try {
            const permStatus = await LocalNotifications.checkPermissions();
            console.log('Local notification permission status:', permStatus);
            
            if (permStatus.display === 'granted') {
              setNotificationsEnabled(true);
              localStorage.setItem('notificationsEnabled', 'true');
            }
          } catch (permError) {
            console.error('Error checking notification permissions:', permError);
          }
        } catch (error) {
          console.error('Error setting up native notifications:', error);
        }
      } else if ('Notification' in window) {
        // Web notification check
        console.log('Checking web notification permission:', Notification.permission);
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(localStorage.getItem('notificationsEnabled') === 'true');
        }
      }
    };
    
    initNotifications();
  }, [isNative]);

  const requestNotificationPermission = async (): Promise<boolean> => {
    console.log('Requesting notification permission, isNative:', isNative);
    
    if (isNative) {
      try {
        // For native platforms, we'll directly attempt to register
        const localResult = await LocalNotifications.requestPermissions();
        console.log('Local notification permission result:', localResult);
        
        // On Android, we can proceed even without explicit permission result check
        try {
          await PushNotifications.requestPermissions();
          await PushNotifications.register();
          console.log('Push notifications registered');
          
          setNotificationsEnabled(true);
          localStorage.setItem('notificationsEnabled', 'true');
          toast.success('Notifications enabled successfully');
          return true;
        } catch (pushError) {
          console.error('Error registering push notifications:', pushError);
          toast.error('Failed to enable notifications');
          return false;
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        // On native, we'll be more permissive with errors
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        return true;
      }
    } else if ('Notification' in window) {
      console.log('Requesting web notification permission');
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', 'true');
        return true;
      }
      
      try {
        const permission = await Notification.requestPermission();
        console.log('Web notification permission result:', permission);
        
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
        console.error('Web requestPermission error:', error);
        return false;
      }
    } else {
      console.log('Notifications are not supported on this platform');
      toast.error('Notifications are not supported on this platform');
      return false;
    }
    return false;
  };

  const showNotification = async (title: string, body: string, priority?: TaskPriority) => {
    if (!notificationsEnabled) return;
    console.log('Showing notification:', title, body, 'priority:', priority, 'isNative:', isNative);

    if (isNative) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Date.now(),
              schedule: { at: new Date() },
              sound: priority === 'High' ? 'beep.wav' : undefined,
              smallIcon: 'ic_stat_remind_itt',
              iconColor: '#4f46e5',
              extra: { priority }
            },
          ],
        });
        console.log('Native notification scheduled');
      } catch (error) {
        console.error('Failed to schedule native notification:', error);
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body,
        icon: '/icon-192x192.png',
        vibrate: priority === 'High' ? [200, 100, 200] : [100],
        badge: '/icon-192x192.png',
        data: { url: window.location.origin },
      };
      
      try {
        if (swRegistration) {
          await swRegistration.showNotification(title, options);
          console.log('ServiceWorker notification shown');
        } else {
          new Notification(title, options);
          console.log('Standard web notification shown');
        }
      } catch (error) {
        console.error('Failed to show web notification:', error);
      }
    }
  };

  const toggleNotifications = async () => {
    console.log('Toggling notifications, current state:', notificationsEnabled);
    
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem('notificationsEnabled', 'false');
      toast.info('Notifications disabled');
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        setTimeout(() => {
          showNotification('Notifications Enabled', 'You will now receive task reminders');
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkDueTasks = () => {
      const now = new Date();
      const tasks = getTodaysTasks();
      tasks.forEach(task => {
        if (!task.completed && task.startTime) {
          const [h, m] = task.startTime.split(':').map(Number);
          if (h === now.getHours() && m === now.getMinutes()) {
            showNotification('Task Reminder', `It's time for: ${task.title}`, task.priority);
          }
        }
      });
    };

    checkDueTasks();
    const intervalId = setInterval(checkDueTasks, 30000);
    return () => clearInterval(intervalId);
  }, [notificationsEnabled, getTodaysTasks]);

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        requestNotificationPermission,
        showNotification,
        toggleNotifications,
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
