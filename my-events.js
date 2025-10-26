// My Events Page - Event Listing and Management

let editMap = null;
let editMarker = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        alert('Please login to view your events');
        window.location.href = 'login.html';
        return;
    }

    // Display organizer name in header
    const organizerNameEl = document.getElementById('organizerName');
    if (organizerNameEl && currentUser.username) {
        organizerNameEl.textContent = currentUser.username;
    }

    // Load user's events
    displayMyEvents();

    // Logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
});

// Display user's created events
async function displayMyEvents() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const myEventsGrid = document.getElementById('myEvents');
    const emptyState = document.getElementById('emptyState');
    const eventsCount = document.getElementById('myEventsCount');

    try {
        const response = await fetch('http://localhost:5000/events');
        const responseData = await response.json();
        // Handle both old format (array) and new format (object with events array)
        const events = Array.isArray(responseData) ? responseData : responseData.events;

        // Filter events created by current user
        const myEvents = events.filter(event => event.organizer === currentUser.username);

        if (myEvents.length === 0) {
            myEventsGrid.innerHTML = '';
            emptyState.classList.remove('hidden');
            eventsCount.textContent = '0';
            return;
        }

        emptyState.classList.add('hidden');
        eventsCount.textContent = myEvents.length;

        myEventsGrid.innerHTML = myEvents.map(event => createManagementEventCard(event)).join('');
    } catch (error) {
        console.error('Error loading events:', error);
        myEventsGrid.innerHTML = `
            <div class="error-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <h3>Failed to Load Events</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

// Create event card for management
function createManagementEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });

    const statusClass = {
        'upcoming': 'status-upcoming',
        'ongoing': 'status-ongoing',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    }[event.status] || 'status-upcoming';

    const registeredCount = event.registeredUsers?.length || 0;
    const capacity = event.capacity || 0;
    const availableSlots = capacity - registeredCount;

    return `
        <div class="management-event-card" data-event-id="${event._id}">
            <div class="event-header">
                <div class="event-category">${event.category}</div>
                <div class="event-status ${statusClass}">${event.status}</div>
            </div>
            
            <h3 class="event-title">${event.name}</h3>
            
            <div class="event-details">
                <div class="detail-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${formattedDate}</span>
                </div>
                
                <div class="detail-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>${event.time}</span>
                </div>
                
                <div class="detail-item">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    <span>${event.venue}</span>
                </div>
            </div>

            <div class="event-stats">
                <div class="stat-item">
                    <div class="stat-value">${registeredCount}</div>
                    <div class="stat-label">Registered</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${availableSlots}</div>
                    <div class="stat-label">Available</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${capacity}</div>
                    <div class="stat-label">Capacity</div>
                </div>
            </div>

            <div class="card-actions">
                <button class="action-btn edit-btn" onclick="handleEditEvent('${event._id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                </button>
                <button class="action-btn delete-btn" onclick="deleteEvent('${event._id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Delete
                </button>
            </div>
        </div>
    `;
}

// Handle edit event
async function handleEditEvent(eventId) {
    console.log('Edit button clicked for event ID:', eventId);
    
    try {
        console.log('Fetching event details...');
        const response = await fetch(`http://localhost:5000/events/${eventId}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const event = await response.json();
        console.log('Event data received:', event);

        // Populate edit form
        document.getElementById('edit-event-id').value = event._id;
        document.getElementById('edit-event-name').value = event.name;
        document.getElementById('edit-event-category').value = event.category;
        document.getElementById('edit-event-date').value = event.date.split('T')[0];
        document.getElementById('edit-event-time').value = event.time;
        document.getElementById('edit-event-venue').value = event.venue;
        document.getElementById('edit-event-description').value = event.description;
        document.getElementById('edit-event-capacity').value = event.capacity;
        document.getElementById('edit-event-status').value = event.status;
        
        // Check if location exists
        if (event.location && event.location.lat && event.location.lng) {
            document.getElementById('edit-event-lat').value = event.location.lat;
            document.getElementById('edit-event-lng').value = event.location.lng;
            // Initialize edit map
            initEditMap(event.location.lat, event.location.lng);
        } else {
            console.warn('Location data missing for event');
            // Use default location
            document.getElementById('edit-event-lat').value = 17.385;
            document.getElementById('edit-event-lng').value = 78.4867;
            initEditMap(17.385, 78.4867);
        }

        // Handle ticket pricing
        const ticketToggle = document.getElementById('edit-ticket-toggle');
        const ticketPricing = document.getElementById('edit-ticket-pricing');
        
        if (event.isPaid) {
            ticketToggle.checked = true;
            ticketPricing.style.display = 'block';
            document.getElementById('edit-ticket-price').value = event.ticketPrice || 0;
            document.getElementById('edit-available-tickets').value = event.availableTickets || 0;
        } else {
            ticketToggle.checked = false;
            ticketPricing.style.display = 'none';
        }

        // Show modal
        console.log('Opening edit modal...');
        document.getElementById('editModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading event:', error);
        alert(`Failed to load event details: ${error.message}`);
    }
}

// Initialize edit map
function initEditMap(lat, lng) {
    const mapContainer = document.getElementById('edit-map');
    
    // Clear existing map if any
    if (editMap) {
        editMap.remove();
    }

    // Create new map
    editMap = L.map('edit-map').setView([lat, lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(editMap);

    // Add marker
    editMarker = L.marker([lat, lng], { draggable: true }).addTo(editMap);

    // Update coordinates on marker drag
    editMarker.on('dragend', function(e) {
        const position = editMarker.getLatLng();
        document.getElementById('edit-event-lat').value = position.lat;
        document.getElementById('edit-event-lng').value = position.lng;
    });

    // Update marker on map click
    editMap.on('click', function(e) {
        const { lat, lng } = e.latlng;
        editMarker.setLatLng([lat, lng]);
        document.getElementById('edit-event-lat').value = lat;
        document.getElementById('edit-event-lng').value = lng;
    });

    // Fix map rendering issue
    setTimeout(() => {
        editMap.invalidateSize();
    }, 100);
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.add('hidden');
    if (editMap) {
        editMap.remove();
        editMap = null;
    }
}

// Handle category change in edit form
document.getElementById('edit-event-category')?.addEventListener('change', function() {
    const customCategoryGroup = document.getElementById('edit-custom-category-group');
    const customCategoryInput = document.getElementById('edit-custom-category');
    
    if (this.value === 'Other') {
        customCategoryGroup.style.display = 'block';
        customCategoryInput.required = true;
    } else {
        customCategoryGroup.style.display = 'none';
        customCategoryInput.required = false;
        customCategoryInput.value = '';
    }
});

// Handle ticket toggle in edit form
document.getElementById('edit-ticket-toggle')?.addEventListener('change', function() {
    const ticketPricing = document.getElementById('edit-ticket-pricing');
    const ticketPrice = document.getElementById('edit-ticket-price');
    const availableTickets = document.getElementById('edit-available-tickets');
    
    if (this.checked) {
        ticketPricing.style.display = 'block';
        ticketPrice.required = true;
        availableTickets.required = true;
    } else {
        ticketPricing.style.display = 'none';
        ticketPrice.required = false;
        availableTickets.required = false;
    }
});

// Handle edit form submission
document.getElementById('editEventForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const eventId = document.getElementById('edit-event-id').value;
    const category = document.getElementById('edit-event-category').value;
    const customCategory = document.getElementById('edit-custom-category').value;
    const isPaid = document.getElementById('edit-ticket-toggle').checked;

    const eventData = {
        name: document.getElementById('edit-event-name').value,
        category: category === 'Other' ? customCategory : category,
        date: document.getElementById('edit-event-date').value,
        time: document.getElementById('edit-event-time').value,
        venue: document.getElementById('edit-event-venue').value,
        lat: parseFloat(document.getElementById('edit-event-lat').value),
        lng: parseFloat(document.getElementById('edit-event-lng').value),
        description: document.getElementById('edit-event-description').value,
        capacity: parseInt(document.getElementById('edit-event-capacity').value),
        status: document.getElementById('edit-event-status').value,
        isPaid: isPaid,
        organizer: localStorage.getItem('username') // Add organizer
    };

    if (isPaid) {
        eventData.ticketPrice = parseFloat(document.getElementById('edit-ticket-price').value);
        eventData.availableTickets = parseInt(document.getElementById('edit-available-tickets').value);
    }

    console.log('Sending update with data:', eventData); // Debug log

    try {
        const response = await fetch(`http://localhost:5000/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventData)
        });

        const result = await response.json();
        console.log('Server response:', result); // Debug log

        if (response.ok) {
            alert('✅ Event updated successfully!');
            closeEditModal();
            displayMyEvents(); // Refresh the list
        } else {
            alert(`❌ Failed to update event: ${result.error || result.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error updating event:', error);
        alert('❌ Failed to update event. Please check your connection and try again.');
    }
});

// Delete event
async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/events/${eventId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Event deleted successfully!');
            displayMyEvents(); // Refresh the list
        } else {
            const error = await response.json();
            alert(`Failed to delete event: ${error.message}`);
        }
    } catch (error) {
        console.error('Error deleting event:', error);
        alert('Failed to delete event. Please try again.');
    }
}
