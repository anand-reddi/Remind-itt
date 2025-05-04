
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

// Cache name for app shell resources
const CACHE_NAME = 'remind-itt-v1';

// Add fetch handler for improved offline experience
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle app shell caching for offline support
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Clone the response since we're consuming it twice
            const responseToCache = response.clone();
            
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
            
            return response;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // Return a basic offline page for HTML requests
            if (event.request.headers.get('Accept').includes('text/html')) {
              return caches.match('/');
            }
          });
      })
  );
});

// Clean up old caches during activation
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
