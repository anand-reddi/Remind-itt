
// Service Worker for handling push notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting(); // Force activation for new service worker
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim()); // Take control of all clients
});

self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  // Default options
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  // Apply priority-specific options if provided
  if (data.priority) {
    switch (data.priority) {
      case 'High':
        options.vibrate = [200, 100, 200, 100, 200];
        options.requireInteraction = true;
        options.tag = 'high-priority';
        break;
      case 'Medium':
        options.vibrate = [100, 50, 100];
        options.tag = 'medium-priority';
        break;
      case 'Low':
        options.vibrate = [50];
        options.tag = 'low-priority';
        break;
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
