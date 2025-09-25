// App Badge Demo JavaScript
class BadgeDemo {
    constructor() {
        this.setBadgeBtn = document.getElementById('setBadgeBtn');
        this.clearBadgeBtn = document.getElementById('clearBadgeBtn');
        this.status = document.getElementById('status');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.timeoutId = null;
        
        this.init();
    }
    
    init() {
        // Check if setAppBadge is supported
        this.checkBadgeSupport();
        
        // Set up event listeners
        this.setBadgeBtn.addEventListener('click', () => this.startBadgeTimer());
        this.clearBadgeBtn.addEventListener('click', () => this.clearBadge());
        
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
        this.startCountdown(30);
        
        // Set the timeout for 30 seconds
        this.timeoutId = setTimeout(() => {
            this.setBadge();
        }, 30000);
        
        this.updateStatus('⏱️ Timer started! Badge will be set in 30 seconds...', 'info');
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
                buttonText.textContent = 'Set Badge (30s delay)';
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
            buttonText.textContent = 'Set Badge (30s delay)';
            
        } catch (error) {
            console.error('Failed to set badge:', error);
            this.updateStatus('❌ Failed to set badge: ' + error.message, 'error');
            
            // Re-enable button and hide loading
            this.setBadgeBtn.disabled = false;
            this.loadingIndicator.style.display = 'none';
            
            // Reset button text
            const buttonText = this.setBadgeBtn.querySelector('.button-text');
            buttonText.textContent = 'Set Badge (30s delay)';
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
                buttonText.textContent = 'Set Badge (30s delay)';
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
                    <span>📱 Install this PWA for the best experience!</span>
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

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('SW registered: ', registration);
        } catch (registrationError) {
            console.log('SW registration failed: ', registrationError);
        }
    });
}