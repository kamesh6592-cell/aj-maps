# AJ STUDIOZ Maps - Examples & Tutorials

Real-world examples and use cases for AJ Maps SDK.

---

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [Advanced Examples](#advanced-examples)
3. [Real-World Use Cases](#real-world-use-cases)
4. [Integration Examples](#integration-examples)

---

## Basic Examples

### Example 1: Simple Map

The most basic implementation:

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://aj-maps.vercel.app/src/aj-maps.css">
    <style>
        #map { width: 100%; height: 500px; }
    </style>
</head>
<body>
    <div id="map"></div>
    <script src="https://aj-maps.vercel.app/src/aj-maps.js"></script>
    <script>
        const map = new AJMap('map', {
            center: [40.7128, -74.0060],
            zoom: 13
        });
    </script>
</body>
</html>
```

---

### Example 2: Map with Multiple Markers

```javascript
const map = new AJMap('map', {
    center: [40.7589, -73.9851],
    zoom: 14
});

// Add tourist attractions
const locations = [
    { lat: 40.7589, lng: -73.9851, name: "Times Square", desc: "Famous intersection" },
    { lat: 40.7484, lng: -73.9857, name: "Empire State", desc: "Iconic skyscraper" },
    { lat: 40.7614, lng: -73.9776, name: "Central Park", desc: "Urban park" }
];

locations.forEach(loc => {
    map.addMarker(loc.lat, loc.lng, loc.name, loc.desc);
});
```

---

### Example 3: Restaurant Finder

```html
<div id="map" style="height: 600px;"></div>
<button onclick="findRestaurants()">Find Nearby Restaurants</button>

<script>
    const map = new AJMap('map', {
        center: [40.7128, -74.0060],
        zoom: 14
    });

    async function findRestaurants() {
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                
                map.setView(lat, lng, 16);
                map.clearMarkers();
                
                // Fetch nearby restaurants (example data)
                const restaurants = [
                    { lat: lat + 0.001, lng: lng + 0.001, name: "Pizza Place" },
                    { lat: lat - 0.002, lng: lng + 0.001, name: "Sushi Bar" },
                    { lat: lat + 0.002, lng: lng - 0.001, name: "Italian Bistro" }
                ];
                
                restaurants.forEach(r => {
                    map.addMarker(r.lat, r.lng, r.name, "Restaurant");
                });
            });
        }
    }
</script>
```

---

## Advanced Examples

### Example 4: Store Locator

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://aj-maps.vercel.app/src/aj-maps.css">
    <style>
        body { margin: 0; display: flex; }
        #sidebar { width: 300px; padding: 20px; overflow-y: auto; }
        #map { flex: 1; height: 100vh; }
        .store-item {
            padding: 10px;
            border-bottom: 1px solid #ddd;
            cursor: pointer;
        }
        .store-item:hover { background: #f0f0f0; }
    </style>
</head>
<body>
    <div id="sidebar">
        <h2>Store Locations</h2>
        <div id="store-list"></div>
    </div>
    <div id="map"></div>

    <script src="https://aj-maps.vercel.app/src/aj-maps.js"></script>
    <script>
        const map = new AJMap('map', {
            center: [40.7128, -74.0060],
            zoom: 12
        });

        const stores = [
            { id: 1, name: "Downtown Store", lat: 40.7128, lng: -74.0060, address: "123 Main St" },
            { id: 2, name: "Uptown Branch", lat: 40.7589, lng: -73.9851, address: "456 5th Ave" },
            { id: 3, name: "Brooklyn Location", lat: 40.6782, lng: -73.9442, address: "789 Brooklyn Ave" }
        ];

        // Add markers
        stores.forEach(store => {
            map.addMarker(store.lat, store.lng, store.name, store.address);
        });

        // Populate sidebar
        const storeList = document.getElementById('store-list');
        stores.forEach(store => {
            const div = document.createElement('div');
            div.className = 'store-item';
            div.innerHTML = `<strong>${store.name}</strong><br>${store.address}`;
            div.onclick = () => {
                map.setView(store.lat, store.lng, 16);
            };
            storeList.appendChild(div);
        });
    </script>
</body>
</html>
```

---

### Example 5: Real-Time Vehicle Tracking

```javascript
const map = new AJMap('map', {
    center: [40.7128, -74.0060],
    zoom: 14
});

let vehicleMarker = null;

function updateVehiclePosition(lat, lng) {
    // Clear old marker
    if (vehicleMarker) {
        map.clearMarkers();
    }
    
    // Add new marker
    vehicleMarker = map.addMarker(lat, lng, "Delivery Truck", "En route");
    map.setView(lat, lng, 16);
}

// Simulate real-time updates
let currentLat = 40.7128;
let currentLng = -74.0060;

setInterval(() => {
    // Simulate movement
    currentLat += (Math.random() - 0.5) * 0.001;
    currentLng += (Math.random() - 0.5) * 0.001;
    
    updateVehiclePosition(currentLat, currentLng);
}, 3000); // Update every 3 seconds
```

---

### Example 6: Dark Mode Toggle

```html
<button onclick="toggleTheme()">Toggle Dark Mode</button>
<div id="map" style="height: 600px;"></div>

<script src="https://aj-maps.vercel.app/src/aj-maps.js"></script>
<script>
    const map = new AJMap('map', {
        center: [40.7128, -74.0060],
        zoom: 13
    });

    function toggleTheme() {
        map.toggleDarkMode();
    }
</script>
```

---

## Real-World Use Cases

### Use Case 1: Delivery App

```javascript
class DeliveryApp {
    constructor() {
        this.map = new AJMap('map', {
            center: [40.7128, -74.0060],
            zoom: 13
        });
        
        this.driverMarker = null;
        this.destinationMarker = null;
    }
    
    setDriver(lat, lng) {
        if (this.driverMarker) {
            this.map.clearMarkers();
        }
        this.driverMarker = this.map.addMarker(lat, lng, "Driver", "On the way");
    }
    
    setDestination(lat, lng, address) {
        this.destinationMarker = this.map.addMarker(lat, lng, "Destination", address);
    }
    
    trackDriver() {
        // Simulate tracking
        setInterval(() => {
            // Fetch real driver location from API
            fetch('/api/driver-location')
                .then(res => res.json())
                .then(data => {
                    this.setDriver(data.lat, data.lng);
                });
        }, 5000);
    }
}

const app = new DeliveryApp();
app.setDestination(40.7589, -73.9851, "123 Main St");
app.trackDriver();
```

---

### Use Case 2: Property Listings

```javascript
class PropertyMap {
    constructor() {
        this.map = new AJMap('map', {
            center: [40.7128, -74.0060],
            zoom: 12
        });
        
        this.properties = [];
    }
    
    addProperty(lat, lng, price, address) {
        const marker = this.map.addMarker(
            lat, 
            lng, 
            `$${price.toLocaleString()}`, 
            address
        );
        
        this.properties.push({ lat, lng, price, address, marker });
    }
    
    filterByPrice(maxPrice) {
        this.map.clearMarkers();
        
        this.properties
            .filter(p => p.price <= maxPrice)
            .forEach(p => {
                this.map.addMarker(p.lat, p.lng, `$${p.price.toLocaleString()}`, p.address);
            });
    }
}

const propertyMap = new PropertyMap();
propertyMap.addProperty(40.7128, -74.0060, 500000, "123 Main St");
propertyMap.addProperty(40.7589, -73.9851, 750000, "456 5th Ave");
propertyMap.addProperty(40.6782, -73.9442, 450000, "789 Brooklyn Ave");
```

---

### Use Case 3: Event Map

```javascript
class EventMap {
    constructor() {
        this.map = new AJMap('map', {
            center: [40.7128, -74.0060],
            zoom: 13
        });
    }
    
    loadEvents() {
        fetch('/api/events')
            .then(res => res.json())
            .then(events => {
                events.forEach(event => {
                    this.map.addMarker(
                        event.lat,
                        event.lng,
                        event.name,
                        `${event.date} - ${event.type}`
                    );
                });
            });
    }
}

const eventMap = new EventMap();
eventMap.loadEvents();
```

---

## Integration Examples

### React Integration

```jsx
import { useEffect, useRef } from 'react';

function MapComponent() {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        if (!mapInstance.current) {
            mapInstance.current = new window.AJMap('map', {
                center: [40.7128, -74.0060],
                zoom: 13
            });
        }
    }, []);

    return <div id="map" style={{ height: '100vh' }} />;
}

export default MapComponent;
```

---

### Vue.js Integration

```vue
<template>
    <div id="map" style="height: 600px;"></div>
</template>

<script>
export default {
    name: 'MapComponent',
    mounted() {
        this.map = new window.AJMap('map', {
            center: [40.7128, -74.0060],
            zoom: 13
        });
    },
    beforeUnmount() {
        this.map = null;
    }
}
</script>
```

---

### Angular Integration

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

declare const AJMap: any;

@Component({
    selector: 'app-map',
    template: '<div id="map" style="height: 600px;"></div>'
})
export class MapComponent implements OnInit, OnDestroy {
    private map: any;

    ngOnInit() {
        this.map = new AJMap('map', {
            center: [40.7128, -74.0060],
            zoom: 13
        });
    }

    ngOnDestroy() {
        this.map = null;
    }
}
```

---

### WordPress Plugin

```php
<?php
/*
Plugin Name: AJ Maps
*/

function aj_maps_enqueue_scripts() {
    wp_enqueue_style('aj-maps-css', 'https://aj-maps.vercel.app/src/aj-maps.css');
    wp_enqueue_script('aj-maps-js', 'https://aj-maps.vercel.app/src/aj-maps.js', array(), '2.0', true);
}
add_action('wp_enqueue_scripts', 'aj_maps_enqueue_scripts');

function aj_maps_shortcode($atts) {
    $atts = shortcode_atts(array(
        'lat' => '40.7128',
        'lng' => '-74.0060',
        'zoom' => '13'
    ), $atts);
    
    return '<div id="aj-map" style="height: 500px;"></div>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            new AJMap("aj-map", {
                center: [' . $atts['lat'] . ', ' . $atts['lng'] . '],
                zoom: ' . $atts['zoom'] . '
            });
        });
    </script>';
}
add_shortcode('aj_map', 'aj_maps_shortcode');
?>
```

Usage: `[aj_map lat="40.7128" lng="-74.0060" zoom="13"]`

---

## Tips & Tricks

### Tip 1: Custom Map Bounds

```javascript
function fitToBounds(markers) {
    if (markers.length === 0) return;
    
    let minLat = markers[0].lat;
    let maxLat = markers[0].lat;
    let minLng = markers[0].lng;
    let maxLng = markers[0].lng;
    
    markers.forEach(m => {
        minLat = Math.min(minLat, m.lat);
        maxLat = Math.max(maxLat, m.lat);
        minLng = Math.min(minLng, m.lng);
        maxLng = Math.max(maxLng, m.lng);
    });
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    map.setView(centerLat, centerLng, 12);
}
```

---

### Tip 2: Marker Clustering (Simple)

```javascript
function clusterMarkers(markers, map) {
    // Group markers by proximity
    const clusters = [];
    const threshold = 0.01; // degrees
    
    markers.forEach(marker => {
        let addedToCluster = false;
        
        for (let cluster of clusters) {
            const distance = Math.sqrt(
                Math.pow(cluster.lat - marker.lat, 2) + 
                Math.pow(cluster.lng - marker.lng, 2)
            );
            
            if (distance < threshold) {
                cluster.count++;
                addedToCluster = true;
                break;
            }
        }
        
        if (!addedToCluster) {
            clusters.push({ ...marker, count: 1 });
        }
    });
    
    clusters.forEach(cluster => {
        map.addMarker(
            cluster.lat, 
            cluster.lng, 
            `${cluster.count} locations`
        );
    });
}
```

---

**More examples coming soon!**

For questions or contributions, visit our [GitHub](https://github.com/kamesh6592-cell/aj-maps).

**Built with ❤️ by AJ STUDIOZ**
