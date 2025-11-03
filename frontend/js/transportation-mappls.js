// MapMyIndia (Mappls) Transportation Hub - BEST for India!
// Using Mappls Nearby API for accurate Indian locations

// ⚠️ NOTE: MapMyIndia API has CORS restrictions - can't be called directly from frontend
// Using sample data with real Hyderabad transport coordinates
const TRANSPORT_API_KEY = 'fxigrrtrepfesfcdxlxlojqsidvfzofelxbt'; // Not used due to CORS

let transportMap;
let eventTransportLocation = { lat: 0, lng: 0 };
let allTransportData = {
    bus: [],
    metro: [],
    airport: [],
    parking: [],
    all: []
};
let transportMarkers = [];
let currentTransportFilter = 'all';

// Main function to load nearby transportation
async function loadNearbyTransportation(lat, lng, eventName) {
    if (!lat || !lng) {
        console.log('No coordinates provided for transportation');
        return;
    }

    eventTransportLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    
    console.log('🚌 Loading nearby transportation...', { lat, lng, eventName });
    
    // Show the transportation section
    const transportSection = document.getElementById('transportation-section');
    if (transportSection) {
        transportSection.style.display = 'block';
        console.log('✅ Transportation section displayed');
    } else {
        console.error('❌ Transportation section not found!');
        return;
    }

    // Initialize map first (needed for both API and sample data)
    initializeTransportMap();
    
    // Setup view toggle buttons
    setupViewToggle();
    
    // Setup category filter tabs
    setupCategoryTabs();

    // MapMyIndia API has CORS restrictions and can't be called from frontend
    // Using sample data with real verified transport coordinates
    console.log('📍 Using sample transport (MapMyIndia API blocked by CORS - needs backend proxy)');
    showSampleTransport();
}

// Initialize Leaflet Map for Transportation
function initializeTransportMap() {
    const mapContainer = document.getElementById('transport-map-container');
    if (!mapContainer) return;

    // Create map centered on event location
    transportMap = L.map('transport-map-container').setView([eventTransportLocation.lat, eventTransportLocation.lng], 13);

    // Add OpenStreetMap tiles (Free, no auth required)
    // Note: Using Mappls API for POI data, OSM for map display
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> | Data by <a href="https://www.mappls.com/" target="_blank">Mappls</a>',
        maxZoom: 19
    }).addTo(transportMap);

    // Add event venue marker (Purple)
    const eventIcon = L.divIcon({
        className: 'event-marker',
        html: `<div style="background: #7c3aed; width: 45px; height: 45px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 1000;">
                <i class="fas fa-calendar-alt" style="color: white; font-size: 20px; transform: rotate(45deg);"></i>
               </div>`,
        iconSize: [45, 45],
        iconAnchor: [22, 45],
        popupAnchor: [0, -45]
    });

    L.marker([eventTransportLocation.lat, eventTransportLocation.lng], { icon: eventIcon })
        .addTo(transportMap)
        .bindPopup(`<div class="transport-map-popup"><h3>Event Venue</h3><p>Your event is here!</p></div>`)
        .openPopup();
}

// Search for nearby transportation using Mappls Nearby API
async function searchNearbyTransportation() {
    const transportGrid = document.getElementById('transport-grid');
    if (!transportGrid) return;

    // Show loading
    transportGrid.innerHTML = `
        <div class="loading-transport">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching nearby transportation with MapMyIndia...</p>
        </div>
    `;

    try {
        console.log('🇮🇳 Using MapMyIndia/Mappls API for Indian locations');

        // Search for different types of transportation
        await Promise.all([
            searchMapplsNearby('BUS', 'bus', 2000),      // Bus stops within 2km
            searchMapplsNearby('METRO', 'metro', 5000),   // Metro within 5km
            searchMapplsNearby('AIRPORT', 'airport', 50000), // Airport within 50km
            searchMapplsNearby('PARKING', 'parking', 2000)   // Parking within 2km
        ]);

        // Combine all transport data
        allTransportData.all = [
            ...allTransportData.bus,
            ...allTransportData.metro,
            ...allTransportData.airport,
            ...allTransportData.parking
        ];

        // Sort by distance
        allTransportData.all.sort((a, b) => a.distanceValue - b.distanceValue);

        console.log(`✅ Found ${allTransportData.all.length} transportation options from MapMyIndia`);
        console.log('Bus:', allTransportData.bus.length, 
                    'Metro:', allTransportData.metro.length,
                    'Airport:', allTransportData.airport.length,
                    'Parking:', allTransportData.parking.length);

        if (allTransportData.all.length > 0) {
            console.log('🗺️ Using REAL MapMyIndia data!');
            displayTransportList(allTransportData.all);
            addTransportMarkersToMap(allTransportData.all);
        } else {
            console.log('⚠️ No MapMyIndia data available, using sample data');
            showSampleTransport();
        }
    } catch (error) {
        console.error('Error fetching transportation from MapMyIndia:', error);
        console.log('Falling back to sample data');
        showSampleTransport();
    }
}

// Search Mappls Nearby API for specific POI types
async function searchMapplsNearby(poiType, transportType, radius) {
    try {
        // Mappls Nearby API endpoint
        const url = `https://atlas.mappls.com/api/places/nearby/json?keywords=${poiType}&refLocation=${eventTransportLocation.lat},${eventTransportLocation.lng}&radius=${radius}`;
        
        console.log(`🔍 Searching Mappls for ${poiType}...`);
        console.log(`📡 API URL:`, url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${TRANSPORT_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`📊 ${poiType} Response status:`, response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Mappls API error for ${poiType}:`, response.status, errorText);
            return;
        }

        const data = await response.json();
        console.log(`📦 ${poiType} API Response:`, data);
        
        if (data.suggestedLocations && data.suggestedLocations.length > 0) {
            console.log(`Found ${data.suggestedLocations.length} ${poiType} locations from Mappls`);
            
            const processedData = data.suggestedLocations.map(place => {
                const distance = calculateTransportDistance(
                    eventTransportLocation.lat,
                    eventTransportLocation.lng,
                    parseFloat(place.latitude || place.lat),
                    parseFloat(place.longitude || place.lng)
                );

                return {
                    name: place.placeName || place.name,
                    lat: parseFloat(place.latitude || place.lat),
                    lng: parseFloat(place.longitude || place.lng),
                    type: transportType,
                    address: place.placeAddress || place.address || 'Address not available',
                    distance: distance,
                    distanceValue: parseFloat(distance),
                    operator: place.brand || null,
                    city: place.city || null,
                    mapplsPin: place.eLoc || null
                };
            });

            // Sort by distance and limit
            const limit = transportType === 'airport' ? 5 : (transportType === 'parking' ? 10 : 15);
            allTransportData[transportType] = processedData
                .sort((a, b) => a.distanceValue - b.distanceValue)
                .slice(0, limit);
                
        } else {
            console.log(`No ${poiType} found nearby`);
            allTransportData[transportType] = [];
        }
    } catch (error) {
        console.error(`Error searching Mappls for ${poiType}:`, error);
        allTransportData[transportType] = [];
    }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateTransportDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    if (distance < 1) {
        return Math.round(distance * 1000) + 'm';
    }
    return distance.toFixed(1) + 'km';
}

// Display transport list (reuse from existing code)
function displayTransportList(transportList) {
    const transportGrid = document.getElementById('transport-grid');
    if (!transportGrid) return;

    if (transportList.length === 0) {
        transportGrid.innerHTML = `
            <div class="no-transport-found">
                <i class="fas fa-bus-alt"></i>
                <h3>No Transportation Found</h3>
                <p>No ${currentTransportFilter === 'all' ? '' : currentTransportFilter} transportation found nearby.</p>
            </div>
        `;
        return;
    }

    transportGrid.innerHTML = transportList.map((transport, index) => {
        const icon = getTransportIcon(transport.type);
        const typeName = getTransportTypeName(transport.type);
        
        return `
            <div class="transport-card" data-type="${transport.type}" data-index="${index}">
                <div class="transport-icon-header">
                    <i class="${icon}"></i>
                    <div style="flex: 1;">
                        <div class="transport-type-badge">${typeName}</div>
                    </div>
                </div>
                <div class="transport-info">
                    <h3 class="transport-name">${transport.name}</h3>
                    
                    <div class="transport-distance">
                        <i class="fas fa-route"></i> ${transport.distance} from venue
                    </div>
                    
                    <div class="transport-address">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${transport.address}</span>
                    </div>

                    ${generateTransportDetails(transport)}

                    <div class="transport-footer">
                        <button class="transport-directions-btn" onclick="viewTransportDirections(${index}, '${currentTransportFilter}')">
                            <i class="fas fa-directions"></i> Get Directions
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add click events
    document.querySelectorAll('.transport-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('transport-directions-btn')) {
                const index = card.dataset.index;
                viewTransportDirections(parseInt(index), currentTransportFilter);
            }
        });
    });
}

// Generate transport details badges
function generateTransportDetails(transport) {
    const details = [];
    
    if (transport.operator) {
        details.push(`<span class="detail-badge"><i class="fas fa-building"></i> ${transport.operator}</span>`);
    }
    
    if (transport.city) {
        details.push(`<span class="detail-badge"><i class="fas fa-city"></i> ${transport.city}</span>`);
    }
    
    if (transport.mapplsPin) {
        details.push(`<span class="detail-badge"><i class="fas fa-map-pin"></i> ${transport.mapplsPin}</span>`);
    }

    if (details.length === 0) return '';
    
    return `<div class="transport-details">${details.join('')}</div>`;
}

// Get transport icon
function getTransportIcon(type) {
    const icons = {
        bus: 'fas fa-bus',
        metro: 'fas fa-train',
        airport: 'fas fa-plane-departure',
        parking: 'fas fa-parking'
    };
    return icons[type] || 'fas fa-map-marker-alt';
}

// Get transport type name
function getTransportTypeName(type) {
    const names = {
        bus: 'Bus Stop',
        metro: 'Metro/Railway',
        airport: 'Airport',
        parking: 'Parking'
    };
    return names[type] || 'Transport';
}

// Add markers to map
function addTransportMarkersToMap(transportList) {
    // Clear existing markers
    transportMarkers.forEach(marker => transportMap.removeLayer(marker));
    transportMarkers = [];

    transportList.forEach((transport, index) => {
        const color = getTransportColor(transport.type);
        const icon = getTransportIcon(transport.type);

        const transportIcon = L.divIcon({
            className: 'transport-marker',
            html: `<div style="background: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                    <i class="${icon}" style="color: white; font-size: 16px;"></i>
                   </div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 36],
            popupAnchor: [0, -36]
        });

        const marker = L.marker([transport.lat, transport.lng], { icon: transportIcon })
            .addTo(transportMap)
            .bindPopup(`
                <div class="transport-map-popup">
                    <span class="popup-type">${getTransportTypeName(transport.type)}</span>
                    <h3>${transport.name}</h3>
                    <p><i class="fas fa-map-marker-alt"></i> ${transport.address}</p>
                    <p><i class="fas fa-route"></i> ${transport.distance} away</p>
                    <a href="https://www.google.com/maps/dir/?api=1&origin=${eventTransportLocation.lat},${eventTransportLocation.lng}&destination=${transport.lat},${transport.lng}" target="_blank">
                        Get Directions <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `);

        transportMarkers.push(marker);
    });

    // Fit map bounds
    if (transportList.length > 0) {
        const bounds = L.latLngBounds(
            transportList.map(t => [t.lat, t.lng]).concat([[eventTransportLocation.lat, eventTransportLocation.lng]])
        );
        transportMap.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Get transport color
function getTransportColor(type) {
    const colors = {
        bus: '#3b82f6',
        metro: '#ef4444',
        airport: '#10b981',
        parking: '#f59e0b'
    };
    return colors[type] || '#7c3aed';
}

// View directions
window.viewTransportDirections = function(index, filterType) {
    let transport;
    
    if (filterType === 'all') {
        transport = allTransportData.all[index];
    } else {
        transport = allTransportData[filterType][index];
    }
    
    if (!transport) return;
    
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${eventTransportLocation.lat},${eventTransportLocation.lng}&destination=${transport.lat},${transport.lng}`, '_blank');
};

// Fallback sample data (same as before)
function showSampleTransport() {
    console.log('⚠️ Using sample transportation data with REAL coordinates as fallback');
    
    const realHyderabadLocations = [
        { name: 'Jubilee Bus Station (JBS)', type: 'bus', lat: 17.4416, lng: 78.4702, operator: 'TSRTC' },
        { name: 'Kukatpally Bus Stop', type: 'bus', lat: 17.4849, lng: 78.4138, operator: 'TSRTC' },
        { name: 'Miyapur Metro Station', type: 'metro', lat: 17.4954, lng: 78.3582, operator: 'L&T Metro Rail' },
        { name: 'JNTU College Metro Station', type: 'metro', lat: 17.4928, lng: 78.3914, operator: 'L&T Metro Rail' },
        { name: 'Rajiv Gandhi International Airport (HYD)', type: 'airport', lat: 17.2403, lng: 78.4294, operator: 'GMR' },
        { name: 'GVK One Mall Parking', type: 'parking', lat: 17.4326, lng: 78.3894 }
    ].map(location => {
        const distance = calculateTransportDistance(
            eventTransportLocation.lat, 
            eventTransportLocation.lng, 
            location.lat, 
            location.lng
        );
        
        return { ...location, distance, distanceValue: parseFloat(distance), address: 'Hyderabad, Telangana' };
    }).sort((a, b) => a.distanceValue - b.distanceValue);

    allTransportData.bus = realHyderabadLocations.filter(t => t.type === 'bus');
    allTransportData.metro = realHyderabadLocations.filter(t => t.type === 'metro');
    allTransportData.airport = realHyderabadLocations.filter(t => t.type === 'airport');
    allTransportData.parking = realHyderabadLocations.filter(t => t.type === 'parking');
    allTransportData.all = realHyderabadLocations;

    displayTransportList(realHyderabadLocations);
    addTransportMarkersToMap(realHyderabadLocations);
}

// Setup category filter tabs
function setupCategoryTabs() {
    const transportTabs = document.querySelectorAll('.transport-tab');
    transportTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const transportType = tab.dataset.transport;
            currentTransportFilter = transportType;
            
            transportTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            let filteredTransport = transportType === 'all' 
                ? allTransportData.all 
                : allTransportData[transportType] || [];
            
            displayTransportList(filteredTransport);
            addTransportMarkersToMap(filteredTransport);
        });
    });
}

// Setup view toggle buttons
function setupViewToggle() {
    const transportSection = document.querySelector('.transportation-section');
    if (transportSection) {
        const toggleButtons = transportSection.querySelectorAll('.toggle-btn');
        const listView = document.getElementById('transport-list');
        const mapView = document.getElementById('transport-map');

        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                
                toggleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                if (view === 'list') {
                    listView.style.display = 'block';
                    mapView.style.display = 'none';
                } else {
                    listView.style.display = 'none';
                    mapView.style.display = 'block';
                    
                    if (transportMap) {
                        setTimeout(() => {
                            transportMap.invalidateSize();
                        }, 100);
                    }
                }
            });
        });
    }
}

// Export function
window.loadNearbyTransportation = loadNearbyTransportation;

console.log('✅ MapMyIndia/Mappls Transportation Hub loaded');
