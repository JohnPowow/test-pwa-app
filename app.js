// App Badge Demo JavaScript
class BadgeDemo {
    constructor() {
        this.setBadgeBtn = document.getElementById('setBadgeBtn');
        this.clearBadgeBtn = document.getElementById('clearBadgeBtn');
        this.status = document.getElementById('status');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        
        // New background sync buttons
        this.backgroundSyncBtn = document.getElementById('backgroundSyncBtn');
        this.swBadgeBtn = document.getElementById('swBadgeBtn');
        this.swClearBtn = document.getElementById('swClearBtn');
        this.checkSWBtn = document.getElementById('checkSWBtn');
        this.reregisterSWBtn = document.getElementById('reregisterSWBtn');
        this.startPeriodicBtn = document.getElementById('startPeriodicBtn');
        this.swStatus = document.getElementById('swStatus');
        
        this.timeoutId = null;
        
        this.init();
    }
    
    init() {
        // Check if setAppBadge is supported
        this.checkBadgeSupport();
        
        // Set up event listeners
        this.setBadgeBtn.addEventListener('click', () => this.startBadgeTimer());
        this.clearBadgeBtn.addEventListener('click', () => this.clearBadge());
        
        // Background sync event listeners
        if (this.backgroundSyncBtn) {
            this.backgroundSyncBtn.addEventListener('click', () => this.triggerBackgroundSync());
        }
        if (this.swBadgeBtn) {
            this.swBadgeBtn.addEventListener('click', () => this.setBadgeViaSW());
        }
        if (this.swClearBtn) {
            this.swClearBtn.addEventListener('click', () => this.clearBadgeViaSW());
        }
        if (this.checkSWBtn) {
            this.checkSWBtn.addEventListener('click', () => window.swManager?.checkSWStatus());
        }
        if (this.reregisterSWBtn) {
            this.reregisterSWBtn.addEventListener('click', () => this.reregisterSW());
        }
        if (this.startPeriodicBtn) {
            this.startPeriodicBtn.addEventListener('click', () => this.startPeriodicFromUI());
        }
        
        // Check for URL parameters (for shortcuts)
        this.checkURLParams();
        
        // Hide loading indicator initially
        this.loadingIndicator.style.display = 'none';
    }
    
    checkBadgeSupport() {
        if ('setAppBadge' in navigator) {
            this.updateStatus('✅ App Badge API is supported!', 'success');
        } else {
            this.updateStatus('⚠️ App Badge API is not supported in this browser. Try Chrome/Edge on Android or desktop.', 'warning');
            this.setBadgeBtn.disabled = true;
            this.clearBadgeBtn.disabled = true;
        }
    }
    
    checkURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('action') === 'setBadge') {
            // Auto-trigger if launched from shortcut
            setTimeout(() => this.startBadgeTimer(), 1000);
        }
    }
    
    startBadgeTimer() {
        if (!('setAppBadge' in navigator)) {
            this.updateStatus('❌ App Badge API not supported', 'error');
            return;
        }
        
        // Clear any existing timer
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        
        // Disable button and show loading
        this.setBadgeBtn.disabled = true;
        this.loadingIndicator.style.display = 'inline';
        
        // Start countdown
        this.startCountdown(10);

        // Set the timeout for 10 seconds
        this.timeoutId = setTimeout(() => {
            this.setBadge();
        }, 10000);

        this.updateStatus('⏱️ Timer started! Badge will be set in 10 seconds...', 'info');
    }
    
    startCountdown(seconds) {
        let remaining = seconds;
        
        const updateCountdown = () => {
            if (remaining > 0) {
                const buttonText = this.setBadgeBtn.querySelector('.button-text');
                buttonText.textContent = `Setting badge in ${remaining}s...`;
                remaining--;
                setTimeout(updateCountdown, 1000);
            } else {
                const buttonText = this.setBadgeBtn.querySelector('.button-text');
                buttonText.textContent = 'Set Badge (10s delay)';
            }
        };
        
        updateCountdown();
    }
    
    async setBadge() {
        try {
            // Set the badge with number 1
            await navigator.setAppBadge(1);
            
            this.updateStatus('🎉 Badge set successfully! Check your app icon.', 'success');
            
            // Re-enable button and hide loading
            this.setBadgeBtn.disabled = false;
            this.loadingIndicator.style.display = 'none';
            
            // Reset button text
            const buttonText = this.setBadgeBtn.querySelector('.button-text');
            buttonText.textContent = 'Set Badge (10s delay)';
            
        } catch (error) {
            console.error('Failed to set badge:', error);
            this.updateStatus('❌ Failed to set badge: ' + error.message, 'error');
            
            // Re-enable button and hide loading
            this.setBadgeBtn.disabled = false;
            this.loadingIndicator.style.display = 'none';
            
            // Reset button text
            const buttonText = this.setBadgeBtn.querySelector('.button-text');
            buttonText.textContent = 'Set Badge (10s delay)';
        }
    }
    
    async clearBadge() {
        try {
            // Clear any pending timer
            if (this.timeoutId) {
                clearTimeout(this.timeoutId);
                this.timeoutId = null;
                
                // Re-enable set button and hide loading
                this.setBadgeBtn.disabled = false;
                this.loadingIndicator.style.display = 'none';
                
                // Reset button text
                const buttonText = this.setBadgeBtn.querySelector('.button-text');
                buttonText.textContent = 'Set Badge (10s delay)';
            }
            
            // Clear the badge
            await navigator.clearAppBadge();
            
            this.updateStatus('🧹 Badge cleared successfully!', 'success');
            
        } catch (error) {
            console.error('Failed to clear badge:', error);
            this.updateStatus('❌ Failed to clear badge: ' + error.message, 'error');
        }
    }
    
    updateStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
        
        // Auto-clear status after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                this.status.textContent = '';
                this.status.className = 'status';
            }, 5000);
        }
    }
    
    updateSWStatus(message, type = 'info') {
        if (this.swStatus) {
            this.swStatus.textContent = message;
            this.swStatus.className = `status ${type}`;
            
            // Auto-clear status after 5 seconds for success messages
            if (type === 'success') {
                setTimeout(() => {
                    this.swStatus.textContent = '';
                    this.swStatus.className = 'status';
                }, 5000);
            }
        }
    }
    
    async triggerBackgroundSync() {
        try {
            if (window.swManager) {
                await window.swManager.triggerBackgroundSync();
                this.updateSWStatus('🔄 Background sync triggered! Check your badge in a few seconds.', 'success');
            } else {
                this.updateSWStatus('❌ Service worker manager not available', 'error');
            }
        } catch (error) {
            console.error('Failed to trigger background sync:', error);
            this.updateSWStatus('❌ Failed to trigger background sync', 'error');
        }
    }
    
    async setBadgeViaSW() {
        try {
            if (window.swManager) {
                await window.swManager.setBadgeViaSW(1);
                this.updateSWStatus('🐱 Badge set via service worker!', 'success');
            } else {
                this.updateSWStatus('❌ Service worker manager not available', 'error');
            }
        } catch (error) {
            console.error('Failed to set badge via SW:', error);
            this.updateSWStatus('❌ Failed to set badge via service worker', 'error');
        }
    }
    
    async clearBadgeViaSW() {
        try {
            if (window.swManager) {
                await window.swManager.clearBadgeViaSW();
                this.updateSWStatus('🧹 Badge cleared via service worker!', 'success');
            } else {
                this.updateSWStatus('❌ Service worker manager not available', 'error');
            }
        } catch (error) {
            console.error('Failed to clear badge via SW:', error);
            this.updateSWStatus('❌ Failed to clear badge via service worker', 'error');
        }
    }
    
    async reregisterSW() {
        try {
            this.updateSWStatus('🔄 Re-registering service worker...', 'info');
            
            if (window.swManager) {
                await window.swManager.unregisterExisting();
                // Reinitialize the SW manager
                window.swManager = new ServiceWorkerManager();
                this.updateSWStatus('✅ Service worker re-registered successfully!', 'success');
            } else {
                this.updateSWStatus('❌ Service worker manager not available', 'error');
            }
        } catch (error) {
            console.error('Failed to re-register SW:', error);
            this.updateSWStatus('❌ Failed to re-register service worker', 'error');
        }
    }
    
    async startPeriodicFromUI() {
        try {
            if (window.swManager) {
                await window.swManager.startPeriodicUpdates();
                this.updateSWStatus('🔄 Periodic background updates started! Badges will update every 2 minutes.', 'success');
            } else {
                this.updateSWStatus('❌ Service worker manager not available', 'error');
            }
        } catch (error) {
            console.error('Failed to start periodic updates:', error);
            this.updateSWStatus('❌ Failed to start periodic updates', 'error');
        }
    }
}

// PWA Installation handling
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }
    
    init() {
        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('PWA: beforeinstallprompt event fired');
            
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            
            // Store the event so it can be triggered later
            this.deferredPrompt = e;
            
            // Show install button or notification
            this.showInstallOption();
        });
        
        // Listen for app installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA: App was installed');
            this.hideInstallOption();
        });
    }
    
    showInstallOption() {
        // Create install prompt if it doesn't exist
        let installBanner = document.getElementById('installBanner');
        if (!installBanner) {
            installBanner = document.createElement('div');
            installBanner.id = 'installBanner';
            installBanner.className = 'install-banner';
            installBanner.innerHTML = `
                <div class="install-content">
                    <span>🐱 Install this PWA for the best experience!</span>
                    <button id="installBtn" class="install-btn">Install</button>
                    <button id="dismissBtn" class="dismiss-btn">✕</button>
                </div>
            `;
            document.body.appendChild(installBanner);
            
            // Add event listeners
            document.getElementById('installBtn').addEventListener('click', () => this.installPWA());
            document.getElementById('dismissBtn').addEventListener('click', () => this.hideInstallOption());
        }
        
        installBanner.style.display = 'block';
    }
    
    hideInstallOption() {
        const installBanner = document.getElementById('installBanner');
        if (installBanner) {
            installBanner.style.display = 'none';
        }
    }
    
    async installPWA() {
        if (!this.deferredPrompt) {
            return;
        }
        
        // Show the install prompt
        this.deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`PWA: User response to the install prompt: ${outcome}`);
        
        // Clear the deferredPrompt
        this.deferredPrompt = null;
        
        // Hide the install option
        this.hideInstallOption();
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('App: Initializing...');
    
    // Initialize badge demo
    new BadgeDemo();
    
    // Initialize PWA installer
    new PWAInstaller();
    
    console.log('App: Initialization complete');
});

// Enhanced Service Worker Registration and Background Sync
class ServiceWorkerManager {
    constructor() {
        this.registration = null;
        this.init();
    }
    
    async init() {
        if ('serviceWorker' in navigator) {
            try {
                // Unregister any existing service workers first
                await this.unregisterExisting();
                
                // Register service worker with proper path for GitHub Pages
                this.registration = await navigator.serviceWorker.register('./service-worker.js', {
                    scope: './',
                    updateViaCache: 'none' // Force fresh fetches
                });
                
                console.log('SW registered:', this.registration);
                console.log('SW scope:', this.registration.scope);
                
                // Wait for service worker to be ready
                await navigator.serviceWorker.ready;
                console.log('SW is ready');
                
                // Set up message channel for communication
                this.setupMessageChannel();
                
                // Request notification permission
                await this.requestNotificationPermission();
                
                // Register background sync after SW is active
                setTimeout(async () => {
                    await this.registerBackgroundSync();
                    await this.startPeriodicUpdates();
                }, 1000);
                
                // Set up keep-alive mechanism
                this.startKeepAlive();
                
                // Listen for updates
                this.handleUpdates();
                
            } catch (error) {
                console.error('SW registration failed:', error);
                console.error('Error details:', error.message, error.stack);
            }
        } else {
            console.error('Service Workers not supported');
        }
    }
    
    async unregisterExisting() {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log('Found existing registrations:', registrations.length);
            
            for (let registration of registrations) {
                console.log('Unregistering:', registration.scope);
                await registration.unregister();
            }
        } catch (error) {
            console.error('Failed to unregister existing SW:', error);
        }
    }
    
    handleUpdates() {
        if (this.registration) {
            this.registration.addEventListener('updatefound', () => {
                console.log('SW update found');
                const newWorker = this.registration.installing;
                
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        console.log('SW state changed:', newWorker.state);
                        
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New SW installed, reloading page');
                            window.location.reload();
                        }
                    });
                }
            });
        }
    }
    
    setupMessageChannel() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                console.log('Message from SW:', event.data);
                
                if (event.data && event.data.type === 'SW_ACTIVATED') {
                    console.log('✅ Service Worker is now active and ready');
                    this.showSWStatus('✅ Service Worker active and ready for background operations!', 'success');
                }
            });
            
            // Monitor service worker state changes
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('SW controller changed');
                window.location.reload();
            });
        }
    }
    
    showSWStatus(message, type) {
        // Show status in the SW section if available
        const swStatus = document.getElementById('swStatus');
        if (swStatus) {
            swStatus.textContent = message;
            swStatus.className = `status ${type}`;
            
            setTimeout(() => {
                swStatus.textContent = '';
                swStatus.className = 'status';
            }, 8000);
        }
    }
    
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('Notification permission:', permission);
            return permission === 'granted';
        }
        return false;
    }
    
    async registerBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window) {
            try {
                const registration = await navigator.serviceWorker.ready;
                console.log('SW Registration state:', registration);
                console.log('SW active:', registration.active ? registration.active.state : 'none');
                console.log('SW installing:', registration.installing ? registration.installing.state : 'none');
                console.log('SW waiting:', registration.waiting ? registration.waiting.state : 'none');
                
                if ('sync' in registration && registration.active) {
                    // Register background sync for badge updates
                    await registration.sync.register('background-badge-sync');
                    console.log('✅ Background sync registered successfully');
                    this.showSWStatus('🔄 Background sync capabilities enabled', 'success');
                } else {
                    console.warn('Background sync not available or SW not active');
                }
            } catch (error) {
                console.error('Background sync registration failed:', error);
                this.showSWStatus('⚠️ Background sync registration failed', 'warning');
            }
        } else {
            console.warn('Background sync not supported');
            this.showSWStatus('⚠️ Background sync not supported in this browser', 'warning');
        }
    }
    
    // Diagnostic method to check SW status
    async checkSWStatus() {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log('=== Service Worker Diagnostics ===');
            console.log('Registrations found:', registrations.length);
            
            registrations.forEach((reg, index) => {
                console.log(`Registration ${index + 1}:`);
                console.log('  Scope:', reg.scope);
                console.log('  Active:', reg.active ? reg.active.state : 'none');
                console.log('  Installing:', reg.installing ? reg.installing.state : 'none');  
                console.log('  Waiting:', reg.waiting ? reg.waiting.state : 'none');
            });
            
            console.log('Controller:', navigator.serviceWorker.controller ? 'Present' : 'None');
            console.log('Ready state:', await navigator.serviceWorker.ready ? 'Ready' : 'Not ready');
            console.log('================================');
        } catch (error) {
            console.error('SW diagnostics failed:', error);
        }
    }
    
    async sendMessageToSW(message) {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(message);
        }
    }
    
    async setBadgeViaSW(count = 1) {
        await this.sendMessageToSW({
            type: 'SET_BADGE',
            count: count
        });
    }
    
    async clearBadgeViaSW() {
        await this.sendMessageToSW({
            type: 'CLEAR_BADGE'
        });
    }
    
    async triggerBackgroundSync() {
        await this.sendMessageToSW({
            type: 'START_BACKGROUND_SYNC'
        });
    }
    
    async startPeriodicUpdates() {
        await this.sendMessageToSW({
            type: 'START_PERIODIC_UPDATES'
        });
        console.log('✅ Periodic badge updates started');
    }
    
    async getBadgeCount() {
        return new Promise((resolve) => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const channel = new MessageChannel();
                channel.port1.onmessage = (event) => {
                    if (event.data.type === 'BADGE_COUNT') {
                        resolve(event.data.count);
                    }
                };
                navigator.serviceWorker.controller.postMessage(
                    { type: 'GET_BADGE_COUNT' },
                    [channel.port2]
                );
            } else {
                resolve(0);
            }
        });
    }
    
    // Keep service worker alive
    startKeepAlive() {
        setInterval(async () => {
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const channel = new MessageChannel();
                navigator.serviceWorker.controller.postMessage(
                    { type: 'PING' }, 
                    [channel.port2]
                );
            }
        }, 25000); // Every 25 seconds
    }
}

// Initialize service worker manager and make it globally available
window.swManager = new ServiceWorkerManager();