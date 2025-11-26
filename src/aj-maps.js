/**
 * AJ STUDIOZ Maps SDK v2.0
 * A complete, standalone mapping engine with no third-party dependencies.
 * (c) AJ STUDIOZ - All Rights Reserved
 */

class AJMap {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            center: options.center || [40.7128, -74.0060],
            zoom: options.zoom || 13,
            minZoom: options.minZoom || 3,
            maxZoom: options.maxZoom || 19,
            tileSize: 256,
            mode: options.mode || '2d' // '2d' or '3d'
        };
        
        this.zoom = this.options.zoom;
        this.center = { lat: this.options.center[0], lng: this.options.center[1] };
        this.isDragging = false;
        this.dragStart = null;
        this.tiles = new Map();
        this.markers = [];
        this.currentLayer = 'streets';
        this.routePolyline = null;
        this.darkMode = false;
        
        // 3D specific properties
        this.mode = this.options.mode;
        this.pitch = 0; // Tilt angle (0-60 degrees)
        this.bearing = 0; // Rotation angle (0-360 degrees)
        
        this.init();
    }

    init() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`AJ Maps: Container '${this.containerId}' not found.`);
            return;
        }
        
        // Set explicit positioning
        container.style.position = container.style.position || 'relative';
        container.classList.add('aj-map-container');
        container.innerHTML = ''; // Clear container
        
        // Create canvas for map tiles
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'aj-map-canvas';
        this.canvas.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: grab;';
        container.appendChild(this.canvas);
        
        this.ctx = this.canvas.getContext('2d', { alpha: false, desynchronized: true });
        
        // Create overlay container for markers/UI
        this.overlay = document.createElement('div');
        this.overlay.className = 'aj-map-overlay';
        this.overlay.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;';
        container.appendChild(this.overlay);
        
        this._setupCanvas();
        this._addUI();
        this._addBranding();
        this._initContextMenu();
        this._bindEvents();
        
        // Ensure first render happens after setup
        requestAnimationFrame(() => this._render());
    }

    _setupCanvas() {
        const container = document.getElementById(this.containerId);
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        this.ctx.scale(dpr, dpr);
        
        // Store display dimensions
        this.displayWidth = rect.width;
        this.displayHeight = rect.height;
    }

    // Web Mercator Projection
    _latToY(lat) {
        const sin = Math.sin(lat * Math.PI / 180);
        const y = 0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI);
        return y;
    }

    _lngToX(lng) {
        return (lng + 180) / 360;
    }

    _pixelToLat(y) {
        const n = Math.PI - 2 * Math.PI * y / (Math.pow(2, this.zoom) * this.options.tileSize);
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    }

    _pixelToLng(x) {
        return x / (Math.pow(2, this.zoom) * this.options.tileSize) * 360 - 180;
    }

    _latLngToPixel(lat, lng) {
        const scale = Math.pow(2, this.zoom) * this.options.tileSize;
        const x = this._lngToX(lng) * scale;
        const y = this._latToY(lat) * scale;
        return { x, y };
    }

    _getTileURL(x, y, z, layer = 'streets') {
        const servers = ['a', 'b', 'c'];
        const s = servers[Math.abs(x + y) % 3];
        
        if (layer === 'satellite') {
            return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
        } else if (layer === 'labels') {
            return `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${z}/${y}/${x}`;
        } else {
            return `https://${s}.basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
        }
    }

    _loadTile(x, y, z, layer) {
        const key = `${layer}-${z}-${x}-${y}`;
        
        if (this.tiles.has(key)) {
            return this.tiles.get(key);
        }
        
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = this._getTileURL(x, y, z, layer);
        
        const tileData = { img, loaded: false };
        this.tiles.set(key, tileData);
        
        img.onload = () => {
            tileData.loaded = true;
            this._render();
        };
        
        return tileData;
    }

    _render() {
        const width = this.displayWidth || this.canvas.width;
        const height = this.displayHeight || this.canvas.height;
        
        this.ctx.clearRect(0, 0, width, height);
        
        // Apply dark mode filter
        if (this.darkMode) {
            this.ctx.filter = 'invert(1) hue-rotate(180deg) brightness(0.8) contrast(1.2)';
        } else {
            this.ctx.filter = 'none';
        }
        
        if (this.mode === '3d') {
            this._render3D();
            return;
        }
        
        const centerPixel = this._latLngToPixel(this.center.lat, this.center.lng);
        const offsetX = width / 2 - centerPixel.x;
        const offsetY = height / 2 - centerPixel.y;
        
        const numTiles = Math.pow(2, this.zoom);
        const startTileX = Math.floor((centerPixel.x - width / 2) / this.options.tileSize);
        const startTileY = Math.floor((centerPixel.y - height / 2) / this.options.tileSize);
        const endTileX = Math.ceil((centerPixel.x + width / 2) / this.options.tileSize);
        const endTileY = Math.ceil((centerPixel.y + height / 2) / this.options.tileSize);
        
        // Draw base layer
        for (let ty = startTileY; ty <= endTileY; ty++) {
            for (let tx = startTileX; tx <= endTileX; tx++) {
                if (tx < 0 || tx >= numTiles || ty < 0 || ty >= numTiles) continue;
                
                const tile = this._loadTile(tx, ty, this.zoom, this.currentLayer);
                if (tile.loaded) {
                    const x = tx * this.options.tileSize + offsetX;
                    const y = ty * this.options.tileSize + offsetY;
                    this.ctx.drawImage(tile.img, x, y, this.options.tileSize, this.options.tileSize);
                }
            }
        }
        
        // Draw labels if satellite mode
        if (this.currentLayer === 'satellite') {
            for (let ty = startTileY; ty <= endTileY; ty++) {
                for (let tx = startTileX; tx <= endTileX; tx++) {
                    if (tx < 0 || tx >= numTiles || ty < 0 || ty >= numTiles) continue;
                    
                    const labelTile = this._loadTile(tx, ty, this.zoom, 'labels');
                    if (labelTile.loaded) {
                        const x = tx * this.options.tileSize + offsetX;
                        const y = ty * this.options.tileSize + offsetY;
                        this.ctx.drawImage(labelTile.img, x, y, this.options.tileSize, this.options.tileSize);
                    }
                }
            }
        }
        
        this.ctx.filter = 'none';
        
        // Update marker positions
        this._updateMarkers();
        this._updateRoute();
    }

    _bindEvents() {
        // Mouse drag
        this.canvas.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStart = { 
                x: e.clientX, 
                y: e.clientY, 
                center: { ...this.center },
                bearing: this.bearing,
                pitch: this.pitch
            };
            this.canvas.style.cursor = 'grabbing';
        });
        
        window.addEventListener('mousemove', (e) => {
            if (!this.isDragging) return;
            
            const dx = e.clientX - this.dragStart.x;
            const dy = e.clientY - this.dragStart.y;
            
            if (this.mode === '3d') {
                // In 3D mode, rotate the globe
                this.bearing = this.dragStart.bearing - dx * 0.3;
                this.pitch = Math.max(0, Math.min(60, this.dragStart.pitch + dy * 0.2));
            } else {
                // 2D panning
                const scale = Math.pow(2, this.zoom) * this.options.tileSize;
                const dLng = -dx / scale * 360;
                const centerY = this._latToY(this.dragStart.center.lat) + dy / scale;
                const dLat = this._pixelToLat(centerY * Math.pow(2, this.zoom) * this.options.tileSize);
                
                this.center = {
                    lat: dLat,
                    lng: this.dragStart.center.lng + dLng
                };
            }
            
            this._render();
        });
        
        window.addEventListener('mouseup', () => {
            this.isDragging = false;
            this.canvas.style.cursor = 'grab';
        });
        
        // Mouse wheel zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const oldZoom = this.zoom;
            this.zoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, this.zoom + (e.deltaY < 0 ? 1 : -1)));
            
            if (oldZoom !== this.zoom) {
                // Zoom to mouse position
                const centerPixel = this._latLngToPixel(this.center.lat, this.center.lng);
                const offsetX = this.canvas.width / 2 - centerPixel.x;
                const offsetY = this.canvas.height / 2 - centerPixel.y;
                
                const worldX = mouseX - offsetX;
                const worldY = mouseY - offsetY;
                
                const mouseLat = this._pixelToLat(worldY);
                const mouseLng = this._pixelToLng(worldX);
                
                this._render();
            }
        });
        
        // Touch support
        let touchStart = null;
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, center: { ...this.center } };
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && touchStart) {
                const dx = e.touches[0].clientX - touchStart.x;
                const dy = e.touches[0].clientY - touchStart.y;
                
                const scale = Math.pow(2, this.zoom) * this.options.tileSize;
                const dLng = -dx / scale * 360;
                const centerY = this._latToY(touchStart.center.lat) + dy / scale;
                const dLat = this._pixelToLat(centerY * Math.pow(2, this.zoom) * this.options.tileSize);
                
                this.center = {
                    lat: dLat,
                    lng: touchStart.center.lng + dLng
                };
                
                this._render();
            }
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this._setupCanvas();
            this._render();
        });
    }

    _addUI() {
        const container = document.getElementById(this.containerId);
        
        // Sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'aj-sidebar';
        sidebar.id = `${this.containerId}-sidebar`;
        sidebar.innerHTML = `<div class="aj-sidebar-content" id="${this.containerId}-sidebar-content"></div>`;
        container.appendChild(sidebar);
        
        // Search Box
        const searchBox = document.createElement('div');
        searchBox.className = 'aj-search-box';
        searchBox.innerHTML = `
            <span class="aj-search-icon" id="${this.containerId}-menu-btn">☰</span>
            <input type="text" class="aj-search-input" placeholder="Search AJ Maps" id="${this.containerId}-search">
            <span class="aj-search-icon" id="${this.containerId}-search-btn">🔍</span>
        `;
        container.appendChild(searchBox);
        
        document.getElementById(`${this.containerId}-menu-btn`).onclick = () => {
            sidebar.classList.toggle('open');
        };
        
        const input = searchBox.querySelector('input');
        let debounceTimer;
        input.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => this._performSearch(e.target.value), 500);
        });
        
        // Controls
        const controls = document.createElement('div');
        controls.className = 'aj-controls-container';
        controls.innerHTML = `
            <button class="aj-fab" id="${this.containerId}-3d" title="Toggle 3D/Globe View">🌐</button>
            <button class="aj-fab" id="${this.containerId}-mode" title="Toggle Dark Mode">🌙</button>
            <button class="aj-fab" id="${this.containerId}-loc" title="My Location">📍</button>
            <button class="aj-fab" id="${this.containerId}-in" title="Zoom In">+</button>
            <button class="aj-fab" id="${this.containerId}-out" title="Zoom Out">−</button>
        `;
        container.appendChild(controls);
        
        document.getElementById(`${this.containerId}-in`).onclick = () => this.zoomIn();
        document.getElementById(`${this.containerId}-out`).onclick = () => this.zoomOut();
        document.getElementById(`${this.containerId}-loc`).onclick = () => this._locateUser();
        document.getElementById(`${this.containerId}-mode`).onclick = () => this.toggleDarkMode();
        document.getElementById(`${this.containerId}-3d`).onclick = () => this.toggle3D();
        
        // Layer Switcher
        const layerSwitch = document.createElement('div');
        layerSwitch.className = 'aj-layer-switch';
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
        
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerPixel = this._latLngToPixel(this.center.lat, this.center.lng);
            const offsetX = this.canvas.width / 2 - centerPixel.x;
            const offsetY = this.canvas.height / 2 - centerPixel.y;
            
            const worldX = x - offsetX;
            const worldY = y - offsetY;
            
            const clickLat = this._pixelToLat(worldY);
            const clickLng = this._pixelToLng(worldX);
            
            menu.style.display = 'block';
            menu.style.left = `${e.clientX}px`;
            menu.style.top = `${e.clientY}px`;
            
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
                this._showDirectionsPanel(null, { lat: clickLat, lng: clickLng });
                menu.style.display = 'none';
            };
            document.getElementById(`${this.containerId}-ctx-center`).onclick = () => {
                this.setView(clickLat, clickLng, this.zoom);
                menu.style.display = 'none';
            };
            document.getElementById(`${this.containerId}-ctx-what`).onclick = () => {
                this._reverseGeocode(clickLat, clickLng);
                menu.style.display = 'none';
            };
        });
        
        this.canvas.addEventListener('click', () => {
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
            this.currentLayer = 'satellite';
            btn.style.backgroundImage = "url('https://a.basemaps.cartocdn.com/rastertiles/voyager/5/10/10.png')";
            btn.querySelector('.aj-layer-label').innerText = "Map";
        } else {
            this.currentLayer = 'streets';
            btn.style.backgroundImage = "url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/10/10')";
            btn.querySelector('.aj-layer-label').innerText = "Satellite";
        }
        this.tiles.clear();
        this._render();
    }

    _locateUser() {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        
        navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            this.setView(latitude, longitude, 16);
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
                        this.setView(lat, lon, 16);
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
        let startCoords;
        
        const getPos = () => new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => resolve(this.center)
            );
        });
        
        startCoords = await getPos();
        
        if (!endCoords) return alert("Please select a destination");
        
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
        
        try {
            const resp = await fetch(url);
            const data = await resp.json();
            
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                this.routePolyline = route.geometry.coordinates;
                this._render();
                
                const duration = Math.round(route.duration / 60);
                const distance = (route.distance / 1000).toFixed(1);
                
                document.getElementById(`${this.containerId}-route-info`).innerHTML = `
                    <div style="margin-top:10px; padding:10px; background:#e8f0fe; border-radius:8px;">
                        <strong>${duration} min</strong> (${distance} km)<br>
                        Fastest route now.
                    </div>
                `;
            }
        } catch (e) {
            console.error("Routing failed", e);
            alert("Could not calculate route.");
        }
    }

    _updateRoute() {
        if (!this.routePolyline) return;
        
        const width = this.displayWidth || this.canvas.width;
        const height = this.displayHeight || this.canvas.height;
        
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#1a73e8';
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        this.routePolyline.forEach((coord, i) => {
            const pixel = this._latLngToPixel(coord[1], coord[0]);
            const centerPixel = this._latLngToPixel(this.center.lat, this.center.lng);
            const x = pixel.x - centerPixel.x + width / 2;
            const y = pixel.y - centerPixel.y + height / 2;
            
            if (i === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
        });
        
        this.ctx.stroke();
    }

    async _reverseGeocode(lat, lng) {
        const sidebar = document.getElementById(`${this.containerId}-sidebar`);
        sidebar.classList.add('open');
        
        try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await resp.json();
            this._showPlaceDetails(data);
            this.addMarker(lat, lng, "Selected Location");
        } catch (e) {
            console.error(e);
        }
    }

    _updateMarkers() {
        this.markers.forEach(marker => {
            const pixel = this._latLngToPixel(marker.lat, marker.lng);
            const centerPixel = this._latLngToPixel(this.center.lat, this.center.lng);
            const x = pixel.x - centerPixel.x + this.canvas.width / 2;
            const y = pixel.y - centerPixel.y + this.canvas.height / 2;
            
            marker.element.style.left = `${x - 15}px`;
            marker.element.style.top = `${y - 42}px`;
        });
    }

    // Public API Methods
    
    addMarker(lat, lng, title = '', description = '') {
        const markerEl = document.createElement('div');
        markerEl.className = 'aj-marker';
        markerEl.innerHTML = `<div class="aj-marker-pin"></div>`;
        markerEl.style.cssText = 'position: absolute; pointer-events: auto; cursor: pointer;';
        
        if (title) {
            markerEl.onclick = () => {
                alert(`${title}\n${description}`);
            };
        }
        
        this.overlay.appendChild(markerEl);
        
        const marker = { lat, lng, title, description, element: markerEl };
        this.markers.push(marker);
        this._render();
        
        return marker;
    }

    setView(lat, lng, zoom) {
        this.center = { lat, lng };
        if (zoom !== undefined) this.zoom = Math.max(this.options.minZoom, Math.min(this.options.maxZoom, zoom));
        this._render();
    }

    zoomIn() {
        if (this.zoom < this.options.maxZoom) {
            this.zoom++;
            this._render();
        }
    }

    zoomOut() {
        if (this.zoom > this.options.minZoom) {
            this.zoom--;
            this._render();
        }
    }

    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        const container = document.getElementById(this.containerId);
        container.classList.toggle('aj-dark-mode');
        this._render();
    }

    clearMarkers() {
        this.markers.forEach(m => m.element.remove());
        this.markers = [];
    }

    clearRoute() {
        this.routePolyline = null;
        this._render();
    }

    // 3D Mode Methods
    
    toggle3D() {
        this.mode = this.mode === '2d' ? '3d' : '2d';
        
        if (this.mode === '3d') {
            this.pitch = 45; // Initial tilt
            this.zoom = Math.max(3, this.zoom - 2); // Zoom out for better globe view
        } else {
            this.pitch = 0;
            this.bearing = 0;
        }
        
        this.tiles.clear();
        this._render();
    }

    _render3D() {
        const ctx = this.ctx;
        const width = this.displayWidth || this.canvas.width;
        const height = this.displayHeight || this.canvas.height;
        
        // Draw globe background
        const gradient = ctx.createRadialGradient(
            width/2, height/2, 0,
            width/2, height/2, Math.min(width, height) / 2
        );
        gradient.addColorStop(0, '#4a90e2');
        gradient.addColorStop(0.7, '#2c5aa0');
        gradient.addColorStop(1, '#1a1a2e');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width/2, height/2, Math.min(width, height) / 2.2, 0, Math.PI * 2);
        ctx.fill();
        
        // Sphere parameters
        const radius = Math.min(width, height) / 2.2;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Draw tiles on sphere
        const numTiles = Math.pow(2, Math.min(this.zoom, 5)); // Limit for performance
        const tileAngleStep = 360 / numTiles;
        
        // Calculate visible tiles based on center and bearing
        for (let latIdx = 0; latIdx < 8; latIdx++) {
            for (let lngIdx = 0; lngIdx < numTiles; lngIdx++) {
                const lat = 85 - (latIdx * 170 / 8);
                const lng = -180 + (lngIdx * 360 / numTiles) + this.bearing;
                
                // Check if tile is on visible side of globe
                const adjustedLng = lng - this.center.lng;
                if (Math.abs(adjustedLng) > 90) continue;
                
                // Convert lat/lng to sphere coordinates
                const phi = (90 - lat) * Math.PI / 180;
                const theta = ((lng - this.center.lng) * Math.PI / 180);
                
                const x = radius * Math.sin(phi) * Math.sin(theta);
                const y = radius * Math.cos(phi) * Math.cos(this.pitch * Math.PI / 180) - 
                         radius * Math.sin(phi) * Math.cos(theta) * Math.sin(this.pitch * Math.PI / 180);
                const z = radius * Math.sin(phi) * Math.cos(theta) * Math.cos(this.pitch * Math.PI / 180) + 
                         radius * Math.cos(phi) * Math.sin(this.pitch * Math.PI / 180);
                
                // Only draw front-facing tiles
                if (z > 0) {
                    const screenX = centerX + x;
                    const screenY = centerY - y;
                    
                    // Calculate tile coordinates
                    const tileZoom = Math.min(Math.floor(this.zoom / 2), 5);
                    const tileX = Math.floor((lng + 180) / 360 * Math.pow(2, tileZoom));
                    const tileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, tileZoom));
                    
                    if (tileX >= 0 && tileX < Math.pow(2, tileZoom) && tileY >= 0 && tileY < Math.pow(2, tileZoom)) {
                        const tile = this._loadTile(tileX, tileY, tileZoom, this.currentLayer);
                        
                        if (tile.loaded) {
                            // Calculate tile size based on perspective
                            const scale = 1 / (1 + z / radius * 0.5);
                            const tileSize = 60 * scale;
                            
                            ctx.save();
                            ctx.globalAlpha = Math.max(0.3, 1 - z / radius);
                            ctx.drawImage(
                                tile.img,
                                screenX - tileSize/2,
                                screenY - tileSize/2,
                                tileSize,
                                tileSize
                            );
                            ctx.restore();
                        }
                    }
                }
            }
        }
        
        // Draw country borders/grid
        ctx.strokeStyle = this.darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        
        // Latitude lines
        for (let lat = -80; lat <= 80; lat += 20) {
            ctx.beginPath();
            for (let lng = -180; lng <= 180; lng += 5) {
                const adjustedLng = lng - this.center.lng + this.bearing;
                if (Math.abs(adjustedLng) > 90) continue;
                
                const phi = (90 - lat) * Math.PI / 180;
                const theta = adjustedLng * Math.PI / 180;
                
                const x = radius * Math.sin(phi) * Math.sin(theta);
                const y = radius * Math.cos(phi) * Math.cos(this.pitch * Math.PI / 180) - 
                         radius * Math.sin(phi) * Math.cos(theta) * Math.sin(this.pitch * Math.PI / 180);
                const z = radius * Math.sin(phi) * Math.cos(theta) * Math.cos(this.pitch * Math.PI / 180) + 
                         radius * Math.cos(phi) * Math.sin(this.pitch * Math.PI / 180);
                
                if (z > 0) {
                    const screenX = centerX + x;
                    const screenY = centerY - y;
                    if (lng === -180) ctx.moveTo(screenX, screenY);
                    else ctx.lineTo(screenX, screenY);
                }
            }
            ctx.stroke();
        }
        
        // Longitude lines
        for (let lng = -180; lng <= 180; lng += 30) {
            ctx.beginPath();
            for (let lat = -85; lat <= 85; lat += 5) {
                const adjustedLng = lng - this.center.lng + this.bearing;
                if (Math.abs(adjustedLng) > 90) continue;
                
                const phi = (90 - lat) * Math.PI / 180;
                const theta = adjustedLng * Math.PI / 180;
                
                const x = radius * Math.sin(phi) * Math.sin(theta);
                const y = radius * Math.cos(phi) * Math.cos(this.pitch * Math.PI / 180) - 
                         radius * Math.sin(phi) * Math.cos(theta) * Math.sin(this.pitch * Math.PI / 180);
                const z = radius * Math.sin(phi) * Math.cos(theta) * Math.cos(this.pitch * Math.PI / 180) + 
                         radius * Math.cos(phi) * Math.sin(this.pitch * Math.PI / 180);
                
                if (z > 0) {
                    const screenX = centerX + x;
                    const screenY = centerY - y;
                    if (lat === -85) ctx.moveTo(screenX, screenY);
                    else ctx.lineTo(screenX, screenY);
                }
            }
            ctx.stroke();
        }
        
        // Add atmosphere glow
        const glowGradient = ctx.createRadialGradient(
            width/2, height/2, radius * 0.9,
            width/2, height/2, radius * 1.1
        );
        glowGradient.addColorStop(0, 'rgba(135, 206, 250, 0)');
        glowGradient.addColorStop(1, 'rgba(135, 206, 250, 0.3)');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(width/2, height/2, radius * 1.1, 0, Math.PI * 2);
        ctx.fill();
        
        this.ctx.filter = 'none';
        this._updateMarkers();
    }

    setPitch(angle) {
        this.pitch = Math.max(0, Math.min(60, angle));
        this._render();
    }

    setBearing(angle) {
        this.bearing = angle % 360;
        this._render();
    }

    rotateTo(bearing, duration = 1000) {
        const start = this.bearing;
        const end = bearing;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.bearing = start + (end - start) * progress;
            this._render();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
}

// Expose to window
window.AJMap = AJMap;
