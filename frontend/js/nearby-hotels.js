// Nearby Hotels Functionality
let map;
let service;
let infowindow;
let eventLocation = { lat: 0, lng: 0 };
let hotelsData = [];

// Initialize map (called by Google Maps API callback)
window.initMap = function() {
    console.log('✅ Google Maps loaded successfully');
};

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

    // Check if Google Maps is available
    if (typeof google === 'undefined' || !google.maps) {
        console.warn('Google Maps API not loaded');
        showFallbackHotels();
        return;
    }

    // Initialize map
    initializeMap();
    
    // Search for nearby hotels using Google Places API
    searchNearbyHotels();
}

// Initialize Google Map
function initializeMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    map = new google.maps.Map(mapContainer, {
        center: eventLocation,
        zoom: 14,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    // Add event venue marker
    new google.maps.Marker({
        position: eventLocation,
        map: map,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="%237c3aed">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40)
        },
        title: 'Event Venue',
        animation: google.maps.Animation.DROP
    });

    infowindow = new google.maps.InfoWindow();
}

// Search for nearby hotels using Google Places API
function searchNearbyHotels() {
    const request = {
        location: eventLocation,
        radius: '5000', // 5km radius
        type: ['lodging'],
        keyword: 'hotel'
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, handleHotelsResponse);
}

// Handle hotels search response
function handleHotelsResponse(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
        hotelsData = results.slice(0, 12); // Limit to 12 hotels
        displayHotelsList(hotelsData);
        addHotelMarkersToMap(hotelsData);
    } else {
        showNoHotelsMessage();
    }
}

// Display hotels in list view
function displayHotelsList(hotels) {
    const hotelsGrid = document.getElementById('hotels-grid');
    if (!hotelsGrid) return;

    hotelsGrid.innerHTML = hotels.map((hotel, index) => {
        const photoUrl = hotel.photos && hotel.photos[0] 
            ? hotel.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 })
            : null;
        
        const rating = hotel.rating || 'N/A';
        const address = hotel.vicinity || 'Address not available';
        const distance = calculateDistance(
            eventLocation.lat, 
            eventLocation.lng,
            hotel.geometry.location.lat(),
            hotel.geometry.location.lng()
        );

        // Determine price level icons
        const priceLevel = hotel.price_level || 2;
        const priceDisplay = '₹'.repeat(priceLevel) + '<span style="opacity:0.3">' + '₹'.repeat(4 - priceLevel) + '</span>';

        return `
            <div class="hotel-card" data-index="${index}">
                ${photoUrl 
                    ? `<img src="${photoUrl}" alt="${hotel.name}" class="hotel-image">` 
                    : `<div class="hotel-image placeholder"><i class="fas fa-hotel"></i></div>`
                }
                <div class="hotel-info">
                    <div class="hotel-header">
                        <h3 class="hotel-name">${hotel.name}</h3>
                        ${rating !== 'N/A' ? `
                            <div class="hotel-rating">
                                <i class="fas fa-star"></i>
                                ${rating}
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="hotel-address">
                        <i class="fas fa-map-marker-alt"></i>
                        ${address}
                    </div>
                    
                    <div class="hotel-distance">
                        <i class="fas fa-walking"></i> ${distance} from venue
                    </div>

                    <div class="hotel-amenities">
                        ${hotel.types.includes('restaurant') ? '<span class="amenity-badge"><i class="fas fa-utensils"></i> Restaurant</span>' : ''}
                        ${hotel.types.includes('parking') ? '<span class="amenity-badge"><i class="fas fa-parking"></i> Parking</span>' : ''}
                        <span class="amenity-badge"><i class="fas fa-wifi"></i> WiFi</span>
                    </div>

                    <div class="hotel-footer">
                        <div class="hotel-price">
                            <span style="font-size:0.8rem;">Price range</span>
                            <span class="hotel-price-value">${priceDisplay}</span>
                        </div>
                        <button class="hotel-book-btn" onclick="viewHotelDetails(${index})">
                            View Details
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
    hotels.forEach((hotel, index) => {
        const marker = new google.maps.Marker({
            position: hotel.geometry.location,
            map: map,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="%23ef4444">
                        <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V7H1v13h2v-2h18v2h2v-9c0-2.21-1.79-4-4-4z"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 32)
            },
            title: hotel.name,
            animation: google.maps.Animation.DROP
        });

        // Add click listener to show info window
        marker.addListener('click', () => {
            const content = `
                <div class="map-info-window">
                    <h3>${hotel.name}</h3>
                    ${hotel.rating ? `
                        <div class="info-rating">
                            <i class="fas fa-star"></i>
                            ${hotel.rating} (${hotel.user_ratings_total || 0} reviews)
                        </div>
                    ` : ''}
                    <p><i class="fas fa-map-marker-alt"></i> ${hotel.vicinity}</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + hotel.vicinity)}" target="_blank">
                        Get Directions <i class="fas fa-external-link-alt"></i>
                    </a>
                </div>
            `;
            infowindow.setContent(content);
            infowindow.open(map, marker);
            map.panTo(hotel.geometry.location);
        });
    });
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
    const searchQuery = encodeURIComponent(hotel.name + ' ' + hotel.vicinity);
    
    // Open Google Maps in new tab
    window.open(`https://www.google.com/maps/search/?api=1&query=${searchQuery}&query_place_id=${hotel.place_id}`, '_blank');
};

// Show no hotels message
function showNoHotelsMessage() {
    const hotelsGrid = document.getElementById('hotels-grid');
    if (!hotelsGrid) return;

    hotelsGrid.innerHTML = `
        <div class="no-hotels">
            <i class="fas fa-hotel"></i>
            <h3>No Hotels Found</h3>
            <p>We couldn't find hotels near this event venue. Try searching on Google Maps.</p>
        </div>
    `;
}

// Fallback hotels display (when Google Maps API is not available)
function showFallbackHotels() {
    const hotelsGrid = document.getElementById('hotels-grid');
    if (!hotelsGrid) return;

    hotelsGrid.innerHTML = `
        <div class="no-hotels">
            <i class="fas fa-exclamation-circle"></i>
            <h3>Hotels Map Unavailable</h3>
            <p>Google Maps API is not configured. Please add your API key to enable this feature.</p>
            <p style="margin-top:16px;">
                <a href="https://developers.google.com/maps/gmp-get-started" target="_blank" style="color:#7c3aed;text-decoration:underline;">
                    Get Google Maps API Key
                </a>
            </p>
        </div>
    `;
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
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(eventLocation);
                }
            }
        });
    });
});

// Export function for use in event-template.js
window.loadNearbyHotels = loadNearbyHotels;
