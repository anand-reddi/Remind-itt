
import { TaskPriority } from '@/contexts/TaskContext';

// Web notification handling service
export class WebNotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    this.initServiceWorker();
  }

  // Initialize service worker for web notifications
  private async initServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      console.log('Setting up web service worker');
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('ServiceWorker registration successful');
        this.swRegistration = registration;
      } catch (error) {
        console.error('ServiceWorker registration failed: ', error);
      }
    }
  }

  // Get the service worker registration
  public getRegistration(): ServiceWorkerRegistration | null {
    return this.swRegistration;
  }

  // Check if web notifications are supported
  public isSupported(): boolean {
    return 'Notification' in window;
  }

  // Check if web notifications are allowed
  public isPermissionGranted(): boolean {
    return this.isSupported() && Notification.permission === 'granted';
  }

  // Show a web notification
  public showNotification(
    title: string, 
    body: string, 
    options?: { priority?: TaskPriority }
  ): void {
    const priority = options?.priority || 'Medium';
    
    if (this.isPermissionGranted()) {
      const notifyOptions = {
        body,
        icon: '/icon-192x192.png',
        vibrate: priority === 'High' ? [200, 100, 200] : [100],
        badge: '/icon-192x192.png',
        data: { url: window.location.origin },
      };
      
      try {
        if (this.swRegistration) {
          this.swRegistration.showNotification(title, notifyOptions);
          console.log('ServiceWorker notification shown');
        } else {
          new Notification(title, notifyOptions);
          console.log('Standard web notification shown');
        }
      } catch (error) {
        console.error('Failed to show web notification:', error);
      }
    }
  }
}

export default new WebNotificationService();
