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

// Background badge management
class BackgroundBadgeManager {
    constructor() {
        this.badgeCount = 0;
        this.isActive = false;
    }
    
    async setBadge(count = 1) {
        try {
            if ('setAppBadge' in navigator) {
                await navigator.setAppBadge(count);
                console.log('Service Worker: Badge set to', count);
                return true;
            }
        } catch (error) {
            console.error('Service Worker: Failed to set badge:', error);
        }
        return false;
    }
    
    async clearBadge() {
        try {
            if ('clearAppBadge' in navigator) {
                await navigator.clearAppBadge();
                console.log('Service Worker: Badge cleared');
                return true;
            }
        } catch (error) {
            console.error('Service Worker: Failed to clear badge:', error);
        }
        return false;
    }
    
    async incrementBadge() {
        this.badgeCount++;
        return await this.setBadge(this.badgeCount);
    }
    
    resetCount() {
        this.badgeCount = 0;
    }
}

// Global badge manager instance
const badgeManager = new BackgroundBadgeManager();

// Handle background sync for badge updates
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync event:', event.tag);
    
    if (event.tag === 'background-badge-sync') {
        event.waitUntil(
            handleBackgroundBadgeSync()
        );
    } else if (event.tag === 'periodic-badge-update') {
        event.waitUntil(
            handlePeriodicBadgeUpdate()
        );
    }
});

// Background badge sync handler
async function handleBackgroundBadgeSync() {
    console.log('Service Worker: Handling background badge sync');
    
    try {
        // Simulate some background work (e.g., checking for updates)
        const shouldUpdateBadge = await checkForUpdates();
        
        if (shouldUpdateBadge) {
            await badgeManager.incrementBadge();
            
            // Optionally show a notification
            await self.registration.showNotification('Badge Updated', {
                body: `Badge count: ${badgeManager.badgeCount}`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐱</text></svg>',
                badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔴</text></svg>',
                tag: 'badge-update',
                renotify: true,
                data: {
                    action: 'badge-update',
                    count: badgeManager.badgeCount
                }
            });
        }
        
        return true;
    } catch (error) {
        console.error('Service Worker: Background badge sync failed:', error);
        return false;
    }
}

// Periodic badge update handler
async function handlePeriodicBadgeUpdate() {
    console.log('Service Worker: Handling periodic badge update');
    
    try {
        // Increment badge every time this runs
        await badgeManager.incrementBadge();
        
        // Schedule next update (simulate periodic activity)
        setTimeout(() => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
                navigator.serviceWorker.ready.then(registration => {
                    if ('sync' in window && registration.sync) {
                        return registration.sync.register('periodic-badge-update');
                    }
                });
            }
        }, 30000); // Every 30 seconds when active
        
        return true;
    } catch (error) {
        console.error('Service Worker: Periodic badge update failed:', error);
        return false;
    }
}

// Simulate checking for updates
async function checkForUpdates() {
    // In a real app, this might check an API, IndexedDB, or other data source
    const random = Math.random();
    console.log('Service Worker: Checking for updates...', random);
    
    // Simulate 70% chance of having updates
    return random > 0.3;
}

// Handle push notifications for badge updates
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push event received', event);
    
    let notificationData = {
        title: 'Push Notification',
        body: 'Badge update via push',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐱</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔴</text></svg>',
        tag: 'push-badge-update'
    };
    
    // Parse push data if available
    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = { ...notificationData, ...data };
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }
    
    event.waitUntil(
        handlePushNotification(notificationData)
    );
});

// Handle push notification
async function handlePushNotification(data) {
    try {
        // Update badge based on push data
        if (data.badgeCount !== undefined) {
            await badgeManager.setBadge(data.badgeCount);
        } else {
            await badgeManager.incrementBadge();
        }
        
        // Show notification
        await self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            badge: data.badge,
            tag: data.tag || 'push-notification',
            data: {
                action: 'push-received',
                badgeCount: badgeManager.badgeCount
            }
        });
        
        return true;
    } catch (error) {
        console.error('Service Worker: Failed to handle push notification:', error);
        return false;
    }
}

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event);
    
    event.notification.close();
    
    // Handle different notification actions
    const data = event.notification.data || {};
    
    event.waitUntil(
        handleNotificationClick(data)
    );
});

// Handle notification click
async function handleNotificationClick(data) {
    try {
        // Open the app
        const clients = await self.clients.matchAll({ type: 'window' });
        
        if (clients.length > 0) {
            // Focus existing window
            await clients[0].focus();
        } else {
            // Open new window
            await self.clients.openWindow('/');
        }
        
        // Optionally clear badge when notification is clicked
        if (data.action === 'badge-update' || data.action === 'push-received') {
            // You could clear the badge here or leave it for user to clear manually
            // await badgeManager.clearBadge();
        }
        
        return true;
    } catch (error) {
        console.error('Service Worker: Failed to handle notification click:', error);
        return false;
    }
}

// Keep service worker alive with periodic tasks
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SET_BADGE':
                event.waitUntil(
                    badgeManager.setBadge(event.data.count || 1)
                );
                break;
                
            case 'CLEAR_BADGE':
                event.waitUntil(
                    badgeManager.clearBadge()
                );
                break;
                
            case 'START_BACKGROUND_SYNC':
                event.waitUntil(
                    self.registration.sync.register('background-badge-sync')
                );
                break;
                
            case 'PING':
                // Keep alive ping
                event.ports[0].postMessage({ type: 'PONG' });
                break;
        }
    }
});

// Periodic background task to keep service worker active
let keepAliveInterval;

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
            
            // Start keep-alive mechanism
            startKeepAlive();
            
            return self.clients.claim();
        })
    );
});

// Keep service worker alive
function startKeepAlive() {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }
    
    keepAliveInterval = setInterval(() => {
        console.log('Service Worker: Keep alive ping');
        // This keeps the service worker active
    }, 25000); // Every 25 seconds (before 30s timeout)
}

// Stop keep-alive when not needed
self.addEventListener('beforeunload', () => {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }
});