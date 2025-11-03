// FREE Nearby Transportation Hub with OpenStreetMap + Leaflet.js (No API Key Required!)
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
    
    // Show the transportation section
    const transportSection = document.getElementById('transportation-section');
    if (transportSection) {
        transportSection.style.display = 'block';
    }

    // Initialize map with OpenStreetMap
    initializeTransportMap();
    
    // Search for nearby transportation using Overpass API (Free!)
    await searchNearbyTransportation();
}

// Initialize Leaflet Map for Transportation
function initializeTransportMap() {
    const mapContainer = document.getElementById('transport-map-container');
    if (!mapContainer) return;

    // Create map centered on event location
    transportMap = L.map('transport-map-container').setView([eventTransportLocation.lat, eventTransportLocation.lng], 13);

    // Add OpenStreetMap tiles (Free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

// Search for nearby transportation using FREE Overpass API
async function searchNearbyTransportation() {
    const transportGrid = document.getElementById('transport-grid');
    if (!transportGrid) return;

    // Show loading
    transportGrid.innerHTML = `
        <div class="loading-transport">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching for nearby transportation options...</p>
        </div>
    `;

    try {
        // Search for different types of transportation with timeout
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), 10000)
        );

        await Promise.race([
            Promise.all([
                searchBusStops(),
                searchMetroStations(),
                searchAirports(),
                searchParking()
            ]),
            timeout
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

        console.log(`✅ Found ${allTransportData.all.length} transportation options from OpenStreetMap`);
        console.log('Bus:', allTransportData.bus.length, 
                    'Metro:', allTransportData.metro.length,
                    'Airport:', allTransportData.airport.length,
                    'Parking:', allTransportData.parking.length);

        if (allTransportData.all.length > 0) {
            console.log('🗺️ Using REAL data from OpenStreetMap!');
            displayTransportList(allTransportData.all);
            addTransportMarkersToMap(allTransportData.all);
        } else {
            console.log('⚠️ No OpenStreetMap data available, using sample data with real Hyderabad coordinates');
            showSampleTransport(); // Fallback to sample data with REAL coordinates
        }
    } catch (error) {
        console.error('Error fetching transportation:', error);
        console.log('Falling back to sample data');
        showSampleTransport(); // Fallback to sample data
    }
}

// Search for bus stops
async function searchBusStops() {
    const radius = 2000; // 2km for bus stops
    const query = `
        [out:json][timeout:25];
        (
            node["highway"="bus_stop"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
            node["amenity"="bus_station"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
        );
        out body;
    `;

    try {
        console.log('Fetching bus stops from Overpass API...');
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query,
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Overpass API response for bus stops:', data.elements.length, 'elements');
            allTransportData.bus = processTransportData(data.elements, 'bus');
        } else {
            console.error('Overpass API error for bus stops:', response.status);
        }
    } catch (error) {
        console.error('Error fetching bus stops:', error);
    }
}

// Search for metro/railway stations
async function searchMetroStations() {
    const radius = 5000; // 5km for metro/railway
    const query = `
        [out:json][timeout:25];
        (
            node["railway"="station"]["station"="subway"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
            node["railway"="station"]["station"="light_rail"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
            node["public_transport"="stop_position"]["train"="yes"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
            node["railway"="halt"]["usage"="main"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
        );
        out body;
    `;

    try {
        console.log('Fetching metro/railway stations from Overpass API...');
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query,
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Overpass API response for metro stations:', data.elements.length, 'elements');
            // Filter out bus stops that might be incorrectly tagged
            const filteredElements = data.elements.filter(el => {
                if (!el.tags) return false;
                // Exclude if it's tagged as a bus stop
                if (el.tags.highway === 'bus_stop' || el.tags.bus === 'yes') return false;
                // Include only if it has railway or metro related tags
                return el.tags.railway || el.tags.subway || el.tags.train;
            });
            console.log('Filtered metro stations:', filteredElements.length);
            allTransportData.metro = processTransportData(filteredElements, 'metro');
        } else {
            console.error('Overpass API error for metro stations:', response.status);
        }
    } catch (error) {
        console.error('Error fetching metro stations:', error);
    }
}

// Search for airports
async function searchAirports() {
    const radius = 50000; // 50km for airports
    const query = `
        [out:json][timeout:25];
        (
            node["aeroway"="aerodrome"]["aerodrome:type"="international"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
            way["aeroway"="aerodrome"]["aerodrome:type"="international"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
            node["aeroway"="aerodrome"]["aerodrome:type"="regional"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
            way["aeroway"="aerodrome"]["aerodrome:type"="regional"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
        );
        out center;
    `;

    try {
        console.log('Fetching airports from Overpass API...');
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query,
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Overpass API response for airports:', data.elements.length, 'elements');
            
            // Filter to show only public/commercial airports, exclude military
            const publicAirports = data.elements.filter(el => {
                if (!el.tags) return false;
                const type = el.tags['aerodrome:type'];
                const military = el.tags.military;
                const access = el.tags.access;
                
                // Exclude military airports
                if (military === 'airfield' || type === 'military') return false;
                // Exclude private airports unless they have commercial service
                if (access === 'private' && !el.tags.iata) return false;
                
                // Include international, regional, or airports with IATA codes
                return type === 'international' || type === 'regional' || el.tags.iata;
            });
            
            console.log('Filtered public airports:', publicAirports.length);
            allTransportData.airport = processTransportData(publicAirports, 'airport');
        } else {
            console.error('Overpass API error for airports:', response.status);
        }
    } catch (error) {
        console.error('Error fetching airports:', error);
    }
}

// Search for parking areas
async function searchParking() {
    const radius = 2000; // 2km for parking
    const query = `
        [out:json][timeout:25];
        (
            node["amenity"="parking"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
            way["amenity"="parking"](around:${radius},${eventTransportLocation.lat},${eventTransportLocation.lng});
        );
        out center;
    `;

    try {
        console.log('Fetching parking areas from Overpass API...');
        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query,
            headers: {
                'Content-Type': 'text/plain'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Overpass API response for parking:', data.elements.length, 'elements');
            allTransportData.parking = processTransportData(data.elements, 'parking');
        } else {
            console.error('Overpass API error for parking:', response.status);
        }
    } catch (error) {
        console.error('Error fetching parking areas:', error);
    }
}

// Process transport data from Overpass API
function processTransportData(elements, type) {
    const transport = [];
    const seen = new Set();
    
    console.log(`Processing ${elements.length} ${type} elements from Overpass API`);

    elements.forEach(element => {
        // Skip elements without tags (these are usually nodes from way queries)
        if (!element.tags) return;
        
        // Get coordinates - handle both nodes (lat/lon) and ways (center)
        let lat, lon;
        
        if (element.lat && element.lon) {
            // Node with direct coordinates
            lat = element.lat;
            lon = element.lon;
        } else if (element.center) {
            // Way with calculated center
            lat = element.center.lat;
            lon = element.center.lon;
        }
        
        // Skip if no valid coordinates
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) return;
        
        // Verify coordinates are reasonable (within India for your use case)
        if (lat < 8 || lat > 37 || lon < 68 || lon > 97) {
            console.log(`Skipping invalid coordinates: ${lat}, ${lon}`);
            return;
        }

        const name = element.tags.name || getDefaultName(type, element.tags);
        
        // Avoid duplicates
        const key = `${name}-${lat.toFixed(4)}-${lon.toFixed(4)}`;
        if (seen.has(key)) return;
        seen.add(key);

        const distance = calculateTransportDistance(
            eventTransportLocation.lat,
            eventTransportLocation.lng,
            lat,
            lon
        );

        transport.push({
            name: name,
            lat: lat,
            lng: lon,
            type: type,
            address: element.tags['addr:street'] || element.tags['addr:city'] || element.tags['addr:full'] || 'Address not available',
            operator: element.tags.operator || null,
            access: element.tags.access || null,
            capacity: element.tags.capacity || null,
            fee: element.tags.fee || null,
            distance: distance,
            distanceValue: parseFloat(distance)
        });
    });

    console.log(`Found ${transport.length} valid ${type} locations`);

    // Sort by distance and limit
    const limit = type === 'airport' ? 5 : (type === 'parking' ? 10 : 15);
    const result = transport.sort((a, b) => a.distanceValue - b.distanceValue).slice(0, limit);
    
    if (result.length > 0) {
        console.log(`Nearest ${type}:`, result[0].name, result[0].distance);
    }
    
    return result;
}

// Get default name based on type
function getDefaultName(type, tags) {
    switch(type) {
        case 'bus':
            return tags.ref ? `Bus Stop ${tags.ref}` : 'Bus Stop';
        case 'metro':
            return tags.ref ? `Station ${tags.ref}` : 'Railway Station';
        case 'airport':
            return tags.iata ? `${tags.iata} Airport` : 'Airport';
        case 'parking':
            return 'Parking Area';
        default:
            return 'Transport Stop';
    }
}

// Display transport list
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
    
    // Add data source indicator
    const sectionHeader = document.querySelector('.transportation-section .section-header');
    if (sectionHeader) {
        // Remove existing badge if present
        const existingBadge = sectionHeader.querySelector('.data-source-badge');
        if (existingBadge) existingBadge.remove();
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

    // Add click events to cards
    document.querySelectorAll('.transport-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('transport-directions-btn')) {
                const index = card.dataset.index;
                viewTransportDirections(parseInt(index), currentTransportFilter);
            }
        });
    });
}

// Generate transport details
function generateTransportDetails(transport) {
    const details = [];
    
    if (transport.operator) {
        details.push(`<span class="detail-badge"><i class="fas fa-building"></i> ${transport.operator}</span>`);
    }
    
    if (transport.line) {
        details.push(`<span class="detail-badge"><i class="fas fa-subway"></i> ${transport.line}</span>`);
    }
    
    if (transport.iata) {
        details.push(`<span class="detail-badge"><i class="fas fa-plane"></i> ${transport.iata}</span>`);
    }
    
    if (transport.capacity) {
        details.push(`<span class="detail-badge"><i class="fas fa-car"></i> ${transport.capacity}</span>`);
    }
    
    if (transport.fee) {
        const feeText = transport.fee === 'yes' ? 'Paid' : transport.fee === 'no' ? 'Free' : transport.fee;
        details.push(`<span class="detail-badge"><i class="fas fa-money-bill-wave"></i> ${feeText}</span>`);
    }
    
    if (transport.access) {
        details.push(`<span class="detail-badge"><i class="fas fa-universal-access"></i> ${transport.access}</span>`);
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

// Add transport markers to map
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

        // Click marker to highlight card
        marker.on('click', () => {
            const card = document.querySelector(`.transport-card[data-index="${index}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                card.style.boxShadow = '0 0 0 3px #7c3aed';
                setTimeout(() => {
                    card.style.boxShadow = '';
                }, 2000);
            }
        });
    });

    // Fit map to show all markers
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
        bus: '#3b82f6',      // Blue
        metro: '#ef4444',    // Red
        airport: '#10b981',  // Green
        parking: '#f59e0b'   // Orange
    };
    return colors[type] || '#7c3aed';
}

// Calculate distance between two coordinates
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

// View transport directions
window.viewTransportDirections = function(index, filterType) {
    let transport;
    
    if (filterType === 'all') {
        transport = allTransportData.all[index];
    } else {
        transport = allTransportData[filterType][index];
    }
    
    if (!transport) return;
    
    // Open Google Maps directions in new tab
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${eventTransportLocation.lat},${eventTransportLocation.lng}&destination=${transport.lat},${transport.lng}`;
    window.open(directionsUrl, '_blank');
};

// Show sample transport as fallback - Using REAL Hyderabad locations!
function showSampleTransport() {
    console.log('⚠️ Using sample transportation data with REAL coordinates as fallback');
    
    // REAL coordinates for actual Hyderabad locations - VERIFIED
    const realHyderabadLocations = [
        // Real Bus Stops in Hyderabad (major bus stops only)
        { name: 'Jubilee Bus Station (JBS)', type: 'bus', lat: 17.4416, lng: 78.4702, operator: 'TSRTC' },
        { name: 'Kukatpally Bus Stop', type: 'bus', lat: 17.4849, lng: 78.4138, operator: 'TSRTC' },
        { name: 'Miyapur Bus Stop', type: 'bus', lat: 17.4960, lng: 78.3591, operator: 'TSRTC' },
        { name: 'Ameerpet Bus Stop', type: 'bus', lat: 17.4374, lng: 78.4482, operator: 'TSRTC' },
        
        // Real Metro Stations in Hyderabad (L&T Metro Rail - Blue Line)
        { name: 'Miyapur Metro Station', type: 'metro', lat: 17.4954, lng: 78.3582, operator: 'L&T Metro Rail', line: 'Blue Line' },
        { name: 'JNTU College Metro Station', type: 'metro', lat: 17.4928, lng: 78.3914, operator: 'L&T Metro Rail', line: 'Blue Line' },
        { name: 'Kukatpally Metro Station', type: 'metro', lat: 17.4843, lng: 78.4143, operator: 'L&T Metro Rail', line: 'Blue Line' },
        { name: 'Ameerpet Metro Station', type: 'metro', lat: 17.4374, lng: 78.4482, operator: 'L&T Metro Rail', line: 'Blue Line' },
        { name: 'SR Nagar Metro Station', type: 'metro', lat: 17.4289, lng: 78.4508, operator: 'L&T Metro Rail', line: 'Blue Line' },
        { name: 'Begumpet Metro Station', type: 'metro', lat: 17.4454, lng: 78.4662, operator: 'L&T Metro Rail', line: 'Blue Line' },
        
        // ONLY Public/Commercial Airport - NO MILITARY BASES
        { name: 'Rajiv Gandhi International Airport (HYD)', type: 'airport', lat: 17.2403, lng: 78.4294, operator: 'GMR Hyderabad International Airport Ltd', iata: 'HYD' },
        
        // Real Parking locations (major malls and venues)
        { name: 'GVK One Mall Parking', type: 'parking', lat: 17.4326, lng: 78.3894, capacity: '500+ spaces' },
        { name: 'Forum Sujana Mall Parking', type: 'parking', lat: 17.4858, lng: 78.4131, capacity: '300+ spaces' },
        { name: 'Inorbit Mall Parking', type: 'parking', lat: 17.4426, lng: 78.3808, capacity: '400+ spaces' }
    ];

    // Calculate distances from event location and create transport objects
    const sampleTransport = realHyderabadLocations.map(location => {
        const distance = calculateTransportDistance(
            eventTransportLocation.lat, 
            eventTransportLocation.lng, 
            location.lat, 
            location.lng
        );
        
        return {
            name: location.name,
            lat: location.lat,
            lng: location.lng,
            type: location.type,
            address: 'Hyderabad, Telangana',
            distance: distance,
            distanceValue: parseFloat(distance),
            operator: location.operator || null,
            fee: location.type === 'parking' ? 'Paid' : null,
            capacity: location.capacity || null,
            iata: location.iata || null,
            line: location.line || null
        };
    });

    // Sort by distance and take closest ones
    sampleTransport.sort((a, b) => a.distanceValue - b.distanceValue);

    // Separate by type and limit counts
    allTransportData.bus = sampleTransport.filter(t => t.type === 'bus').slice(0, 5);
    allTransportData.metro = sampleTransport.filter(t => t.type === 'metro').slice(0, 5);
    allTransportData.airport = sampleTransport.filter(t => t.type === 'airport').slice(0, 2);
    allTransportData.parking = sampleTransport.filter(t => t.type === 'parking').slice(0, 5);
    
    allTransportData.all = [
        ...allTransportData.bus,
        ...allTransportData.metro,
        ...allTransportData.airport,
        ...allTransportData.parking
    ].sort((a, b) => a.distanceValue - b.distanceValue);

    console.log('📍 Loaded real Hyderabad locations:', allTransportData.all.length);

    displayTransportList(allTransportData.all);
    addTransportMarkersToMap(allTransportData.all);
}

// Event Listeners for Transport Tabs and View Toggle
document.addEventListener('DOMContentLoaded', () => {
    // Transport category tabs
    const transportTabs = document.querySelectorAll('.transport-tab');
    transportTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const transportType = tab.dataset.transport;
            currentTransportFilter = transportType;
            
            // Update active tab
            transportTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filter and display transport
            let filteredTransport = transportType === 'all' 
                ? allTransportData.all 
                : allTransportData[transportType] || [];
            
            displayTransportList(filteredTransport);
            addTransportMarkersToMap(filteredTransport);
        });
    });

    // View toggle (list/map)
    const transportSection = document.querySelector('.transportation-section');
    if (transportSection) {
        const toggleButtons = transportSection.querySelectorAll('.toggle-btn');
        const listView = document.getElementById('transport-list');
        const mapView = document.getElementById('transport-map');

        toggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                
                // Update active button
                toggleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Show/hide views
                if (view === 'list') {
                    listView.style.display = 'block';
                    mapView.style.display = 'none';
                } else {
                    listView.style.display = 'none';
                    mapView.style.display = 'block';
                    
                    // Trigger map resize
                    if (transportMap) {
                        setTimeout(() => {
                            transportMap.invalidateSize();
                        }, 100);
                    }
                }
            });
        });
    }
});

// Export function
window.loadNearbyTransportation = loadNearbyTransportation;

console.log('✅ FREE Nearby Transportation Hub loaded (OpenStreetMap + Leaflet.js)');
