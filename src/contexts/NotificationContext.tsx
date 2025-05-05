import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTasks, TaskPriority } from './TaskContext';
import { toast } from '@/components/ui/sonner';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
// import { import as importCapacitorApp } from '@capacitor/app';

interface NotificationContextType {
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
  showNotification: (title: string, body: string, priority?: TaskPriority) => void;
  toggleNotifications: () => void;
  sendTestNotification: () => Promise<void>;
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

  // Debug notification capabilities
  useEffect(() => {
    if (isNative) {
      console.log('Checking notification capabilities on native platform');
      
      // Capacitor capabilities logging
      const cap = Capacitor.isPluginAvailable('LocalNotifications');
      console.log('LocalNotifications plugin available:', cap);
      
      const push = Capacitor.isPluginAvailable('PushNotifications');
      console.log('PushNotifications plugin available:', push);
    }
  }, [isNative]);

  useEffect(() => {
    const setupNativeNotifications = async () => {
      if (isNative) {
        try {
          console.log('Setting up native notifications handlers');
          
          // Register push notification handlers without requesting permissions yet
          await PushNotifications.addListener('registration', (token) => {
            console.log('Push registration success:', token.value);
          });
          
          await PushNotifications.addListener('registrationError', (err) => {
            console.error('Push registration failed:', err.error);
          });
          
          await PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push notification received:', notification);
          });
          
          // Add local notification handlers
          await LocalNotifications.addListener('localNotificationReceived', (notification) => {
            console.log('Local notification received:', notification);
          });
          
          // Check if notifications were previously enabled
          const savedPref = localStorage.getItem('notificationsEnabled');
          if (savedPref === 'true') {
            try {
              // Just check permission without requesting
              const permStatus = await LocalNotifications.checkPermissions();
              console.log('Local notification permission status:', permStatus);
              
              if (permStatus.display === 'granted') {
                setNotificationsEnabled(true);
              }
            } catch (permError) {
              console.error('Error checking notification permissions:', permError);
            }
          }
        } catch (error) {
          console.error('Error setting up native notification handlers:', error);
        }
      }
    };
    
    setupNativeNotifications();
  }, [isNative]);

  const requestNotificationPermission = async (): Promise<boolean> => {
    console.log('Requesting notification permission, isNative:', isNative);
    
    if (isNative) {
      try {
        // First request local notification permission
        console.log('Requesting local notifications permission');
        const localResult = await LocalNotifications.requestPermissions();
        console.log('Local notification permission result:', localResult);
        
        if (localResult.display !== 'denied') {
          try {
            // Try push notifications, but don't fail if this doesn't work
            console.log('Requesting push notifications permission');
            try {
              await PushNotifications.requestPermissions();
              await PushNotifications.register();
              console.log('Push notifications registered');
            } catch (pushError) {
              console.error('Error registering push notifications (continuing anyway):', pushError);
            }
            
            setNotificationsEnabled(true);
            localStorage.setItem('notificationsEnabled', 'true');
            toast.success('Notifications enabled successfully');
            return true;
          } catch (error) {
            console.error('Error during notification setup:', error);
            // Continue anyway with local notifications
            setNotificationsEnabled(true);
            localStorage.setItem('notificationsEnabled', 'true');
            toast.success('Local notifications enabled');
            return true;
          }
        } else {
          toast.error('Permission for notifications was denied');
          return false;
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        toast.error('Failed to enable notifications');
        return false;
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
  };

  const sendTestNotification = async () => {
    if (isNative) {
      try {
        console.log('Sending test notification with default system sound');
        
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Test Notification',
              body: 'This is a test notification with sound',
              id: Math.floor(Math.random() * 100000),
              sound: 'default',
              smallIcon: 'ic_stat_remind_itt',
              iconColor: '#4f46e5',
              channelId: 'remind-itt-notifications',
            }
          ]
        });
        console.log('Test notification sent successfully');
        toast.success('Test notification sent with sound');
      } catch (error) {
        console.error('Failed to send test notification:', error);
        toast.error('Failed to send test notification');
      }
    }
  };

  const showNotification = async (title: string, body: string, priority?: TaskPriority) => {
    if (!notificationsEnabled) return;
    console.log('Showing notification:', title, body, 'priority:', priority, 'isNative:', isNative);

    if (isNative) {
      try {
        // Create a unique ID for the notification
        const notificationId = Math.floor(Math.random() * 100000);
        
        console.log(`Sending immediate notification #${notificationId}`);
        
        // For immediate notification with system default sound
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: notificationId,
              sound: 'default',
              smallIcon: 'ic_stat_remind_itt',
              iconColor: '#4f46e5',
              channelId: 'remind-itt-notifications',
              ongoing: false,
              autoCancel: true
            },
          ],
        });
        console.log(`Native notification #${notificationId} sent successfully`);
      } catch (error) {
        console.error('Failed to send notification:', error);
        
        // Fallback to toast
        try {
          toast.info(`${title}: ${body}`, {
            duration: 5000,
            important: priority === 'High'
          });
        } catch (fallbackError) {
          console.error('Even fallback toast notification failed:', fallbackError);
        }
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
        // Send an immediate test notification
        setTimeout(() => {
          sendTestNotification();
        }, 1000);
      }
    }
  };

  const scheduleAllTaskNotifications = async () => {
    console.log('Scheduling all task notifications');
    
    try {
      // First cancel any existing notifications
      try {
        await LocalNotifications.getPending().then(pending => {
          if (pending.notifications && pending.notifications.length > 0) {
            console.log(`Cancelling ${pending.notifications.length} pending notifications`);
            const ids = pending.notifications.map(n => ({ id: n.id }));
            LocalNotifications.cancel({ notifications: ids });
          }
        });
      } catch (cancelError) {
        console.error('Error cancelling previous notifications:', cancelError);
      }
      
      const allTasks = getTodaysTasks();
      const incompleteTasks = allTasks.filter(task => !task.completed && task.startTime);
      
      if (incompleteTasks.length === 0) {
        console.log('No incomplete tasks to schedule notifications for');
        return;
      }
      
      console.log(`Found ${incompleteTasks.length} task(s) to schedule notifications for`);
      
      // Get current time for comparison
      const now = new Date();
      
      // Prepare notifications array
      const notifications = [];
      
      for (const task of incompleteTasks) {
        if (!task.startTime) continue;
        
        const [hours, minutes] = task.startTime.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) continue;
        
        // Create task time - set seconds and milliseconds to exactly 0 for precision
        const taskTime = new Date();
        taskTime.setHours(hours);
        taskTime.setMinutes(minutes);
        taskTime.setSeconds(0);
        taskTime.setMilliseconds(0);
        
        // Only schedule if it's in the future
        if (taskTime > now) {
          console.log(`Scheduling task "${task.title}" for ${taskTime.toLocaleTimeString()}`);
          
          notifications.push({
            id: parseInt(task.id),
            title: task.priority === 'High' ? '⭐ High Priority Task' : 'Task Reminder',
            body: `It's time for: ${task.title}`,
            schedule: { 
              at: taskTime,
              allowWhileIdle: true,
              exact: true
            },
            sound: 'default',
            smallIcon: 'ic_stat_remind_itt',
            iconColor: '#4f46e5',
            channelId: 'remind-itt-notifications',
            ongoing: false,
            autoCancel: true
          });
        } else {
          console.log(`Skipping past task "${task.title}" scheduled for ${taskTime.toLocaleTimeString()}`);
        }
      }
      
      if (notifications.length > 0) {
        console.log(`Scheduling ${notifications.length} notifications with LocalNotifications.schedule`);
        
        // Schedule notifications in smaller batches to avoid potential issues
        const batchSize = 10;
        for (let i = 0; i < notifications.length; i += batchSize) {
          const batch = notifications.slice(i, i + batchSize);
          try {
            await LocalNotifications.schedule({ notifications: batch });
            console.log(`Successfully scheduled batch of ${batch.length} notifications`);
          } catch (error) {
            console.error(`Error scheduling batch ${i/batchSize + 1}:`, error);
          }
        }
        
        // Verify notifications were scheduled
        try {
          const pending = await LocalNotifications.getPending();
          console.log(`Verified ${pending.notifications.length} pending notifications`);
          pending.notifications.forEach(n => {
            console.log(`Scheduled: ID ${n.id} at ${new Date(n.schedule?.at || 0).toLocaleTimeString()}`);
          });
        } catch (e) {
          console.error('Error verifying scheduled notifications:', e);
        }
      }
    } catch (error) {
      console.error('Error scheduling all task notifications:', error);
    }
  };

  const setupNotificationListeners = async () => {
    if (isNative) {
      try {
        await LocalNotifications.addListener('localNotificationReceived', notification => {
          console.log('Notification received in foreground:', notification);
        });
        
        await LocalNotifications.addListener('localNotificationActionPerformed', notification => {
          console.log('Notification action performed:', notification);
        });
      } catch (error) {
        console.error('Error setting up notification listeners:', error);
      }
    }
  };

  useEffect(() => {
    if (!notificationsEnabled) return;

    console.log('Setting up task reminder system');

    // Reschedule all notifications whenever enabled
    const setupNotifications = async () => {
      await setupNotificationListeners();
      await scheduleAllTaskNotifications();
    };

    setupNotifications();

    // Use more precise timing for the real-time checker
    const checkDueTasks = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Only run a full check at the start of each minute (when seconds are near 0)
      // This helps ensure we don't miss notifications due to timing issues
      if (now.getSeconds() <= 3) {
        console.log(`Checking tasks at exactly ${currentHour}:${currentMinute}`);
        
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
              showNotification('Task Reminder', `It's time for: ${task.title}`, task.priority);
            }
          }
        });
      }
    };

    // Check more frequently (every 3 seconds) to ensure we catch the start of minutes
    const intervalId = setInterval(checkDueTasks, 3000);
    
    // Inside the useEffect, remove the Capacitor-specific app state change detection
    // and rely on the browser-based visibility APIs which work on all platforms
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
  }, [notificationsEnabled, getTodaysTasks, isNative, showNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        requestNotificationPermission,
        showNotification,
        toggleNotifications,
        sendTestNotification,
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
