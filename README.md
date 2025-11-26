# AJ STUDIOZ Maps SDK

A professional, Google Maps-like mapping library that you can host yourself.

## 🚀 Features

- **Google Maps UI/UX:** Clean interface, floating controls, search bar.
- **Search Engine:** Integrated address search (Geocoding).
- **Satellite View:** Toggle between Street and Satellite imagery.
- **Branding:** Custom "AJ STUDIOZ" branding built-in.
- **Easy Integration:** Just drop in the JS/CSS files.

## 📦 Installation

To use this in your own projects, you just need the files in the `src` folder.

### 1. Host the files
Upload the `src` folder to your server (or GitHub/Vercel).

### 2. Include in HTML
Add these lines to your `<head>`:
```html
<!-- Leaflet Dependency -->
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<!-- AJ Maps CSS -->
<link rel="stylesheet" href="path/to/src/aj-maps.css">
```

Add these lines to the end of your `<body>`:
```html
<!-- Leaflet Dependency -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<!-- AJ Maps SDK -->
<script src="path/to/src/aj-maps.js"></script>
```

### 3. Initialize
```javascript
const myMap = new AJMap('map-container-id', {
    center: [40.7128, -74.0060],
    zoom: 13
});
```

## 🛠 API Reference

### `new AJMap(containerId, options)`
- `containerId`: String ID of the div.
- `options`: Object `{ center: [lat, lng], zoom: number }`

### `map.addMarker(lat, lng, title, description)`
Adds a branded marker to the map.

### `map.setView(lat, lng, zoom)`
Moves the camera.

## ☁️ Hosting on Vercel

1. Push this entire folder to a GitHub repository.
2. Go to Vercel.com -> "Add New Project".
3. Import your GitHub repository.
4. Deploy!
5. Your "CDN" links will be:
   - `https://your-project.vercel.app/src/aj-maps.js`
   - `https://your-project.vercel.app/src/aj-maps.css`

---
**AJ STUDIOZ**
