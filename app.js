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
                // Register service worker
                this.registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('SW registered:', this.registration);
                
                // Set up message channel for communication
                this.setupMessageChannel();
                
                // Request notification permission
                await this.requestNotificationPermission();
                
                // Register background sync
                await this.registerBackgroundSync();
                
                // Set up keep-alive mechanism
                this.startKeepAlive();
                
            } catch (error) {
                console.error('SW registration failed:', error);
            }
        }
    }
    
    setupMessageChannel() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                console.log('Message from SW:', event.data);
            });
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
                if ('sync' in registration) {
                    // Register background sync for badge updates
                    await registration.sync.register('background-badge-sync');
                    console.log('Background sync registered');
                }
            } catch (error) {
                console.error('Background sync registration failed:', error);
            }
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