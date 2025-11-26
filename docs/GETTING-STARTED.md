# AJ STUDIOZ Maps - Getting Started

Welcome to **AJ STUDIOZ Maps**, a fully proprietary, standalone mapping engine with **zero third-party dependencies**. This guide will get you up and running in minutes.

---

## 🚀 Quick Start

### Step 1: Include the SDK

Add these two files to your HTML:

```html
<!DOCTYPE html>
<html>
<head>
    <!-- AJ Maps CSS -->
    <link rel="stylesheet" href="https://aj-maps.vercel.app/src/aj-maps.css">
</head>
<body>
    <!-- Map Container -->
    <div id="map" style="width: 100%; height: 600px;"></div>

    <!-- AJ Maps SDK -->
    <script src="https://aj-maps.vercel.app/src/aj-maps.js"></script>
    
    <script>
        // Initialize your map
        const map = new AJMap('map', {
            center: [51.505, -0.09], // [latitude, longitude]
            zoom: 13
        });
    </script>
</body>
</html>
```

### Step 2: Initialize the Map

```javascript
const map = new AJMap('map-container-id', {
    center: [40.7128, -74.0060], // NYC
    zoom: 14,
    minZoom: 3,
    maxZoom: 19
});
```

### Step 3: Add a Marker

```javascript
map.addMarker(40.7128, -74.0060, "Empire State Building", "Famous landmark");
```

**That's it!** You now have a fully functional map.

---

## 🔧 Installation Options

### Option 1: CDN (Recommended)
Use the hosted version on Vercel:
```html
<link rel="stylesheet" href="https://aj-maps.vercel.app/src/aj-maps.css">
<script src="https://aj-maps.vercel.app/src/aj-maps.js"></script>
```

### Option 2: Self-Hosted
1. Download `aj-maps.js` and `aj-maps.css` from [GitHub](https://github.com/kamesh6592-cell/aj-maps)
2. Place them in your project folder
3. Reference them locally:
```html
<link rel="stylesheet" href="path/to/aj-maps.css">
<script src="path/to/aj-maps.js"></script>
```

### Option 3: npm (Coming Soon)
```bash
npm install @ajstudioz/maps
```

---

## 📦 What's Included?

- **Canvas-Based Rendering:** Fast, smooth, GPU-accelerated map rendering
- **Web Mercator Projection:** Industry-standard coordinate system
- **Touch Support:** Works on mobile devices
- **Dark Mode:** Toggle between light and dark themes
- **Satellite View:** Switch between street and satellite imagery
- **Search:** Built-in geocoding search
- **Routing:** Turn-by-turn directions
- **Context Menu:** Right-click interactions
- **Zero Dependencies:** Pure JavaScript, no Leaflet or other libraries

---

## 🎯 Basic Features

### Pan and Zoom
- **Mouse:** Click and drag to pan, scroll to zoom
- **Touch:** Swipe to pan, pinch to zoom
- **Keyboard:** Arrow keys to pan

### Built-in UI
- Search bar (top-left)
- Zoom controls (bottom-right)
- Layer switcher (bottom-left)
- Dark mode toggle
- Location button

---

## 🌍 Map Options

```javascript
new AJMap('map-id', {
    center: [lat, lng],    // Initial center position
    zoom: 13,              // Initial zoom level (3-19)
    minZoom: 3,            // Minimum zoom level
    maxZoom: 19            // Maximum zoom level
});
```

---

## 📍 Adding Markers

```javascript
// Simple marker
map.addMarker(40.7128, -74.0060);

// Marker with title
map.addMarker(40.7128, -74.0060, "My Location");

// Marker with title and description
map.addMarker(40.7128, -74.0060, "Empire State", "Famous building");
```

---

## 🗺️ Changing View

```javascript
// Move to a location
map.setView(51.505, -0.09, 13);

// Zoom in/out
map.zoomIn();
map.zoomOut();
```

---

## 🌙 Dark Mode

```javascript
// Toggle dark mode
map.toggleDarkMode();
```

---

## 🚗 Directions (Routing)

Right-click on the map and select **"Directions to here"** or use the search bar to find a place and click the **"Directions"** button.

---

## 🔍 Search

Type any address or place name in the search bar (top-left). The map will show matching results.

---

## 📱 Mobile Support

AJ Maps is fully responsive and works on:
- iOS Safari
- Android Chrome
- All modern mobile browsers

---

## 🎨 Customization

You can modify `aj-maps.css` to customize:
- Control button colors
- Search bar styling
- Marker appearance
- Dark mode colors

---

## ⚡ Performance Tips

1. **Clear old markers** when adding many new ones:
   ```javascript
   map.clearMarkers();
   ```

2. **Clear routes** when no longer needed:
   ```javascript
   map.clearRoute();
   ```

3. Use appropriate zoom levels (avoid very high zoom on large areas)

---

## 🆘 Troubleshooting

### Map not showing?
- Ensure the container has a defined width and height
- Check browser console for errors
- Verify the script is loaded after the DOM

### Markers not appearing?
- Check that latitude and longitude are valid numbers
- Ensure coordinates are in the correct order: `[lat, lng]`

### Search not working?
- Check your internet connection (search uses Nominatim API)
- Wait 3 seconds after typing

---

## 📚 Next Steps

- Read the [API Reference](./API-REFERENCE.md) for complete method documentation
- Check out [Examples](./EXAMPLES.md) for advanced use cases
- Visit our [GitHub](https://github.com/kamesh6592-cell/aj-maps) for source code

---

**Built with ❤️ by AJ STUDIOZ**
