/**
 * AJ STUDIOZ Maps SDK
 * A wrapper around Leaflet to provide a Google Maps-like experience.
 */

class AJMap {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            center: options.center || [40.7128, -74.0060], // Default NYC
            zoom: options.zoom || 13,
            apiKey: options.apiKey || '', // Placeholder for future use
            theme: options.theme || 'default'
        };
        
        this.map = null;
        this.layers = {};
        this.currentLayer = 'streets';
        
        this.init();
    }

    init() {
        // Ensure container exists
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`AJ Maps: Container '${this.containerId}' not found.`);
            return;
        }
        
        container.classList.add('aj-map-container');

        // Initialize Leaflet Map
        this.map = L.map(this.containerId, {
            zoomControl: false, // We will add custom controls
            attributionControl: false
        }).setView(this.options.center, this.options.zoom);

        // Define Layers
        this.layers.streets = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 20
        });

        this.layers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
        });

        // Add default layer
        this.layers.streets.addTo(this.map);

        // Add UI Components
        this._addUI();
        this._addBranding();
    }

    _addUI() {
        const container = document.getElementById(this.containerId);

        // 1. Search Box
        const searchBox = document.createElement('div');
        searchBox.className = 'aj-search-box';
        searchBox.innerHTML = `
            <span class="aj-search-icon">🔍</span>
            <input type="text" class="aj-search-input" placeholder="Search AJ Maps" id="${this.containerId}-search">
        `;
        container.appendChild(searchBox);

        const searchResults = document.createElement('div');
        searchResults.className = 'aj-search-results';
        searchResults.id = `${this.containerId}-results`;
        container.appendChild(searchResults);

        // Search Functionality (using Nominatim)
        const input = searchBox.querySelector('input');
        let debounceTimer;
        
        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => this._performSearch(e.target.value), 500);
        });

        // 2. Controls (Zoom & Location)
        const controls = document.createElement('div');
        controls.className = 'aj-controls-container';
        controls.innerHTML = `
            <button class="aj-fab" id="${this.containerId}-loc" title="My Location">📍</button>
            <button class="aj-fab" id="${this.containerId}-in" title="Zoom In">+</button>
            <button class="aj-fab" id="${this.containerId}-out" title="Zoom Out">−</button>
        `;
        container.appendChild(controls);

        // Bind Control Events
        document.getElementById(`${this.containerId}-in`).onclick = () => this.map.zoomIn();
        document.getElementById(`${this.containerId}-out`).onclick = () => this.map.zoomOut();
        document.getElementById(`${this.containerId}-loc`).onclick = () => this._locateUser();

        // 3. Layer Switcher (Satellite/Map)
        const layerSwitch = document.createElement('div');
        layerSwitch.className = 'aj-layer-switch';
        // Set initial background to satellite because clicking it switches TO satellite
        layerSwitch.style.backgroundImage = "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/10/10')";
        layerSwitch.innerHTML = `<div class="aj-layer-label">Satellite</div>`;
        
        layerSwitch.onclick = () => this._toggleLayer(layerSwitch);
        container.appendChild(layerSwitch);
    }

    _addBranding() {
        const container = document.getElementById(this.containerId);
        const watermark = document.createElement('div');
        watermark.className = 'aj-watermark';
        watermark.innerHTML = 'Powered by <b>AJ STUDIOZ</b>';
        container.appendChild(watermark);
    }

    _toggleLayer(btn) {
        if (this.currentLayer === 'streets') {
            this.map.removeLayer(this.layers.streets);
            this.layers.satellite.addTo(this.map);
            this.currentLayer = 'satellite';
            btn.style.backgroundImage = "url('https://a.basemaps.cartocdn.com/rastertiles/voyager/5/10/10.png')";
            btn.querySelector('.aj-layer-label').innerText = "Map";
        } else {
            this.map.removeLayer(this.layers.satellite);
            this.layers.streets.addTo(this.map);
            this.currentLayer = 'streets';
            btn.style.backgroundImage = "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/10/10')";
            btn.querySelector('.aj-layer-label').innerText = "Satellite";
        }
    }

    _locateUser() {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            this.map.setView([latitude, longitude], 16);
            this.addMarker(latitude, longitude, "You are here");
        });
    }

    async _performSearch(query) {
        const resultsContainer = document.getElementById(`${this.containerId}-results`);
        if (!query || query.length < 3) {
            resultsContainer.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();

            resultsContainer.innerHTML = '';
            if (data.length > 0) {
                resultsContainer.style.display = 'block';
                data.slice(0, 5).forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'aj-result-item';
                    div.innerHTML = `<span>${item.display_name}</span>`;
                    div.onclick = () => {
                        const lat = parseFloat(item.lat);
                        const lon = parseFloat(item.lon);
                        this.map.setView([lat, lon], 16);
                        this.addMarker(lat, lon, item.display_name.split(',')[0]);
                        resultsContainer.style.display = 'none';
                        document.getElementById(`${this.containerId}-search`).value = item.display_name;
                    };
                    resultsContainer.appendChild(div);
                });
            } else {
                resultsContainer.style.display = 'none';
            }
        } catch (e) {
            console.error("Search failed", e);
        }
    }

    // Public API Methods
    
    addMarker(lat, lng, title = '', description = '') {
        const icon = L.divIcon({
            className: 'custom-div-icon',
            html: "<div class='aj-marker-pin'></div>",
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });

        const marker = L.marker([lat, lng], { icon: icon }).addTo(this.map);
        if (title) {
            marker.bindPopup(`<b>${title}</b><br>${description}`);
        }
        return marker;
    }

    setView(lat, lng, zoom) {
        this.map.setView([lat, lng], zoom);
    }
}

// Expose to window
window.AJMap = AJMap;
