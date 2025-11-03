// FREE Nearby Hotels with OpenStreetMap + Leaflet.js (No API Key Required!)
let map;
let eventLocation = { lat: 0, lng: 0 };
let hotelsData = [];
let markers = [];

// Main function to load nearby hotels
async function loadNearbyHotels(lat, lng, eventName) {
    if (!lat || !lng) {
        console.log('No coordinates provided for event');
        return;
    }

    eventLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
    
    // Show the hotels section
    const hotelsSection = document.getElementById('nearby-hotels-section');
    if (hotelsSection) {
        hotelsSection.style.display = 'block';
    }

    // Initialize map with OpenStreetMap
    initializeMap();
    
    // Search for nearby hotels using Overpass API (Free!)
    await searchNearbyHotels();
}

// Initialize Leaflet Map with OpenStreetMap
function initializeMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Create map centered on event location
    map = L.map('map-container').setView([eventLocation.lat, eventLocation.lng], 14);

    // Add OpenStreetMap tiles (Free!)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Add event venue marker (Purple)
    const eventIcon = L.divIcon({
        className: 'event-marker',
        html: `<div style="background: #7c3aed; width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <i class="fas fa-calendar-alt" style="color: white; font-size: 18px; transform: rotate(45deg);"></i>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });

    L.marker([eventLocation.lat, eventLocation.lng], { icon: eventIcon })
        .addTo(map)
        .bindPopup(`<b>Event Venue</b><br>Your event is here!`)
        .openPopup();
}

// Search for nearby hotels using FREE Overpass API
async function searchNearbyHotels() {
    const hotelsGrid = document.getElementById('hotels-grid');
    if (!hotelsGrid) return;

    // Show loading
    hotelsGrid.innerHTML = `
        <div class="loading-hotels">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Searching for nearby hotels...</p>
        </div>
    `;

    try {
        // Overpass API query for hotels within 5km
        const radius = 5000; // 5km in meters
        const query = `
            [out:json][timeout:25];
            (
                node["tourism"="hotel"](around:${radius},${eventLocation.lat},${eventLocation.lng});
                way["tourism"="hotel"](around:${radius},${eventLocation.lat},${eventLocation.lng});
                node["tourism"="guest_house"](around:${radius},${eventLocation.lat},${eventLocation.lng});
            );
            out body;
            >;
            out skel qt;
        `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });

        if (!response.ok) {
            throw new Error('Failed to fetch hotels');
        }

        const data = await response.json();
        
        if (data.elements && data.elements.length > 0) {
            // Process and filter hotels
            hotelsData = processHotelData(data.elements);
            
            if (hotelsData.length > 0) {
                displayHotelsList(hotelsData);
                addHotelMarkersToMap(hotelsData);
            } else {
                showSampleHotels(); // Fallback to sample data
            }
        } else {
            showSampleHotels(); // Fallback to sample data
        }
    } catch (error) {
        console.error('Error fetching hotels:', error);
        showSampleHotels(); // Fallback to sample data
    }
}

// Process hotel data from Overpass API
function processHotelData(elements) {
    const hotels = [];
    const seen = new Set();

    elements.forEach(element => {
        if (element.tags && element.tags.name && (element.lat || element.center)) {
            const lat = element.lat || (element.center && element.center.lat);
            const lon = element.lon || (element.center && element.center.lon);
            
            if (!lat || !lon) return;

            const name = element.tags.name;
            
            // Avoid duplicates
            if (seen.has(name)) return;
            seen.add(name);

            const distance = calculateDistance(
                eventLocation.lat,
                eventLocation.lng,
                lat,
                lon
            );

            hotels.push({
                name: name,
                lat: lat,
                lng: lon,
                address: element.tags['addr:street'] || element.tags['addr:city'] || 'Address not available',
                phone: element.tags.phone || element.tags['contact:phone'] || null,
                website: element.tags.website || element.tags['contact:website'] || null,
                stars: element.tags.stars || null,
                distance: distance,
                distanceValue: parseFloat(distance)
            });
        }
    });

    // Sort by distance and limit to 12 hotels
    return hotels.sort((a, b) => a.distanceValue - b.distanceValue).slice(0, 12);
}

// Display hotels in list view
function displayHotelsList(hotels) {
    const hotelsGrid = document.getElementById('hotels-grid');
    if (!hotelsGrid) return;

    hotelsGrid.innerHTML = hotels.map((hotel, index) => {
        const stars = hotel.stars ? '⭐'.repeat(parseInt(hotel.stars)) : '';
        
        return `
            <div class="hotel-card" data-index="${index}">
                <div class="hotel-image placeholder">
                    <i class="fas fa-hotel"></i>
                </div>
                <div class="hotel-info">
                    <div class="hotel-header">
                        <h3 class="hotel-name">${hotel.name}</h3>
                        ${stars ? `<div class="hotel-rating">${stars}</div>` : ''}
                    </div>
                    
                    <div class="hotel-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${hotel.address}
                    </div>
                    
                    <div class="hotel-distance">
                        <i class="fas fa-walking"></i> ${hotel.distance} from venue
                    </div>

                    ${hotel.phone ? `
                        <div class="hotel-amenities">
                            <span class="amenity-badge">
                                <i class="fas fa-phone"></i> ${hotel.phone}
                            </span>
                        </div>
                    ` : ''}

                    <div class="hotel-footer">
                        <div class="hotel-price">
                            <span style="font-size:0.8rem;">Open in Maps</span>
                        </div>
                        <button class="hotel-book-btn" onclick="viewHotelDetails(${index})">
                            Get Directions
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Add click events to cards
    document.querySelectorAll('.hotel-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.classList.contains('hotel-book-btn')) {
                const index = card.dataset.index;
                viewHotelDetails(parseInt(index));
            }
        });
    });
}

// Add hotel markers to map
function addHotelMarkersToMap(hotels) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    hotels.forEach((hotel, index) => {
        const hotelIcon = L.divIcon({
            className: 'hotel-marker',
            html: `<div style="background: #ef4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
                    <i class="fas fa-hotel" style="color: white; font-size: 14px;"></i>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });

        const marker = L.marker([hotel.lat, hotel.lng], { icon: hotelIcon })
            .addTo(map)
            .bindPopup(`
                <div class="map-info-window">
                    <h3>${hotel.name}</h3>
                    ${hotel.stars ? `<div class="info-rating">${'⭐'.repeat(parseInt(hotel.stars))}</div>` : ''}
                    <p><i class="fas fa-map-marker-alt"></i> ${hotel.address}</p>
                    <p><i class="fas fa-walking"></i> ${hotel.distance} away</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + hotel.address)}" target="_blank">
                        Get Directions <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `);

        markers.push(marker);

        // Click marker to highlight card
        marker.on('click', () => {
            // Scroll to card
            const card = document.querySelector(`.hotel-card[data-index="${index}"]`);
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
    if (hotels.length > 0) {
        const bounds = L.latLngBounds(
            hotels.map(h => [h.lat, h.lng]).concat([[eventLocation.lat, eventLocation.lng]])
        );
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Calculate distance between two coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
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

// View hotel details
window.viewHotelDetails = function(index) {
    if (!hotelsData[index]) return;
    
    const hotel = hotelsData[index];
    const searchQuery = encodeURIComponent(hotel.name + ' ' + hotel.address);
    
    // Open Google Maps in new tab
    window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}`, '_blank');
};

// Show sample hotels as fallback
function showSampleHotels() {
    console.log('Using sample hotel data as fallback');
    
    // Generate sample hotels around the event location
    const sampleHotels = [
        { name: 'Hotel Taj Krishna', offset: [0.01, 0.01], stars: 5 },
        { name: 'Novotel Hyderabad', offset: [-0.01, 0.015], stars: 4 },
        { name: 'Radisson Blu', offset: [0.015, -0.01], stars: 4 },
        { name: 'ITC Kakatiya', offset: [-0.015, -0.015], stars: 5 },
        { name: 'The Park Hotel', offset: [0.02, 0], stars: 4 },
        { name: 'Lemon Tree Hotel', offset: [0, 0.02], stars: 3 }
    ].map((hotel, index) => {
        const lat = eventLocation.lat + hotel.offset[0];
        const lng = eventLocation.lng + hotel.offset[1];
        const distance = calculateDistance(eventLocation.lat, eventLocation.lng, lat, lng);
        
        return {
            name: hotel.name,
            lat: lat,
            lng: lng,
            address: 'Near event venue',
            stars: hotel.stars,
            distance: distance,
            distanceValue: parseFloat(distance)
        };
    });

    hotelsData = sampleHotels;
    displayHotelsList(sampleHotels);
    addHotelMarkersToMap(sampleHotels);
}

// Toggle between list and map view
document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const listView = document.getElementById('hotels-list');
    const mapView = document.getElementById('hotels-map');

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
                
                // Trigger map resize to ensure proper rendering
                if (map) {
                    setTimeout(() => {
                        map.invalidateSize();
                    }, 100);
                }
            }
        });
    });
});

// Export function for use in event-template.js
window.loadNearbyHotels = loadNearbyHotels;

console.log('✅ FREE Nearby Hotels feature loaded (OpenStreetMap + Leaflet.js)');
