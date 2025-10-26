// 🔄 Auto-update event status based on date
async function autoUpdateEventStatuses() {
    console.log("🔄 Running auto-update for event statuses...");
    
    const API_URL = "http://localhost:5000/events";
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) return false;
        
        const data = await response.json();
        const events = data.events || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let updatedCount = 0;
        
        for (const event of events) {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            
            // Auto-update to 'Completed' if date has passed and status is 'Active'
            if (eventDate < today && event.status === 'Active') {
                try {
                    const updateResponse = await fetch(`${API_URL}/${event._id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...event, status: 'Completed' })
                    });
                    
                    if (updateResponse.ok) {
                        updatedCount++;
                        console.log(`✅ Updated "${event.name}" to Completed`);
                    }
                } catch (error) {
                    console.error(`❌ Failed to update event ${event.name}:`, error);
                }
            }
        }
        
        if (updatedCount > 0) {
            console.log(`✅ Auto-updated ${updatedCount} event(s) to Completed status`);
            return true;
        }
        return false;
    } catch (error) {
        console.error(" Auto-update failed:", error);
        return false;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    console.log("📅 EventPulse Loaded!");
    
    // Run auto-update on page load
    await autoUpdateEventStatuses();

    try {
        // Get logged-in user info
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!loggedInUser) {
            alert("Please log in first.");
            window.location.href = "login.html";
            return;
        }

        // Initialize Map
        const map = L.map("map").setView([17.5403, 78.3844], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
        console.log("🗺️ Map initialized successfully!");

        // Fetch events from backend
        const API_URL = "http://localhost:5000/events";
        const eventResponse = await fetch(API_URL);
        if (!eventResponse.ok) {
            throw new Error("❌ Failed to load event data from backend");
        }
        const responseData = await eventResponse.json();
        // Handle both old format (array) and new format (object with events array)
        const allEventsFromDB = Array.isArray(responseData) ? responseData : responseData.events;
        console.log("📡 Events Loaded from DB:", allEventsFromDB);

        // Load Pinned Events and Favorites from database
        let pinnedEvents = [];
        let favoriteEvents = [];
        
        if (loggedInUser && loggedInUser.username) {
          try {
            const pinnedResponse = await fetch(`http://localhost:5000/users/${loggedInUser.username}/pinned`);
            if (pinnedResponse.ok) {
              pinnedEvents = await pinnedResponse.json();
            }
            
            const favoritesResponse = await fetch(`http://localhost:5000/users/${loggedInUser.username}/favorites`);
            if (favoritesResponse.ok) {
              favoriteEvents = await favoritesResponse.json();
            }
          } catch (error) {
            console.error("Error loading user preferences:", error);
          }
        }
        
        console.log("📍 Pinned Events (Database):", pinnedEvents);
        console.log("❤️ Favorite Events (Database):", favoriteEvents);

        // Calculate upcoming events (events with future dates)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingEvents = allEventsFromDB.filter(e => {
            const eventDate = new Date(e.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
        });

        // Update stats on the page
        const upcomingCountElement = document.getElementById('upcoming-count');
        const favoritesCountElement = document.getElementById('favorites-count');
        
        if (upcomingCountElement) {
            upcomingCountElement.textContent = upcomingEvents.length;
        }
        if (favoritesCountElement) {
            favoritesCountElement.textContent = favoriteEvents.length;
        }

        console.log(`📊 Stats Updated: ${upcomingEvents.length} upcoming, ${favoriteEvents.length} favorites`);

        function addMarker(lat, lng, name, eventId, color) {
            if (lat === undefined || lng === undefined) {
                console.warn(`⚠️ Skipping event "${name}" because lat/lng is missing.`);
                return null;
            }

            let markerIcon = L.icon({
                iconUrl: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });

            return L.marker([lat, lng], { icon: markerIcon })
                .addTo(map)
                .bindPopup(`<b>${name}</b><br><a href="event-template.html?event=${encodeURIComponent(name)}" target="_blank">View Event</a>`);
        }

        // Store all events for search & UI updates
        let allEvents = [];

        // Add Live Event Markers (events happening today)
        const liveEvents = allEventsFromDB.filter(e => {
            const eventDate = new Date(e.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime();
        });

        liveEvents.forEach(event => {
            let marker = addMarker(event.lat, event.lng, event.name, event._id, "blue");
            if (marker) {
                allEvents.push({ ...event, type: "live", marker });
            }
        });

        // Add ALL Upcoming Event Markers (future events with coordinates)
        const upcomingEventsWithLocation = allEventsFromDB.filter(e => {
            const eventDate = new Date(e.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() > today.getTime() && e.lat && e.lng;
        });

        upcomingEventsWithLocation.forEach(event => {
            // Check if not already added as live event
            if (!allEvents.find(e => e._id === event._id)) {
                let marker = addMarker(event.lat, event.lng, event.name, event._id, "green");
                if (marker) {
                    allEvents.push({ ...event, type: "upcoming", marker });
                }
            }
        });

        // Add Pinned Event Markers from `localStorage`
        pinnedEvents.forEach(event => {
            // Check if not already added
            if (!allEvents.find(e => e._id === event._id)) {
                let marker = addMarker(event.lat, event.lng, event.name, event._id, "red");
                if (marker) {
                    allEvents.push({ ...event, type: "pinned", marker });
                }
            }
        });

        // Create Event Card Function
        function createEventCard(event) {
            const isFavorite = favoriteEvents.some(e => e._id === event._id);
            const isPinned = pinnedEvents.some(e => e._id === event._id);
            
            // Status badge configuration
            const statusConfig = {
                'Draft': { color: '#6b7280', icon: '', text: 'Draft' },
                'Active': { color: '#10b981', icon: '', text: 'Active' },
                'Closed': { color: '#ef4444', icon: '', text: 'Closed' },
                'Completed': { color: '#3b82f6', icon: '', text: 'Completed' },
                'Cancelled': { color: '#f59e0b', icon: '', text: 'Cancelled' }
            };
            
            const status = event.status || 'Active';
            const statusInfo = statusConfig[status] || statusConfig['Active'];
            
            // Determine if registration is allowed
            const canRegister = status === 'Active';
            const registrationDisabledReason = 
                status === 'Draft' ? 'Event is in draft mode' :
                status === 'Closed' ? 'Registration is closed' :
                status === 'Completed' ? 'Event has ended' :
                status === 'Cancelled' ? 'Event has been cancelled' : '';
            
            return `
                <div class="event-card" onclick="window.location.href='event-template.html?event=${encodeURIComponent(event.name)}'">
                    <div class="event-card-header">
                        <div class="event-status-badge" style="background: ${statusInfo.color}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; position: absolute; top: 15px; right: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                            <span>${statusInfo.icon}</span>
                            <span>${statusInfo.text}</span>
                        </div>
                    </div>
                    <div class="event-card-body">
                        <h3 class="event-card-title">${event.name}</h3>
                        <div class="event-card-meta">
                            <div class="meta-row">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span>${new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div class="meta-row">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span>${event.time || 'TBA'}</span>
                            </div>
                            <div class="meta-row">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                                <span>${event.venue || 'Location TBA'}</span>
                            </div>
                        </div>
                        <p class="event-card-description">${event.description || 'No description available.'}</p>
                        <div class="event-card-footer">
                            <div class="event-actions">
                                <button class="action-icon-btn" onclick="event.stopPropagation(); toggleFavorite('${event._id}')" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isFavorite ? 'red' : 'none'}" stroke="currentColor" stroke-width="2">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>
                                <button class="action-icon-btn" onclick="event.stopPropagation(); togglePin('${event._id}')" title="${isPinned ? 'Unpin event' : 'Pin event'}">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${isPinned ? '#667eea' : 'none'}" stroke="currentColor" stroke-width="2">
                                        <path d="M12 17v5m-3-2.5l3-3 3 3M12 2v5m0 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path>
                                        <path d="M9 8H4v3h5m6-3h5v3h-5"></path>
                                    </svg>
                                </button>
                            </div>
                            <button class="view-details-btn" onclick="event.stopPropagation(); window.location.href='event-template.html?event=${encodeURIComponent(event.name)}'">
                                View Details
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // Update Pinned Events Grid
        const pinnedGrid = document.getElementById("pinned-events");
        const pinnedEmpty = document.getElementById("pinned-empty");
        const pinnedCountBadge = document.getElementById("pinned-count");

        function updatePinnedList() {
            console.log("Updating UI for pinned events:", pinnedEvents);
            
            if (pinnedCountBadge) {
                pinnedCountBadge.textContent = pinnedEvents.length;
            }
            
            if (pinnedEvents.length === 0) {
                pinnedGrid.style.display = "none";
                pinnedEmpty.style.display = "block";
            } else {
                pinnedGrid.style.display = "grid";
                pinnedEmpty.style.display = "none";
                pinnedGrid.innerHTML = pinnedEvents.map(event => createEventCard(event)).join("");
            }
        }

        // Update Upcoming Events Grid
        const upcomingGrid = document.getElementById("upcoming-events");
        const upcomingEmpty = document.getElementById("upcoming-empty");
        const upcomingBadge = document.getElementById("upcoming-badge");

        function updateUpcomingList() {
            console.log("Updating UI for upcoming events:", upcomingEvents);
            
            if (upcomingBadge) {
                upcomingBadge.textContent = upcomingEvents.length;
            }
            
            if (upcomingEvents.length === 0) {
                upcomingGrid.style.display = "none";
                upcomingEmpty.style.display = "block";
            } else {
                upcomingGrid.style.display = "grid";
                upcomingEmpty.style.display = "none";
                upcomingGrid.innerHTML = upcomingEvents.slice(0, 6).map(event => createEventCard(event)).join("");
            }
        }

        updatePinnedList();
        updateUpcomingList();

        // Toggle Pin Function
        window.togglePin = function (eventId) {
            const index = pinnedEvents.findIndex(event => event._id === eventId);

            if (index === -1) {
                let eventToPin = allEventsFromDB.find(event => event._id === eventId);
                if (eventToPin) {
                    pinnedEvents.push(eventToPin);
                    showToast(`${eventToPin.name} pinned!`);
                }
            } else {
                const unpinnedEvent = pinnedEvents[index];
                pinnedEvents.splice(index, 1);
                showToast(`${unpinnedEvent.name} unpinned!`);
            }

            localStorage.setItem("pinnedEvents", JSON.stringify(pinnedEvents));
            updatePinnedList();
            updateUpcomingList();
        };

        // Toggle Favorite Function
        window.toggleFavorite = function (eventId) {
            const index = favoriteEvents.findIndex(event => event._id === eventId);

            if (index === -1) {
                let eventToFavorite = allEventsFromDB.find(event => event._id === eventId);
                if (eventToFavorite) {
                    favoriteEvents.push(eventToFavorite);
                    showToast(` ${eventToFavorite.name} added to favorites!`);
                }
            } else {
                const unfavoritedEvent = favoriteEvents[index];
                favoriteEvents.splice(index, 1);
                showToast(`${unfavoritedEvent.name} removed from favorites!`);
            }

            localStorage.setItem("favoriteEvents", JSON.stringify(favoriteEvents));
            
            // Update favorites count
            if (favoritesCountElement) {
                favoritesCountElement.textContent = favoriteEvents.length;
            }
            
            // Refresh the card displays
            updatePinnedList();
            updateUpcomingList();
        };

        // Search Functionality
        const searchBar = document.querySelector(".search-bar");

        if (searchBar) {
            searchBar.addEventListener("input", (e) => {
                const query = e.target.value.toLowerCase();

                allEvents.forEach(event => {
                    if (event.name.toLowerCase().includes(query)) {
                        event.marker?.addTo(map); // Show marker if it matches search
                    } else {
                        event.marker && map.removeLayer(event.marker); // Hide marker if it doesn't match
                    }
                });

                // Filter event list in UI
                const eventItems = document.querySelectorAll(".event-item");
                eventItems.forEach(item => {
                    const eventName = item.textContent.toLowerCase();
                    item.style.display = eventName.includes(query) ? "block" : "none";
                });
            });
        }

        // Simple toast notification
        function showToast(message) {
            const toast = document.createElement('div');
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                right: 30px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                z-index: 10000;
                animation: slideInUp 0.3s ease-out;
                font-weight: 600;
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.animation = 'slideOutDown 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }

    } catch (error) {
        console.error(" Error loading dashboard:", error);
    }
});

// Populate Event List Function
function populateEventList(events, listId) {
    const eventList = document.getElementById(listId);
    if (eventList) {
        eventList.innerHTML = events.map(event => `
            <li class="event-item">
                <a href="event-template.html?event=${encodeURIComponent(event.name)}">${event.name}</a>
            </li>
        `).join("");
    }
}
