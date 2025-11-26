# AJ STUDIOZ Maps - API Reference

Complete API documentation for AJ Maps SDK v2.0

---

## Table of Contents

1. [Constructor](#constructor)
2. [Map Methods](#map-methods)
3. [Marker Methods](#marker-methods)
4. [Events](#events)
5. [Properties](#properties)

---

## Constructor

### `new AJMap(containerId, options)`

Creates a new map instance.

**Parameters:**
- `containerId` (string) - The ID of the HTML element to contain the map
- `options` (object) - Configuration options

**Options:**
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `center` | Array | `[40.7128, -74.0060]` | Initial map center `[lat, lng]` |
| `zoom` | Number | `13` | Initial zoom level (3-19) |
| `minZoom` | Number | `3` | Minimum zoom level |
| `maxZoom` | Number | `19` | Maximum zoom level |

**Example:**
```javascript
const map = new AJMap('map-container', {
    center: [51.505, -0.09],
    zoom: 13,
    minZoom: 5,
    maxZoom: 18
});
```

---

## Map Methods

### `setView(lat, lng, zoom)`

Sets the map's center position and zoom level.

**Parameters:**
- `lat` (number) - Latitude
- `lng` (number) - Longitude
- `zoom` (number, optional) - Zoom level

**Example:**
```javascript
map.setView(40.7128, -74.0060, 14);
```

---

### `zoomIn()`

Increases the zoom level by 1.

**Example:**
```javascript
map.zoomIn();
```

---

### `zoomOut()`

Decreases the zoom level by 1.

**Example:**
```javascript
map.zoomOut();
```

---

### `toggleDarkMode()`

Toggles between light and dark map themes.

**Example:**
```javascript
map.toggleDarkMode();
```

---

### `clearMarkers()`

Removes all markers from the map.

**Example:**
```javascript
map.clearMarkers();
```

---

### `clearRoute()`

Removes the current route from the map.

**Example:**
```javascript
map.clearRoute();
```

---

## Marker Methods

### `addMarker(lat, lng, title, description)`

Adds a marker to the map.

**Parameters:**
- `lat` (number) - Latitude
- `lng` (number) - Longitude
- `title` (string, optional) - Marker title
- `description` (string, optional) - Marker description

**Returns:** Marker object

**Example:**
```javascript
const marker = map.addMarker(
    40.7128, 
    -74.0060, 
    "Empire State Building",
    "A famous skyscraper in NYC"
);
```

**Marker Object:**
```javascript
{
    lat: 40.7128,
    lng: -74.0060,
    title: "Empire State Building",
    description: "A famous skyscraper in NYC",
    element: HTMLDivElement
}
```

---

## Events

AJ Maps handles events internally. The following user interactions are supported:

### Mouse Events
- **Click & Drag:** Pan the map
- **Mouse Wheel:** Zoom in/out
- **Right-Click:** Open context menu
- **Left-Click on Marker:** Show marker popup

### Touch Events
- **Swipe:** Pan the map
- **Pinch:** Zoom in/out (coming soon)
- **Tap on Marker:** Show marker popup

### Keyboard Events
- **Arrow Keys:** Pan the map (coming soon)
- **+/-:** Zoom in/out (coming soon)

---

## Properties

### Read-Only Properties

Access these properties directly (but don't modify them):

**`map.zoom`**
- Current zoom level (number)

**`map.center`**
- Current center position (object)
- Example: `{ lat: 40.7128, lng: -74.0060 }`

**`map.currentLayer`**
- Current map layer (string: 'streets' or 'satellite')

**`map.darkMode`**
- Dark mode status (boolean)

**`map.markers`**
- Array of all markers on the map

**Example:**
```javascript
console.log(map.zoom);          // 13
console.log(map.center);        // { lat: 40.7128, lng: -74.0060 }
console.log(map.currentLayer);  // "streets"
console.log(map.darkMode);      // false
console.log(map.markers.length); // 5
```

---

## Advanced Usage

### Custom Tile Sources

You can modify the tile source by editing `_getTileURL()` method in `aj-maps.js`.

Default sources:
- **Streets:** CartoDB Voyager
- **Satellite:** ArcGIS World Imagery
- **Labels:** ArcGIS World Boundaries

---

### Web Mercator Projection

AJ Maps uses standard Web Mercator projection (EPSG:3857). Internal methods:

- `_latToY(lat)` - Convert latitude to Y coordinate
- `_lngToX(lng)` - Convert longitude to X coordinate
- `_pixelToLat(y)` - Convert Y pixel to latitude
- `_pixelToLng(x)` - Convert X pixel to longitude
- `_latLngToPixel(lat, lng)` - Convert lat/lng to pixel coordinates

---

### Canvas Rendering

The map uses HTML5 Canvas for rendering. Access the canvas:

```javascript
map.canvas  // HTMLCanvasElement
map.ctx     // CanvasRenderingContext2D
```

---

### Tile Management

Tiles are cached in a Map object:

```javascript
map.tiles  // Map<string, {img: Image, loaded: boolean}>
```

Clear tile cache:
```javascript
map.tiles.clear();
map._render();
```

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Chrome Android 90+

---

## TypeScript Support

TypeScript definitions (coming soon):

```typescript
interface AJMapOptions {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
}

interface Marker {
    lat: number;
    lng: number;
    title: string;
    description: string;
    element: HTMLDivElement;
}

class AJMap {
    constructor(containerId: string, options?: AJMapOptions);
    addMarker(lat: number, lng: number, title?: string, description?: string): Marker;
    setView(lat: number, lng: number, zoom?: number): void;
    zoomIn(): void;
    zoomOut(): void;
    toggleDarkMode(): void;
    clearMarkers(): void;
    clearRoute(): void;
}
```

---

## Error Handling

### Common Errors

**"Container not found"**
```javascript
// Error: AJ Maps: Container 'my-map' not found.
// Solution: Ensure the element exists before initializing
```

**CORS Issues**
```javascript
// Some tile servers may block cross-origin requests
// Solution: Use allowed tile servers or proxy
```

---

## Performance Optimization

### Best Practices

1. **Reuse map instances:**
   ```javascript
   // ❌ Don't create multiple maps
   const map1 = new AJMap('map');
   const map2 = new AJMap('map'); // Overwrites first
   
   // ✅ Create once, update as needed
   const map = new AJMap('map');
   map.setView(newLat, newLng);
   ```

2. **Clear markers when adding many:**
   ```javascript
   map.clearMarkers();
   data.forEach(item => {
       map.addMarker(item.lat, item.lng);
   });
   ```

3. **Debounce updates:**
   ```javascript
   let timeout;
   function updateMap() {
       clearTimeout(timeout);
       timeout = setTimeout(() => {
           map.setView(lat, lng);
       }, 300);
   }
   ```

---

## License

© 2025 AJ STUDIOZ. All Rights Reserved.

This is proprietary software. See [LICENSE](../LICENSE) for details.

---

**Need Help?** Open an issue on [GitHub](https://github.com/kamesh6592-cell/aj-maps/issues)
