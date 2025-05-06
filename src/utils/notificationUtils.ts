
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { TaskPriority } from '@/contexts/TaskContext';
import { toast } from '@/components/ui/sonner';

// Constants for notification handling
export const MAX_BATCH_SIZE = 25;
export const RETRY_DELAY = 2000; // 2 seconds
export const CHECK_INTERVAL = 6000; // 6 seconds

// Determine if running on a native platform
export const isNativePlatform = (): boolean => {
  const platform = Capacitor.getPlatform();
  return platform === 'android' || platform === 'ios';
};

// Check native notification permissions without requesting them
export const checkNotificationPermissions = async (): Promise<boolean> => {
  if (!isNativePlatform()) return false;
  
  try {
    const permStatus = await LocalNotifications.checkPermissions();
    console.log('Local notification permission status:', permStatus);
    
    if (permStatus.display === 'granted') {
      return true;
    } else {
      console.log('Notification permissions not granted yet');
      return false;
    }
  } catch (error) {
    console.error('Error checking notification permissions:', error);
    return false;
  }
};

// Request notification permissions
export const requestNotificationPermission = async (): Promise<boolean> => {
  console.log('Requesting notification permission, isNative:', isNativePlatform());
  
  if (isNativePlatform()) {
    try {
      // First check existing permissions
      const currentPermissions = await LocalNotifications.checkPermissions();
      console.log('Current permission status:', currentPermissions);
      
      if (currentPermissions.display === 'granted') {
        console.log('Permissions already granted');
        localStorage.setItem('notificationsEnabled', 'true');
        return true;
      }
      
      // Request local notification permission
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
          
          localStorage.setItem('notificationsEnabled', 'true');
          toast.success('Notifications enabled successfully');
          return true;
        } catch (error) {
          console.error('Error during notification setup:', error);
          // Continue anyway with local notifications
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
      localStorage.setItem('notificationsEnabled', 'true');
      return true;
    }
    
    try {
      const permission = await Notification.requestPermission();
      console.log('Web notification permission result:', permission);
      
      if (permission === 'granted') {
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

// Setup notification listeners
export const setupNotificationListeners = async (): Promise<void> => {
  if (!isNativePlatform()) return;

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
      } catch (error) {
        console.error('Error handling notification action:', error);
      }
    });
    
    console.log('Notification listeners set up successfully');
  } catch (error) {
    console.error('Error setting up notification listeners:', error);
  }
};

// Debug platform notification capabilities
export const debugNotificationCapabilities = (): void => {
  if (isNativePlatform()) {
    console.log('Checking notification capabilities on native platform');
    
    // Capacitor capabilities logging
    const cap = Capacitor.isPluginAvailable('LocalNotifications');
    console.log('LocalNotifications plugin available:', cap);
    
    const push = Capacitor.isPluginAvailable('PushNotifications');
    console.log('PushNotifications plugin available:', push);

    const appPlugin = Capacitor.isPluginAvailable('App');
    console.log('App plugin available:', appPlugin);
  }
};
