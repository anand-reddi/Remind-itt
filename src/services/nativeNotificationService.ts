
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { RETRY_DELAY, MAX_BATCH_SIZE } from '@/utils/notificationUtils';
import { TaskPriority } from '@/contexts/TaskContext';
import { toast } from '@/components/ui/sonner';

// Native notification handling service
class NativeNotificationService {
  // Send a test notification to verify functionality
  public async sendTestNotification(): Promise<void> {
    try {
      // First check if we have permission
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        console.log('No permission to send notifications');
        toast.error('Unable to send test notification - permission denied');
        return;
      }
      
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
            schedule: { 
              at: new Date(Date.now() + 1000), // Schedule 1 second in the future
              allowWhileIdle: true
            }
          }
        ]
      });
      console.log('Test notification sent successfully');
      toast.success('Test notification sent with sound');
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send test notification');
      
      // Try a fallback notification without schedule
      try {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Test Notification (Fallback)',
              body: 'This is a fallback test notification',
              id: Math.floor(Math.random() * 100000),
              sound: 'default',
              smallIcon: 'ic_stat_remind_itt',
              iconColor: '#4f46e5',
              channelId: 'remind-itt-notifications'
            }
          ]
        });
        console.log('Fallback test notification sent');
        toast.success('Fallback test notification sent');
      } catch (fallbackError) {
        console.error('Fallback notification also failed:', fallbackError);
      }
    }
  }

  // Show a notification with retry mechanism
  public async showNotification(
    title: string, 
    body: string, 
    options?: {
      priority?: TaskPriority;
      id?: number;
      schedule?: Date;
      sound?: boolean;
    }
  ): Promise<void> {
    const priority = options?.priority || 'Medium';
    const notificationId = options?.id || Math.floor(Math.random() * 100000);
    const useSound = options?.sound !== false; // Default to true if not specified

    console.log(`Showing notification: "${title}", priority: ${priority}, id: ${notificationId}`);

    try {
      // Check permissions first
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        console.log('No permission to show notification');
        toast.info(`${title}: ${body}`, {
          duration: 5000,
          important: priority === 'High'
        });
        return;
      }
      
      console.log(`Sending native notification #${notificationId}`);
      
      const notification = {
        title,
        body,
        id: notificationId,
        sound: useSound ? 'default' : null,
        smallIcon: 'ic_stat_remind_itt',
        iconColor: '#4f46e5',
        channelId: 'remind-itt-notifications',
        ongoing: false,
        autoCancel: true
      };
      
      // Create notification object with consistent type
      const notificationConfig: any = {
        notifications: [notification],
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
          const retryNotification = {
            title,
            body,
            id: notificationId,
            sound: useSound ? 'default' : null,
            smallIcon: 'ic_stat_remind_itt',
            iconColor: '#4f46e5',
            channelId: 'remind-itt-notifications',
          };
          
          // Create retry notification with consistent type
          const retryConfig: any = {
            notifications: [retryNotification],
          };
          
          if (options?.schedule) {
            retryConfig.notifications[0].schedule = { 
              at: options.schedule,
              allowWhileIdle: true,
              exact: true
            };
          }
          
          await LocalNotifications.schedule(retryConfig);
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
  }

  // Clear all notifications
  public async clearAllNotifications(): Promise<void> {
    try {
      console.log('Clearing all notifications');
      await LocalNotifications.getPending().then(pending => {
        if (pending.notifications && pending.notifications.length > 0) {
          console.log(`Cancelling ${pending.notifications.length} pending notifications`);
          const ids = pending.notifications.map(n => ({ id: n.id }));
          LocalNotifications.cancel({ notifications: ids });
        }
      });
      
      // Also cancel any delivered notifications
      await LocalNotifications.removeAllDeliveredNotifications();
      console.log('All delivered notifications removed');
      
      toast.success('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  // Cancel a notification for a specific task
  public async cancelNotificationForTask(taskId: string): Promise<void> {
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
  }

  // Schedule task notifications with batching and retry logic
  public async scheduleTaskNotifications(tasks: any[]): Promise<void> {
    try {
      // Check permissions first
      const permStatus = await LocalNotifications.checkPermissions();
      if (permStatus.display !== 'granted') {
        console.log('No permission to schedule notifications');
        return;
      }
      
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
      
      const incompleteTasks = tasks.filter(task => !task.completed && task.startTime);
      
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
  }
  
  // Setup push notifications
  public async setupPushNotifications(): Promise<void> {
    try {
      console.log('Setting up push notification handlers');
      
      // Register push notification handlers
      await PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success:', token.value);
      });
      
      await PushNotifications.addListener('registrationError', (err) => {
        console.error('Push registration failed:', err.error);
      });
      
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
      });
    } catch (error) {
      console.error('Error setting up push notification handlers:', error);
    }
  }
}

export default new NativeNotificationService();
