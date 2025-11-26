// Initialize the map
const map = L.map('map', {
    center: [40.7128, -74.0060], // New York City coordinates (you can change this)
    zoom: 13,
    zoomControl: false, // Disable default zoom control
    attributionControl: false // Disable attribution control
});

// Add OpenStreetMap tile layer (no watermarks)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '' // Empty attribution
}).addTo(map);

// Alternative tile layers you can use:
// 1. CartoDB Positron (Light theme)
// L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
//     maxZoom: 19
// }).addTo(map);

// 2. CartoDB Dark Matter (Dark theme)
// L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
//     maxZoom: 19
// }).addTo(map);

// Custom marker icon (AJ STUDIOZ branded)
const ajIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 30px; height: 30px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

// Add a sample marker
const marker = L.marker([40.7128, -74.0060], { icon: ajIcon }).addTo(map);
marker.bindPopup('<b>AJ STUDIOZ</b><br>Welcome to our custom maps!');

// Custom control buttons
document.getElementById('zoomIn').addEventListener('click', () => {
    map.zoomIn();
});

document.getElementById('zoomOut').addEventListener('click', () => {
    map.zoomOut();
});

document.getElementById('myLocation').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                map.setView([lat, lng], 15);
                
                // Add marker at user's location
                L.marker([lat, lng], { icon: ajIcon })
                    .addTo(map)
                    .bindPopup('<b>You are here!</b><br>Powered by AJ STUDIOZ')
                    .openPopup();
            },
            (error) => {
                alert('Unable to retrieve your location');
            }
        );
    } else {
        alert('Geolocation is not supported by your browser');
    }
});

// Example: Add multiple markers
function addCustomMarker(lat, lng, title, description) {
    const marker = L.marker([lat, lng], { icon: ajIcon }).addTo(map);
    marker.bindPopup(`<b>${title}</b><br>${description}`);
    return marker;
}

// Example usage:
// addCustomMarker(40.7589, -73.9851, 'Times Square', 'Famous landmark in NYC');
// addCustomMarker(40.7484, -73.9857, 'Empire State Building', 'Iconic skyscraper');
