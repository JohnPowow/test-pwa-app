const CACHE_NAME = 'test-pwa-v3'; // Updated version to force refresh
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json'
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
                // Force immediate activation
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Cache failed', error);
                throw error;
            })
    );
});

// NOTE: Enhanced activate event handler is at the bottom of the file

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

// Simulate checking for updates
async function checkForUpdates() {
    // In a real app, this might check an API, IndexedDB, or other data source
    const random = Math.random();
    console.log('Service Worker: Checking for updates...', random);
    
    // Simulate 70% chance of having updates
    return random > 0.3;
}

// Global badge manager instance
const badgeManager = new BackgroundBadgeManager();

// NOTE: Enhanced sync handler is below with keep-alive functionality

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
            // Open new window with correct path for GitHub Pages
            await self.clients.openWindow('./');
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

// NOTE: Enhanced message handler is below with additional functionality

// Periodic background task to keep service worker active
let keepAliveInterval;

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activate event');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Claim all clients immediately
            self.clients.claim()
        ]).then(() => {
            console.log('Service Worker: Activated and claiming clients');
            
            // Start keep-alive mechanism
            startKeepAlive();
            
            // Start periodic background badge updates to ensure persistence
            startPeriodicBadgeUpdates();
            
            // Notify clients that SW is ready
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_ACTIVATED',
                        message: 'Service Worker activated and ready'
                    });
                });
            });
        }).catch(error => {
            console.error('Service Worker: Activation failed', error);
        })
    );
});

// Keep service worker alive with enhanced persistence
function startKeepAlive() {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }
    
    keepAliveInterval = setInterval(() => {
        console.log('Service Worker: Keep alive ping');
        
        // Perform badge operations to keep SW active
        if (Math.random() > 0.8) { // 20% chance
            console.log('Service Worker: Performing background badge check');
            checkForUpdates().then(shouldUpdate => {
                if (shouldUpdate) {
                    badgeManager.incrementBadge();
                }
            }).catch(err => {
                console.log('Background check error:', err);
            });
        }
        
        // Register periodic sync to ensure background capability
        if (self.registration && self.registration.sync) {
            self.registration.sync.register('keep-alive-sync').catch(err => {
                console.log('Keep-alive sync registration failed:', err);
            });
        }
    }, 20000); // Every 20 seconds (well before 30s timeout)
}

// Enhanced background sync for keep-alive
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync event:', event.tag);
    
    if (event.tag === 'background-badge-sync') {
        event.waitUntil(handleBackgroundBadgeSync());
    } else if (event.tag === 'periodic-badge-update') {
        event.waitUntil(handlePeriodicBadgeUpdate());
    } else if (event.tag === 'keep-alive-sync') {
        event.waitUntil(handleKeepAliveSync());
    }
});

// Keep-alive sync handler
async function handleKeepAliveSync() {
    console.log('Service Worker: Handling keep-alive sync');
    
    try {
        // Perform a badge operation to demonstrate background capability
        const shouldUpdate = await checkForUpdates();
        
        if (shouldUpdate) {
            await badgeManager.incrementBadge();
            console.log('Service Worker: Badge updated during keep-alive sync');
            
            // Show notification to prove SW is working in background
            if (Notification.permission === 'granted') {
                await self.registration.showNotification('Background Active', {
                    body: 'Service Worker is running in background! Badge updated.',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐱</text></svg>',
                    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔄</text></svg>',
                    tag: 'keep-alive',
                    silent: true,
                    data: {
                        action: 'keep-alive',
                        timestamp: Date.now()
                    }
                });
            }
        }
        
        return true;
    } catch (error) {
        console.error('Service Worker: Keep-alive sync failed:', error);
        return false;
    }
}

// Periodic background badge updates to ensure SW persistence
let periodicBadgeInterval;

function startPeriodicBadgeUpdates() {
    if (periodicBadgeInterval) {
        clearInterval(periodicBadgeInterval);
    }
    
    // Start periodic badge updates every 2 minutes
    periodicBadgeInterval = setInterval(async () => {
        console.log('Service Worker: Periodic badge update check');
        
        try {
            const shouldUpdate = await checkForUpdates();
            if (shouldUpdate) {
                await badgeManager.incrementBadge();
                console.log('Service Worker: Periodic badge updated to', badgeManager.badgeCount);
                
                // Show silent notification to prove background operation
                if (self.registration && Notification.permission === 'granted') {
                    await self.registration.showNotification('Background Badge Update', {
                        body: `Badge automatically updated to ${badgeManager.badgeCount}`,
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🐱</text></svg>',
                        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔄</text></svg>',
                        tag: 'periodic-update',
                        silent: true,
                        requireInteraction: false,
                        data: {
                            action: 'periodic-update',
                            count: badgeManager.badgeCount,
                            timestamp: Date.now()
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Service Worker: Periodic badge update failed:', error);
        }
    }, 120000); // Every 2 minutes
}

// Enhanced message handling for manual badge operations
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
                    badgeManager.clearBadge().then(() => {
                        badgeManager.resetCount(); // Reset internal counter
                    })
                );
                break;
                
            case 'START_BACKGROUND_SYNC':
                event.waitUntil(
                    self.registration.sync.register('background-badge-sync')
                );
                break;
                
            case 'START_PERIODIC_UPDATES':
                startPeriodicBadgeUpdates();
                break;
                
            case 'STOP_PERIODIC_UPDATES':
                if (periodicBadgeInterval) {
                    clearInterval(periodicBadgeInterval);
                }
                break;
                
            case 'PING':
                // Keep alive ping
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ type: 'PONG', timestamp: Date.now() });
                }
                break;
                
            case 'GET_BADGE_COUNT':
                if (event.ports && event.ports[0]) {
                    event.ports[0].postMessage({ 
                        type: 'BADGE_COUNT', 
                        count: badgeManager.badgeCount 
                    });
                }
                break;
        }
    }
});

// Stop intervals when not needed
self.addEventListener('beforeunload', () => {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
    }
    if (periodicBadgeInterval) {
        clearInterval(periodicBadgeInterval);
    }
});

// Listen for visibility changes to adjust behavior
self.addEventListener('visibilitychange', () => {
    console.log('Service Worker: Visibility changed');
    // Service worker will continue running regardless of visibility
});