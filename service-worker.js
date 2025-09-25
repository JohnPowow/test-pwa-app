const CACHE_NAME = 'test-pwa-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Install event');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: All files cached');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activate event');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('Service Worker: Claiming clients');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    console.log('Service Worker: Fetch event for', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                if (response) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return response;
                }
                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request).then((response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response as it's a stream and can only be consumed once
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Handle background sync for badge updates (optional enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-badge-sync') {
        console.log('Service Worker: Background sync for badge update');
        // Could implement background badge updates here
    }
});

// Handle push notifications (for future enhancements)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push event received');
    // Could handle push notifications to trigger badge updates
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked');
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('/')
    );
});