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
        this.routeLayer = null;
        this.contextMenu = null;
        
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

        // Satellite with Labels (Hybrid)
        const satImg = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
        });
        const satLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19
        });
        this.layers.satellite = L.layerGroup([satImg, satLabels]);

        // Add default layer
        this.layers.streets.addTo(this.map);

        // Add UI Components
        this._addUI();
        this._addBranding();
        this._initContextMenu();
    }

    _addUI() {
        const container = document.getElementById(this.containerId);

        // 0. Sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'aj-sidebar';
        sidebar.id = `${this.containerId}-sidebar`;
        sidebar.innerHTML = `
            <div class="aj-sidebar-content" id="${this.containerId}-sidebar-content"></div>
        `;
        container.appendChild(sidebar);

        // 1. Search Box
        const searchBox = document.createElement('div');
        searchBox.className = 'aj-search-box';
        searchBox.innerHTML = `
            <span class="aj-search-icon" id="${this.containerId}-menu-btn">☰</span>
            <input type="text" class="aj-search-input" placeholder="Search AJ Maps" id="${this.containerId}-search">
            <span class="aj-search-icon" id="${this.containerId}-search-btn" style="font-size: 16px;">🔍</span>
        `;
        container.appendChild(searchBox);

        // Toggle Sidebar on Menu Click
        document.getElementById(`${this.containerId}-menu-btn`).onclick = () => {
            sidebar.classList.toggle('open');
        };

        // Search Functionality (using Nominatim)
        const input = searchBox.querySelector('input');
        let debounceTimer;
        
        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => this._performSearch(e.target.value), 500);
        });

        // 2. Controls (Zoom & Location & Dark Mode)
        const controls = document.createElement('div');
        controls.className = 'aj-controls-container';
        controls.innerHTML = `
            <button class="aj-fab" id="${this.containerId}-mode" title="Toggle Dark Mode">🌙</button>
            <button class="aj-fab" id="${this.containerId}-loc" title="My Location">📍</button>
            <button class="aj-fab" id="${this.containerId}-in" title="Zoom In">+</button>
            <button class="aj-fab" id="${this.containerId}-out" title="Zoom Out">−</button>
        `;
        container.appendChild(controls);

        // Bind Control Events
        document.getElementById(`${this.containerId}-in`).onclick = () => this.map.zoomIn();
        document.getElementById(`${this.containerId}-out`).onclick = () => this.map.zoomOut();
        document.getElementById(`${this.containerId}-loc`).onclick = () => this._locateUser();
        document.getElementById(`${this.containerId}-mode`).onclick = () => {
            container.classList.toggle('aj-dark-mode');
        };

        // 3. Layer Switcher (Satellite/Map)
        const layerSwitch = document.createElement('div');
        layerSwitch.className = 'aj-layer-switch';
        // Set initial background to satellite because clicking it switches TO satellite
        layerSwitch.style.backgroundImage = "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/10/10')";
        layerSwitch.innerHTML = `<div class="aj-layer-label">Satellite</div>`;
        
        layerSwitch.onclick = () => this._toggleLayer(layerSwitch);
        container.appendChild(layerSwitch);
    }

    _initContextMenu() {
        const container = document.getElementById(this.containerId);
        const menu = document.createElement('div');
        menu.className = 'aj-context-menu';
        menu.id = `${this.containerId}-context-menu`;
        container.appendChild(menu);
        this.contextMenu = menu;

        let clickLatlng = null;

        this.map.on('contextmenu', (e) => {
            clickLatlng = e.latlng;
            menu.style.display = 'block';
            menu.style.left = `${e.containerPoint.x}px`;
            menu.style.top = `${e.containerPoint.y}px`;
            
            menu.innerHTML = `
                <div class="aj-context-item" id="${this.containerId}-ctx-here">
                    <span>📍</span> Directions to here
                </div>
                <div class="aj-context-item" id="${this.containerId}-ctx-center">
                    <span>🎯</span> Center map here
                </div>
                <div class="aj-context-item" id="${this.containerId}-ctx-what">
                    <span>❓</span> What's here?
                </div>
            `;

            document.getElementById(`${this.containerId}-ctx-here`).onclick = () => {
                this._showDirectionsPanel(null, clickLatlng);
                menu.style.display = 'none';
            };
            document.getElementById(`${this.containerId}-ctx-center`).onclick = () => {
                this.map.setView(clickLatlng, this.map.getZoom());
                menu.style.display = 'none';
            };
            document.getElementById(`${this.containerId}-ctx-what`).onclick = () => {
                this._reverseGeocode(clickLatlng);
                menu.style.display = 'none';
            };
        });

        this.map.on('click', () => {
            menu.style.display = 'none';
        });
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
        const sidebar = document.getElementById(`${this.containerId}-sidebar`);
        const content = document.getElementById(`${this.containerId}-sidebar-content`);
        
        if (!query || query.length < 3) return;

        sidebar.classList.add('open');
        content.innerHTML = '<div style="padding:20px; text-align:center;">Searching...</div>';

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();

            content.innerHTML = '<div class="aj-search-results"></div>';
            const resultsDiv = content.querySelector('.aj-search-results');

            if (data.length > 0) {
                data.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'aj-result-item';
                    div.innerHTML = `<span>${item.display_name}</span>`;
                    div.onclick = () => {
                        const lat = parseFloat(item.lat);
                        const lon = parseFloat(item.lon);
                        this.map.setView([lat, lon], 16);
                        this.addMarker(lat, lon, item.display_name.split(',')[0]);
                        this._showPlaceDetails(item);
                    };
                    resultsDiv.appendChild(div);
                });
            } else {
                content.innerHTML = '<div style="padding:20px;">No results found.</div>';
            }
        } catch (e) {
            console.error("Search failed", e);
            content.innerHTML = '<div style="padding:20px;">Search failed.</div>';
        }
    }

    _showPlaceDetails(item) {
        const content = document.getElementById(`${this.containerId}-sidebar-content`);
        content.innerHTML = `
            <div class="aj-place-details">
                <div class="aj-place-title">${item.display_name.split(',')[0]}</div>
                <div class="aj-place-coords">${item.display_name}</div>
                <button class="aj-action-btn" id="${this.containerId}-btn-dir">
                    <span>🚗</span> Directions
                </button>
            </div>
        `;
        
        document.getElementById(`${this.containerId}-btn-dir`).onclick = () => {
            this._showDirectionsPanel(null, { lat: item.lat, lng: item.lon });
        };
    }

    _showDirectionsPanel(start, end) {
        const sidebar = document.getElementById(`${this.containerId}-sidebar`);
        const content = document.getElementById(`${this.containerId}-sidebar-content`);
        sidebar.classList.add('open');

        content.innerHTML = `
            <div class="aj-directions-panel">
                <h3>Directions</h3>
                <input type="text" class="aj-dir-input" id="${this.containerId}-start" placeholder="Choose starting point..." value="${start ? start.lat + ',' + start.lng : 'My Location'}">
                <input type="text" class="aj-dir-input" id="${this.containerId}-end" placeholder="Choose destination..." value="${end ? end.lat + ',' + end.lng : ''}">
                <button class="aj-action-btn" id="${this.containerId}-get-route">Get Directions</button>
            </div>
            <div id="${this.containerId}-route-info" style="padding:10px;"></div>
        `;

        document.getElementById(`${this.containerId}-get-route`).onclick = () => {
            this._calculateRoute(end);
        };
    }

    async _calculateRoute(endCoords) {
        // For demo, we assume start is user location or map center if "My Location"
        // In a real app, we'd geocode the input strings.
        
        let startCoords;
        
        // Simple promise wrapper for geolocation
        const getPos = () => new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => resolve(this.map.getCenter()) // Fallback
            );
        });

        startCoords = await getPos();
        
        if (!endCoords) return alert("Please select a destination");

        // OSRM API
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;

        try {
            const resp = await fetch(url);
            const data = await resp.json();

            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                const geojson = route.geometry;

                if (this.routeLayer) this.map.removeLayer(this.routeLayer);
                
                this.routeLayer = L.geoJSON(geojson, {
                    style: { color: '#1a73e8', weight: 5, opacity: 0.7 }
                }).addTo(this.map);

                this.map.fitBounds(this.routeLayer.getBounds(), { padding: [50, 50] });

                const duration = Math.round(route.duration / 60);
                const distance = (route.distance / 1000).toFixed(1);
                
                document.getElementById(`${this.containerId}-route-info`).innerHTML = `
                    <div style="margin-top:10px; padding:10px; background:#e8f0fe; border-radius:8px;">
                        <strong>${duration} min</strong> (${distance} km)<br>
                        Fastest route now due to traffic conditions.
                    </div>
                `;
            }
        } catch (e) {
            console.error("Routing failed", e);
            alert("Could not calculate route.");
        }
    }

    async _reverseGeocode(latlng) {
        const sidebar = document.getElementById(`${this.containerId}-sidebar`);
        sidebar.classList.add('open');
        
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`);
            const data = await resp.json();
            this._showPlaceDetails(data);
            this.addMarker(latlng.lat, latlng.lng, "Selected Location");
        } catch (e) {
            console.error(e);
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
