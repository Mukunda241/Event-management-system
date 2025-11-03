document.addEventListener("DOMContentLoaded", async function () {
    console.log("⭐ Favorites Page Loaded!");

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    let allFavorites = [];
    
    // Load favorites from database
    if (loggedInUser && loggedInUser.username) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/users/${loggedInUser.username}/favorites`);
            if (response.ok) {
                allFavorites = await response.json();
            }
        } catch (error) {
            console.error("Error loading favorites:", error);
        }
    }
    
    let currentFilter = 'all';

    // ✅ Create Event Card Function
    async function createEventCard(event) {
        let isPinned = false;
        
        if (loggedInUser && loggedInUser.username) {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/users/${loggedInUser.username}/pinned`);
                if (response.ok) {
                    const pinnedEvents = await response.json();
                    isPinned = pinnedEvents.some(e => e._id === event._id);
                }
            } catch (error) {
                console.error("Error checking pin status:", error);
            }
        }
        
        return `
            <div class="event-card" onclick="window.location.href='event-template.html?event=${encodeURIComponent(event.name)}'">
                <div class="event-card-header"></div>
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
                            <button class="action-icon-btn" onclick="event.stopPropagation(); removeFromFavorites('${event._id}')" title="Remove from favorites">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red" stroke="currentColor" stroke-width="2">
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

    // ✅ Filter Events
    function filterEvents() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (currentFilter === 'upcoming') {
            return allFavorites.filter(event => {
                const eventDate = new Date(event.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= today;
            });
        } else if (currentFilter === 'completed') {
            return allFavorites.filter(event => {
                const eventDate = new Date(event.date);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate < today;
            });
        }
        return allFavorites;
    }

    // ✅ Load and Display Favorites
    async function loadFavorites() {
        // Reload favorites from database
        if (loggedInUser && loggedInUser.username) {
            try {
                const response = await fetch(`${API_CONFIG.BASE_URL}/users/${loggedInUser.username}/favorites`);
                if (response.ok) {
                    allFavorites = await response.json();
                }
            } catch (error) {
                console.error("Error loading favorites:", error);
            }
        }
        
    const favoriteEventsGrid = document.getElementById("favorite-events");
    // The empty-state element has id="favorites-empty" in the HTML.
    // Use getElementById to reliably find and toggle it.
    const favoritesEmpty = document.getElementById("favorites-empty");
        const favoritesBadge = document.getElementById("favorites-badge");

        if (!favoriteEventsGrid) {
            console.error("❌ Favorites grid element not found!");
            return;
        }

        // Update badge count
        if (favoritesBadge) {
            favoritesBadge.textContent = allFavorites.length;
        }

        // Get filtered events
        const filteredEvents = filterEvents();

        if (filteredEvents.length === 0) {
            // Hide the grid and show the empty-state
            favoriteEventsGrid.classList.add('hidden');
            if (favoritesEmpty) {
                favoritesEmpty.classList.remove('hidden');
            }
            // Clear any leftover cards
            favoriteEventsGrid.innerHTML = '';
        } else {
            // Show the grid and hide the empty-state
            favoriteEventsGrid.classList.remove('hidden');
            if (favoritesEmpty) {
                favoritesEmpty.classList.add('hidden');
            }
            
            // Create cards asynchronously
            const cards = await Promise.all(filteredEvents.map(event => createEventCard(event)));
            favoriteEventsGrid.innerHTML = cards.join("");
        }
    }

    // ✅ Filter Button Functionality
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach(button => {
        button.addEventListener("click", function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove("active"));
            
            // Add active class to clicked button
            this.classList.add("active");
            
            // Update current filter
            currentFilter = this.getAttribute("data-filter");
            
            // Reload favorites with new filter
            loadFavorites();
        });
    });

    // ✅ Remove from Favorites Function
    window.removeFromFavorites = async function (eventId) {
        if (!loggedInUser || !loggedInUser.username) {
            showToast("Please log in to remove favorites", "error");
            return;
        }
        
        const eventToRemove = allFavorites.find(event => event._id === eventId);
        
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/users/${loggedInUser.username}/favorites/${eventId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                if (eventToRemove) {
                    showToast(`${eventToRemove.name} removed from favorites!`);
                }
                await loadFavorites();
            } else {
                throw new Error('Failed to remove favorite');
            }
        } catch (error) {
            console.error("Error removing favorite:", error);
            showToast("Failed to remove favorite. Please try again.", "error");
        }
    };

    // ✅ Toggle Pin Function
    window.togglePin = async function (eventId) {
        if (!loggedInUser || !loggedInUser.username) {
            showToast("Please log in to pin events", "error");
            return;
        }
        
        try {
            // Get current pinned events
            const pinnedResponse = await fetch(`${API_CONFIG.BASE_URL}/users/${loggedInUser.username}/pinned`);
            if (!pinnedResponse.ok) {
                throw new Error('Failed to fetch pinned events');
            }
            
            const pinnedEvents = await pinnedResponse.json();
            const index = pinnedEvents.findIndex(event => event._id === eventId);

            if (index === -1) {
                // Pin the event
                const eventToPin = allFavorites.find(event => event._id === eventId);
                if (eventToPin) {
                    const response = await fetch(`${API_CONFIG.BASE_URL}/users/${loggedInUser.username}/pinned/${eventId}`, {
                        method: 'POST'
                    });
                    
                    if (response.ok) {
                        showToast(`${eventToPin.name} pinned!`);
                    } else {
                        throw new Error('Failed to pin event');
                    }
                }
            } else {
                // Unpin the event
                const unpinnedEvent = pinnedEvents[index];
                const response = await fetch(`${API_CONFIG.BASE_URL}/users/${loggedInUser.username}/pinned/${eventId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    showToast(`${unpinnedEvent.name} unpinned!`);
                } else {
                    throw new Error('Failed to unpin event');
                }
            }

            await loadFavorites();
        } catch (error) {
            console.error("Error toggling pin:", error);
            showToast("Failed to update pin. Please try again.", "error");
        }
    };

    // ✅ Toast Notification Function
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

    loadFavorites();

    // ✅ Search Bar Functionality
    const searchBar = document.querySelector(".search-bar");
    if (searchBar) {
        searchBar.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll(".event-card").forEach(card => {
                const title = card.querySelector(".event-card-title").textContent.toLowerCase();
                card.style.display = title.includes(query) ? "block" : "none";
            });
        });
    }
});
