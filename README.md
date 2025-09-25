"Test PWA - App Badge Demo

A Progressive Web App (PWA) that demonstrates the `setAppBadge` API functionality with a 30-second delay.

## Features

- ✅ Full PWA functionality (installable, offline-capable)
- 📱 App Badge API demonstration with 30-second delay
- 🎯 Modern, responsive design
- 🔄 Service worker for offline functionality
- 📲 Install prompt for better user experience

## Live Demo

Visit the GitHub Pages site: `https://johnpowers-microsoft.github.io/testpwa/`

## How to Use

1. **Install the PWA**: Visit the site and click "Install" when prompted
2. **Set Badge**: Click "Set Badge (30s delay)" to start the timer
3. **Wait**: The app badge will appear on your home screen icon after 30 seconds
4. **Clear Badge**: Use "Clear Badge" to remove the badge

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

- `index.html` - Main HTML file with PWA metadata
- `manifest.json` - PWA manifest configuration
- `service-worker.js` - Service worker for offline functionality
- `app.js` - JavaScript for badge functionality and PWA installation
- `style.css` - Modern, responsive styling
- `README.md` - This documentation

## Technical Details

### App Badge API
The PWA uses the `navigator.setAppBadge()` and `navigator.clearAppBadge()` APIs to manage the badge on the app icon. The badge is set to show the number "1" after a 30-second delay.

### PWA Features
- **Installable**: Includes proper manifest and service worker
- **Offline-capable**: Service worker caches resources for offline use
- **Responsive**: Works on mobile and desktop devices
- **Modern UI**: Clean, accessible design with animations

## Development

To modify or enhance the PWA:

1. Edit the files as needed
2. Test locally using a web server (e.g., `python -m http.server` or Live Server in VS Code)
3. Commit and push changes to update the GitHub Pages deployment" 
