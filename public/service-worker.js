
// Service Worker for handling push notifications and offline functionality
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting(); // Force activation for new service worker
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim()); // Take control of all clients
});

self.addEventListener('push', (event) => {
  let data = { title: 'New Notification', body: 'You have a new notification', priority: 'Medium' };
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error('Error parsing push notification data', e);
  }
  
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
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Handle fetch events for network requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // For HTML requests, return the index page for offline navigation
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            return new Response('Network error', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});
