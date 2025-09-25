# 🐱 T- ✅ Full PWA functionality (installable, offline-capable)
- 🔔 App Badge API demonstration with 10-second delay
- 🎯 Modern, responsive design with cat emoji branding PWA - App Badge Demo

A Progressive Web App (PWA) that demonstrates the `setAppBadge` API functionality with a 10-second delay. Features a cute cat emoji theme!

## Features

- ✅ Full PWA functionality (installable, offline-capable)
- � App Badge API demonstration with 10-second delay
- 🎯 Modern, responsive design with cat emoji branding
- 🔄 Service worker for offline functionality
- 📲 Install prompt for better user experience
- ⚡ Quick 10-second timer for fast testing

## Live Demo

Visit the GitHub Pages site: `https://johnpowers-microsoft.github.io/testpwa/`

## How to Use

1. **Install the PWA**: Visit the site and click "Install" when prompted
2. **Set Badge**: Click "Set Badge (10s delay)" to start the timer
3. **Wait**: The app badge will appear on your home screen icon after 10 seconds
4. **Clear Badge**: Use "Clear Badge" to remove the badge
5. **App Shortcut**: Long press the installed PWA icon to access the direct "Set Badge" shortcut

## Browser Support

The App Badge API is currently supported in:
- Chrome/Chromium browsers on Android and desktop
- Microsoft Edge on Android and desktop
- Other Chromium-based browsers

## Deployment to GitHub Pages

1. Push all files to your repository
2. Go to Settings > Pages in your GitHub repository
3. Select "Deploy from a branch" and choose `main` branch
4. Your PWA will be available at `https://yourusername.github.io/yourrepo/`

## Files Structure

- `index.html` - Main HTML file with PWA metadata and cat emoji favicon
- `manifest.json` - PWA manifest configuration with cat emoji icons (🐱)
- `service-worker.js` - Service worker for offline functionality and caching
- `app.js` - JavaScript for badge functionality and PWA installation prompts
- `style.css` - Modern, responsive styling with animations and dark mode support
- `README.md` - This documentation

## Technical Details

### App Badge API
The PWA uses the `navigator.setAppBadge()` and `navigator.clearAppBadge()` APIs to manage the badge on the app icon. The badge is set to show the number "1" after a quick 10-second delay for easy testing.

### PWA Features
- **Installable**: Includes proper manifest and service worker for home screen installation
- **Offline-capable**: Service worker caches all resources for complete offline functionality
- **Responsive**: Mobile-first design that works perfectly on all device sizes
- **Modern UI**: Clean, accessible design with smooth animations and cat emoji branding
- **App Shortcuts**: Context menu shortcut for quick badge setting
- **Dark Mode**: Automatic dark mode support based on system preferences

## Icon Implementation

This PWA uses an innovative approach for icons - **inline SVG with emoji**:

```html
<!-- Favicon example -->
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐱</text></svg>">
```

### Benefits:
- 📦 **No external files needed** - Everything is self-contained
- 🎨 **Easy to customize** - Just change the emoji character
- 🌈 **Always renders** - Uses system emoji fonts
- 📱 **Cross-platform** - Works on all devices and browsers

### Icon Locations:
- **Browser favicon** (16x16, 32x32, 48x48)
- **App icons** (192x192, 512x512) for home screen installation
- **Apple Touch Icon** for iOS devices
- **App shortcut icon** (96x96) for context menu

## Development

To modify or enhance the PWA:

1. **Local testing**: Use a web server (e.g., `python -m http.server` or Live Server in VS Code)
2. **Icon changes**: Simply replace `🐱` with any other emoji in the SVG data URLs
3. **Timer adjustment**: Modify the timeout values in `app.js`
4. **Styling**: Customize the CSS variables and animations in `style.css`
5. **Deploy**: Commit and push changes to update the GitHub Pages deployment

### Quick Customization:
- Change emoji: Replace `🐱` with `🚀`, `⭐`, `💎`, etc.
- Change timer: Modify `setTimeout(..., 10000)` and related UI text
- Change colors: Update CSS custom properties and theme colors 
