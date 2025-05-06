
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTasks, TaskPriority } from './TaskContext';
import { toast } from '@/components/ui/sonner';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

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
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Maximum notifications to schedule in a single batch
const MAX_BATCH_SIZE = 25;
// Delay for retry in ms (2 seconds)
const RETRY_DELAY = 2000;
// Throttle interval for checking due tasks (6 seconds)
const CHECK_INTERVAL = 6000;

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
          
          // Setup notification listeners
          setupNotificationListeners();
          
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

  // Enhanced showNotification with options parameter for better flexibility
  const showNotification = async (title: string, body: string, options?: {
    priority?: TaskPriority;
    id?: number;
    schedule?: Date;
    sound?: boolean;
  }) => {
    if (!notificationsEnabled) return;
    
    const priority = options?.priority || 'Medium';
    const notificationId = options?.id || Math.floor(Math.random() * 100000);
    const useSound = options?.sound !== false; // Default to true if not specified

    console.log(`Showing notification: "${title}", priority: ${priority}, id: ${notificationId}`);

    if (isNative) {
      try {
        console.log(`Sending native notification #${notificationId}`);
        
        const notificationConfig = {
          notifications: [
            {
              title,
              body,
              id: notificationId,
              sound: useSound ? 'default' : null,
              smallIcon: 'ic_stat_remind_itt',
              iconColor: '#4f46e5',
              channelId: 'remind-itt-notifications',
              ongoing: false,
              autoCancel: true
            },
          ],
        };
        
        // Add schedule if provided
        if (options?.schedule) {
          notificationConfig.notifications[0].schedule = { 
            at: options.schedule,
            allowWhileIdle: true,
            exact: true
          };
        }
        
        await LocalNotifications.schedule(notificationConfig);
        console.log(`Native notification #${notificationId} sent successfully`);
      } catch (error) {
        console.error('Failed to send notification:', error);
        
        // Retry once after a delay
        setTimeout(async () => {
          try {
            console.log(`Retrying notification #${notificationId} after failure`);
            await LocalNotifications.schedule({
              notifications: [
                {
                  title,
                  body,
                  id: notificationId,
                  sound: useSound ? 'default' : null,
                  smallIcon: 'ic_stat_remind_itt',
                  iconColor: '#4f46e5',
                  channelId: 'remind-itt-notifications',
                }
              ]
            });
            console.log(`Retry for notification #${notificationId} successful`);
          } catch (retryError) {
            console.error('Retry also failed for notification:', retryError);
            
            // Fallback to toast
            toast.info(`${title}: ${body}`, {
              duration: 5000,
              important: priority === 'High'
            });
          }
        }, RETRY_DELAY);
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
  
  // New method to cancel a notification for a specific task
  const cancelNotificationForTask = async (taskId: string) => {
    if (!isNative) return;
    
    try {
      // Convert string ID to number
      const numericId = parseInt(taskId);
      if (isNaN(numericId)) {
        console.log(`Cannot cancel notification for task ${taskId} - invalid ID format`);
        return;
      }
      
      console.log(`Cancelling notification for task ID: ${taskId}`);
      
      await LocalNotifications.cancel({
        notifications: [{ id: numericId }]
      });
      
      console.log(`Successfully cancelled notification for task ID: ${taskId}`);
    } catch (error) {
      console.error(`Error cancelling notification for task ${taskId}:`, error);
    }
  };

  // Enhanced method with batching, retry logic and more robust error handling
  const scheduleAllTaskNotifications = async () => {
    if (!isNative || !notificationsEnabled) return;
    
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
        // Continue anyway, as this is not critical
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
            id: parseInt(task.id.replace(/\D/g, '').slice(-5)), // Extract numbers from task ID and use last 5 digits
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
        const batchSize = MAX_BATCH_SIZE;
        let batchSuccess = true;
        
        for (let i = 0; i < notifications.length; i += batchSize) {
          const batch = notifications.slice(i, i + batchSize);
          try {
            await LocalNotifications.schedule({ notifications: batch });
            console.log(`Successfully scheduled batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(notifications.length/batchSize)} (${batch.length} notifications)`);
          } catch (error) {
            console.error(`Error scheduling batch ${Math.floor(i/batchSize) + 1}:`, error);
            batchSuccess = false;
            
            // Try scheduling one by one as a fallback for this batch
            console.log(`Trying to schedule batch ${Math.floor(i/batchSize) + 1} one by one`);
            for (const notification of batch) {
              try {
                await LocalNotifications.schedule({ 
                  notifications: [notification] 
                });
                console.log(`Successfully scheduled individual notification for ID ${notification.id}`);
              } catch (individualError) {
                console.error(`Failed to schedule individual notification for ID ${notification.id}:`, individualError);
                
                // One final retry after a delay
                setTimeout(async () => {
                  try {
                    await LocalNotifications.schedule({ 
                      notifications: [notification] 
                    });
                    console.log(`Retry successful for notification ID ${notification.id}`);
                  } catch (retryError) {
                    console.error(`Retry also failed for notification ID ${notification.id}:`, retryError);
                  }
                }, RETRY_DELAY);
              }
            }
          }
        }
        
        // Verify notifications were scheduled if all batches were successful
        if (batchSuccess) {
          try {
            const pending = await LocalNotifications.getPending();
            console.log(`Verified ${pending.notifications.length} pending notifications`);
            if (pending.notifications.length > 0 && pending.notifications.length < 5) {
              // Only log details if there are a reasonable number to show
              pending.notifications.forEach(n => {
                console.log(`Scheduled: ID ${n.id} at ${new Date(n.schedule?.at || 0).toLocaleTimeString()}`);
              });
            }
          } catch (e) {
            console.error('Error verifying scheduled notifications:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling all task notifications:', error);
    }
  };
  
  // New method to allow external components to trigger a full reschedule
  const rescheduleAllNotifications = async () => {
    if (!notificationsEnabled) {
      console.log('Notifications not enabled - skipping reschedule');
      return;
    }
    
    console.log('Manual reschedule of all notifications requested');
    await scheduleAllTaskNotifications();
    console.log('Manual reschedule completed');
  };

  // Improved notification listeners setup
  const setupNotificationListeners = async () => {
    if (isNative) {
      try {
        // Remove existing listeners first to avoid duplicates
        try {
          await LocalNotifications.removeAllListeners();
          console.log('Removed existing notification listeners');
        } catch (err) {
          console.error('Error removing existing listeners:', err);
        }
        
        // Set up notification received listener
        await LocalNotifications.addListener('localNotificationReceived', notification => {
          console.log('Notification received in foreground:', {
            id: notification.id,
            title: notification.title,
            body: notification.body
          });
        });
        
        // Set up notification action listener
        await LocalNotifications.addListener('localNotificationActionPerformed', notificationAction => {
          console.log('Notification action performed:', {
            id: notificationAction.notification.id,
            title: notificationAction.notification.title,
            actionId: notificationAction.actionId
          });
          
          // You can add custom action handling here based on actionId
          try {
            // Navigate to relevant app section or perform action
            console.log('Handling notification action');
            
            // For now, just log it. In future could navigate to task details, etc.
          } catch (error) {
            console.error('Error handling notification action:', error);
          }
        });
        
        console.log('Notification listeners set up successfully');
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

    // Throttle checking to reduce resource usage (check every 6 seconds)
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
