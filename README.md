# AJ STUDIOZ Maps SDK v2.0

🗺️ A **completely proprietary, standalone mapping engine** with **zero third-party dependencies**. Built from scratch with pure JavaScript and Canvas API.

---

## 🌟 What Makes AJ Maps Different?

- **✨ 100% Proprietary:** No Leaflet, no Mapbox, no Google Maps dependencies
- **🚀 Canvas-Based:** Fast GPU-accelerated rendering
- **📦 Zero Dependencies:** Pure JavaScript, no external libraries
- **🎨 Google Maps UI:** Professional interface with search, routing, dark mode
- **🌍 Full Control:** Own your mapping solution completely
- **📱 Mobile Ready:** Touch gestures, responsive design
- **🌙 Dark Mode:** Built-in theme toggle
- **🛰️ Hybrid Satellite:** Street and satellite views with labels

---

## 🚀 Quick Start

### CDN (Easiest)

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://aj-maps.vercel.app/src/aj-maps.css">
</head>
<body>
    <div id="map" style="width: 100%; height: 600px;"></div>
    
    <script src="https://aj-maps.vercel.app/src/aj-maps.js"></script>
    <script>
        const map = new AJMap('map', {
            center: [40.7128, -74.0060],
            zoom: 14
        });
        
        map.addMarker(40.7128, -74.0060, "My Location", "Hello World!");
    </script>
</body>
</html>
```

**That's it!** No API keys, no sign-ups, no dependencies.

---

## 📚 Documentation

- **[Getting Started](docs/GETTING-STARTED.md)** - Installation and basic usage
- **[API Reference](docs/API-REFERENCE.md)** - Complete method documentation
- **[Examples](docs/EXAMPLES.md)** - Real-world code examples

---

## 🎯 Features

### Core Functionality
- ✅ Pan and zoom (mouse, touch, keyboard)
- ✅ Custom markers with popups
- ✅ Street and satellite views
- ✅ Dark mode toggle
- ✅ Geocoding search
- ✅ Turn-by-turn routing
- ✅ Right-click context menu
- ✅ Geolocation support

### Technical Features
- ✅ Web Mercator projection (EPSG:3857)
- ✅ Canvas-based tile rendering
- ✅ Automatic tile caching
- ✅ Touch gesture support
- ✅ Responsive design
- ✅ No external dependencies

---

## 🛠 API Overview

### Initialization
```javascript
const map = new AJMap('container-id', {
    center: [lat, lng],
    zoom: 13,
    minZoom: 3,
    maxZoom: 19
});
```

### Methods
```javascript
map.addMarker(lat, lng, title, description)  // Add a marker
map.setView(lat, lng, zoom)                  // Move camera
map.zoomIn()                                 // Zoom in
map.zoomOut()                                // Zoom out
map.toggleDarkMode()                         // Toggle theme
map.clearMarkers()                           // Remove all markers
map.clearRoute()                             // Clear routing path
```

---

## 🏗️ Use Cases

- 🍕 Restaurant/Store Locators
- 🚚 Delivery Tracking Apps
- 🏠 Real Estate Property Maps
- 📍 Event Location Maps
- 🗺️ Custom Dashboard Maps
- 🚗 Vehicle Tracking Systems

---

## 🌐 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 90+ ✅ |
| Firefox | 88+ ✅ |
| Safari | 14+ ✅ |
| Edge | 90+ ✅ |
| Mobile Safari | 14+ ✅ |
| Chrome Android | 90+ ✅ |

---

## 📦 Installation Options

### Option 1: CDN (Recommended)
```html
<link rel="stylesheet" href="https://aj-maps.vercel.app/src/aj-maps.css">
<script src="https://aj-maps.vercel.app/src/aj-maps.js"></script>
```

### Option 2: Self-Hosted
1. Clone this repository
2. Copy `src/` folder to your project
3. Reference files locally

### Option 3: npm (Coming Soon)
```bash
npm install @ajstudioz/maps
```

---

## 🎨 Customization

AJ Maps is designed to be customizable:

- **Modify `aj-maps.css`** for styling
- **Edit tile sources** in `_getTileURL()` method
- **Custom markers** via CSS classes
- **Theme colors** easily adjustable

---

## 🚀 Deploy Your Own Instance

### Deploy to Vercel (Free)

1. Fork this repository
2. Go to [Vercel.com](https://vercel.com)
3. Import your repository
4. Click "Deploy"
5. Use your custom domain: `https://your-domain.vercel.app/src/aj-maps.js`

### Deploy to GitHub Pages

```bash
# Enable GitHub Pages in repository settings
# Your SDK will be at: https://username.github.io/repo-name/src/aj-maps.js
```

---

## 🤝 Integration Examples

### React
```jsx
useEffect(() => {
    const map = new AJMap('map', {
        center: [40.7128, -74.0060],
        zoom: 13
    });
}, []);
```

### Vue.js
```vue
mounted() {
    this.map = new AJMap('map', {
        center: [40.7128, -74.0060],
        zoom: 13
    });
}
```

### Angular
```typescript
ngOnInit() {
    this.map = new AJMap('map', {
        center: [40.7128, -74.0060],
        zoom: 13
    });
}
```

---

## 📊 Roadmap

- [ ] TypeScript definitions
- [ ] npm package
- [ ] Marker clustering
- [ ] GeoJSON support
- [ ] Heat maps
- [ ] Custom tile sources
- [ ] Offline tile caching
- [ ] Street View integration

---

## 📝 License

© 2025 AJ STUDIOZ. All Rights Reserved.

This is proprietary software owned by AJ STUDIOZ. You may use it freely in your projects, but redistribution or resale as a standalone product is prohibited.

---

## 🆘 Support

- 📖 [Documentation](docs/)
- 💬 [GitHub Issues](https://github.com/kamesh6592-cell/aj-maps/issues)
- 📧 Email: support@ajstudioz.com

---

## 🙌 Credits

Built with ❤️ by **AJ STUDIOZ**

Tile providers:
- CartoDB (Streets)
- ArcGIS/Esri (Satellite & Labels)
- Nominatim (Geocoding)
- OSRM (Routing)

---

**Star this repo ⭐ if you find it useful!**
