
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
    setIsNative(Capacitor.isNativePlatform());
    
    // Register service worker for web
    if (!Capacitor.isNativePlatform() && 'serviceWorker' in navigator && 'Notification' in window) {
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
    const init = async () => {
      if (isNative) {
        try {
          // Initialize push notifications
          await PushNotifications.requestPermissions();
          
          // Register for push notifications
          await PushNotifications.register();
          
          // Initialize local notifications
          const permStatus = await LocalNotifications.requestPermissions();
          console.log('Local Notifications permission status:', permStatus);
          
          if (permStatus.display === 'granted') {
            setNotificationsEnabled(true);
            localStorage.setItem('notificationsEnabled', 'true');
            console.log('Capacitor Local Notifications ready');
          } else {
            console.log('Local Notifications permission denied');
            setNotificationsEnabled(false);
          }
        } catch (error) {
          console.error('Notification Permission Error', error);
          setNotificationsEnabled(false);
        }
      } else {
        if ('Notification' in window && Notification.permission === 'granted') {
          setNotificationsEnabled(localStorage.getItem('notificationsEnabled') === 'true');
        }
      }
    };
    
    init();
  }, [isNative]);

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (isNative) {
      try {
        // First try Push Notifications for native
        await PushNotifications.requestPermissions();
        await PushNotifications.register();
        
        // Then try Local Notifications
        const permission = await LocalNotifications.requestPermissions();
        console.log('Permission request result:', permission);
        
        if (permission.display === 'granted') {
          setNotificationsEnabled(true);
          localStorage.setItem('notificationsEnabled', 'true');
          toast.success('Notifications enabled successfully');
          return true;
        } else {
          toast.error('Permission for notifications was denied');
          return false;
        }
      } catch (error) {
        console.error('Native notification permission error:', error);
        toast.error('Failed to request notification permissions');
        return false;
      }
    } else if ('Notification' in window) {
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
        console.error('Web requestPermission error:', error);
        return false;
      }
    }
    toast.error('Notifications are not supported on this platform');
    return false;
  };

  const getNotificationOptions = (priority?: TaskPriority) => ({
    icon: '/icon-192x192.png',
    vibrate: priority === 'High' ? [200, 100, 200] : [100],
    badge: '/icon-192x192.png',
    data: { url: window.location.origin },
  });

  const showNotification = async (title: string, body: string, priority?: TaskPriority) => {
    if (!notificationsEnabled) return;

    if (isNative) {
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Date.now(), // use timestamp as unique id
              schedule: { at: new Date() }, // show immediately
              sound: priority === 'High' ? 'beep.wav' : undefined, // optional custom sounds
              smallIcon: 'ic_launcher',
              iconColor: '#4f46e5',
              extra: { priority }
            },
          ],
        });
      } catch (error) {
        console.error('Local notification schedule error:', error);
      }
    } else if ('Notification' in window && Notification.permission === 'granted') {
      const options = getNotificationOptions(priority);
      if (swRegistration) {
        swRegistration.showNotification(title, { body, ...options }).catch(error => {
          console.error('ServiceWorker notification error:', error);
          new Notification(title, { body, ...options });
        });
      } else {
        new Notification(title, { body, ...options });
      }
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
  }, [notificationsEnabled, getTodaysTasks, isNative]);

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
