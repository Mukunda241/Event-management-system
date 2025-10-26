// document.addEventListener("DOMContentLoaded", async function () {
//     console.log("📅 Events Page Loaded!");

//     const API_URL = "/events"; // relative path to backend

//     try {
//         // ✅ Fetch events directly from backend
//         const response = await fetch(API_URL);
//         if (!response.ok) throw new Error("Failed to load events from server");

//         const events = await response.json();
//         console.log("📌 Events from DB:", events);

//         let pinnedEvents = JSON.parse(localStorage.getItem("pinnedEvents")) || [];
//         let favoriteEvents = JSON.parse(localStorage.getItem("favoriteEvents")) || [];

//         function populateEventList(events, listId) {
//             const eventList = document.getElementById(listId);
//             if (eventList) {
//                 eventList.innerHTML = events.map(event => {
//                     const isPinned = pinnedEvents.some(e => e._id === event._id);
//                     const isFavorited = favoriteEvents.some(e => e._id === event._id);

//                     return `
//                         <li class="event-item" style="display: flex; justify-content: space-between; align-items: center;">
//                             <div>
//                                 <strong>${event.name}</strong><br>
//                                 📅 ${event.date} | 📍 ${event.venue}<br>
//                                 📝 ${event.description}
//                             </div>
//                             <div style="display: flex; gap: 10px;">
//                                 <button class="fav-btn" onclick="toggleFavorite('${event._id}')">
//                                     ${isFavorited ? "❌ Unfavorite" : "⭐ Favorite"}
//                                 </button>
//                                 <button class="pin-btn" onclick="togglePin('${event._id}')">
//                                     ${isPinned ? "📍 Unpin" : "📌 Pin"}
//                                 </button>
//                             </div>
//                         </li>
//                     `;
//                 }).join("");
//             }
//         }

//         // ✅ Toggle favorites
//         window.toggleFavorite = function (eventId) {
//             const event = events.find(e => e._id === eventId);
//             if (!event) return;

//             const index = favoriteEvents.findIndex(e => e._id === event._id);
//             if (index === -1) {
//                 favoriteEvents.push(event);
//                 alert(`⭐ ${event.name} added to favorites!`);
//             } else {
//                 favoriteEvents.splice(index, 1);
//                 alert(`❌ ${event.name} removed from favorites!`);
//             }

//             localStorage.setItem("favoriteEvents", JSON.stringify(favoriteEvents));
//             updatePinnedAndFavoriteLists();
//         };

//         // ✅ Toggle pinned
//         window.togglePin = function (eventId) {
//             const event = events.find(e => e._id === eventId);
//             if (!event) return;

//             const index = pinnedEvents.findIndex(e => e._id === event._id);
//             if (index === -1) {
//                 pinnedEvents.push(event);
//                 alert(`📌 ${event.name} pinned!`);
//             } else {
//                 pinnedEvents.splice(index, 1);
//                 alert(`📍 ${event.name} unpinned!`);
//             }

//             localStorage.setItem("pinnedEvents", JSON.stringify(pinnedEvents));
//             updatePinnedAndFavoriteLists();
//         };

//         // ✅ Update pinned & favorite lists
//         function updatePinnedAndFavoriteLists() {
//             const pinnedList = document.getElementById("pinned-events");
//             const favoriteList = document.getElementById("favorites-list");

//             if (pinnedList) {
//                 pinnedList.innerHTML = pinnedEvents.map(event => `
//                     <li>
//                         <strong>${event.name}</strong>
//                         <button onclick="togglePin('${event._id}')">📍 Unpin</button>
//                     </li>
//                 `).join("");
//             }

//             if (favoriteList) {
//                 favoriteList.innerHTML = favoriteEvents.map(event => `
//                     <li>
//                         <strong>${event.name}</strong>
//                         <button onclick="toggleFavorite('${event._id}')">❌ Unfavorite</button>
//                     </li>
//                 `).join("");
//             }

//             populateEventList(events, "upcoming-events"); // attach to existing UL in events.html
//         }

//         // ✅ Initial load
//         populateEventList(events, "upcoming-events");
//         updatePinnedAndFavoriteLists();

//     } catch (error) {
//         console.error("❌ Error loading events:", error);
//     }
// });

// 🔄 Auto-update event status based on date
async function autoUpdateEventStatuses() {
  console.log("🔄 Running auto-update for event statuses...");
  
  const API_URL = "http://localhost:5000/events";
  
  try {
    const response = await fetch(API_URL);
    if (!response.ok) return;
    
    const responseData = await response.json();
    // Handle both old format (array) and new format (object with events array)
    const events = Array.isArray(responseData) ? responseData : responseData.events;
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
    }
  } catch (error) {
    console.error("❌ Auto-update failed:", error);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  console.log("📅 Events Page Loaded!");

  const API_URL = "http://localhost:5000/events";
  
  // Run auto-update on page load
  await autoUpdateEventStatuses();
  
  // Set up periodic auto-update every 5 minutes
  setInterval(async () => {
    await autoUpdateEventStatuses();
    // Reload page to show updated statuses
    location.reload();
  }, 5 * 60 * 1000); // 5 minutes

  try {
    // Get logged-in user info
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
      alert("Please log in first.");
      window.location.href = "login.html";
      return;
    }
    const username = loggedInUser.username;
    const role = loggedInUser.role;
    console.log(`Logged in as ${username} with role ${role}`);

    // Fetch all events
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to load events from backend");

    const responseData = await response.json();
    // Handle both old format (array) and new format (object with events array)
    const events = Array.isArray(responseData) ? responseData : responseData.events;
    console.log("✅ Events from DB:", events);

    // Load pinned & favorite events from database
    let pinnedEvents = [];
    let favoriteEvents = [];
    
    try {
      const pinnedResponse = await fetch(`http://localhost:5000/users/${username}/pinned`);
      if (pinnedResponse.ok) {
        pinnedEvents = await pinnedResponse.json();
      }
      
      const favoritesResponse = await fetch(`http://localhost:5000/users/${username}/favorites`);
      if (favoritesResponse.ok) {
        favoriteEvents = await favoritesResponse.json();
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
    }

    // Filter events based on role
    let filteredEvents;
    if (role === "manager") {
      // Show only events organized by this manager
      filteredEvents = events.filter(e => e.organizer === username);
    } else {
      // Regular users see all events
      filteredEvents = events;
    }

    // Categorize filtered events by date
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day
    
    const liveEvents = filteredEvents.filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    });
    
    const upcomingEvents = filteredEvents.filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate > today;
    });
    
    const completedEvents = filteredEvents.filter(e => {
      const eventDate = new Date(e.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate < today;
    });

    // Debug and Update event counts
    console.log('Debug: filteredEvents length=', filteredEvents.length);
    console.log('Debug: live/upcoming/completed lengths=', liveEvents.length, upcomingEvents.length, completedEvents.length);
    console.log('Debug: sample upcoming names=', upcomingEvents.slice(0,5).map(e=>e.name));
    console.log('Debug: sample completed names=', completedEvents.slice(0,5).map(e=>e.name));

    const liveCountEl = document.getElementById("live-count");
    const upcomingCountEl = document.getElementById("upcoming-count");
    const completedCountEl = document.getElementById("completed-count");

    if (!liveCountEl || !upcomingCountEl || !completedCountEl) {
      console.warn('Debug: one or more count elements missing', { liveCountEl, upcomingCountEl, completedCountEl });
    } else {
      liveCountEl.textContent = liveEvents.length;
      upcomingCountEl.textContent = upcomingEvents.length;
      completedCountEl.textContent = completedEvents.length;
    }

    // Create event card HTML
    function createEventCard(event) {
      const isFavorited = favoriteEvents.some(e => e._id === event._id);
      const isPinned = pinnedEvents.some(e => e._id === event._id);
      
      // Check event status and date
      const eventDate = new Date(event.date);
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);
      eventDate.setHours(0, 0, 0, 0);
      
      let statusBadge = '';
      if (event.status === 'Cancelled') {
        statusBadge = '<span class="event-badge cancelled"><i class="fas fa-times-circle"></i> CANCELLED</span>';
      } else if (eventDate < todayDate) {
        statusBadge = '<span class="event-badge past"><i class="fas fa-history"></i> PAST EVENT</span>';
      } else if (event.status === 'Draft') {
        statusBadge = '<span class="event-badge draft"><i class="fas fa-file-alt"></i> DRAFT</span>';
      } else if (eventDate.getTime() === todayDate.getTime()) {
        statusBadge = '<span class="event-badge live"><i class="fas fa-circle" style="color: red;"></i> LIVE NOW</span>';
      }
      
      return `
        <div class="event-card fade-in">
          ${statusBadge}
          <h3>${event.name}</h3>
          <div class="event-info">
            <div class="event-info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>${event.date}</span>
            </div>
            <div class="event-info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>${event.venue}</span>
            </div>
            <div class="event-info-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Organized by ${event.organizer}</span>
            </div>
          </div>
          <div class="event-description">
            ${event.description}
          </div>
          <div style="display: flex; gap: 10px; margin-top: 15px;">
            <button
              onclick="toggleFavorite('${event._id}')"
              class="favorite-btn ${isFavorited ? 'active' : ''}"
              aria-label="${isFavorited ? 'Remove favorite' : 'Add favorite'}"
            >
              <i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>
            </button>

            <button
              onclick="togglePin('${event._id}')"
              class="pin-btn ${isPinned ? 'active' : ''}"
              aria-label="${isPinned ? 'Unpin event' : 'Pin event'}"
            >
              <!-- Use bookmark icon which has both regular and solid styles in Font Awesome -->
              <i class="${isPinned ? 'fas' : 'far'} fa-bookmark"></i>
            </button>
          </div>
          <button 
            class="view-details-btn"
            onclick="window.location.href='event-template.html?event=${encodeURIComponent(event.name)}'"
          >
            View Details →
          </button>
        </div>
      `;
    }

    // Create empty state HTML
    function createEmptyState(message) {
      return `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3>No Events Found</h3>
          <p>${message}</p>
        </div>
      `;
    }

    // Populate event grid
    function populateEventGrid(events, gridId, emptyMessage) {
      console.log(`Debug: populateEventGrid called for ${gridId} with ${events.length} events`);
      const grid = document.getElementById(gridId);
      console.log(`Debug: grid element for ${gridId}:`, grid);
      if (!grid) {
        console.error(`Debug: Grid element ${gridId} not found!`);
        return;
      }

      if (events.length === 0) {
        console.log(`Debug: No events for ${gridId}, showing empty state`);
        grid.innerHTML = createEmptyState(emptyMessage);
        return;
      }

          console.log(`Debug: Populating ${gridId} with ${events.length} event cards`);
          const html = events.map(event => createEventCard(event)).join("");
          console.log(`Debug: Generated HTML length for ${gridId}:`, html.length);
          // Insert cards into the grid (no debug marker)
          grid.innerHTML = html;
          console.log(`Debug: Populated ${gridId} with ${events.length} events`);
    }

    // Initial population
    console.log('Debug: About to call populateEventGrid for all sections');
    populateEventGrid(liveEvents, "live-events", "No events happening today");
    populateEventGrid(upcomingEvents, "upcoming-events", "No upcoming events scheduled");
    populateEventGrid(completedEvents, "completed-events", "No completed events yet");
    console.log('Debug: Finished calling populateEventGrid for all sections');

    // ============ SEARCH & FILTER FUNCTIONALITY ============
    
    let currentFilters = {
      search: '',
      category: 'all',
      status: 'all',
      date: 'all'
    };

    // Get filter elements
    const searchInput = document.getElementById('searchInput'); // Dedicated filter section search
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const activeFiltersDiv = document.getElementById('activeFilters');

    // Search with debounce to avoid too many updates
    let searchTimeout;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          currentFilters.search = e.target.value.toLowerCase().trim();
          applyFilters();
        }, 300);
      });
    }

    // Category filter
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        currentFilters.category = e.target.value;
        applyFilters();
      });
    }

    // Status filter
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        currentFilters.status = e.target.value;
        applyFilters();
      });
    }

    // Date filter
    if (dateFilter) {
      dateFilter.addEventListener('change', (e) => {
        currentFilters.date = e.target.value;
        applyFilters();
      });
    }

    // Clear all filters
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        currentFilters = {
          search: '',
          category: 'all',
          status: 'all',
          date: 'all'
        };
        
        // Reset input values
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        if (statusFilter) statusFilter.value = 'all';
        if (dateFilter) dateFilter.value = 'all';
        
        applyFilters();
        showToast('🔄 All filters cleared!');
      });
    }

    // Apply all active filters
    function applyFilters() {
      let filtered = [...filteredEvents];

      // Apply search filter
      if (currentFilters.search) {
        filtered = filtered.filter(event => {
          const searchStr = currentFilters.search;
          return (
            event.name.toLowerCase().includes(searchStr) ||
            event.organizer.toLowerCase().includes(searchStr) ||
            event.venue.toLowerCase().includes(searchStr) ||
            (event.description && event.description.toLowerCase().includes(searchStr))
          );
        });
      }

      // Apply category filter
      if (currentFilters.category !== 'all') {
        filtered = filtered.filter(event => 
          event.category === currentFilters.category
        );
      }

      // Apply status filter
      if (currentFilters.status !== 'all') {
        filtered = filtered.filter(event => 
          event.status === currentFilters.status
        );
      }

      // Apply date filter
      if (currentFilters.date !== 'all') {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        
        filtered = filtered.filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          
          switch(currentFilters.date) {
            case 'today':
              return eventDate.getTime() === now.getTime();
            
            case 'this-week':
              const weekFromNow = new Date(now);
              weekFromNow.setDate(now.getDate() + 7);
              return eventDate >= now && eventDate <= weekFromNow;
            
            case 'this-month':
              const monthFromNow = new Date(now);
              monthFromNow.setMonth(now.getMonth() + 1);
              return eventDate >= now && eventDate <= monthFromNow;
            
            case 'upcoming':
              return eventDate >= now;
            
            default:
              return true;
          }
        });
      }

      // Categorize filtered events
      const filteredLive = filtered.filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
      });
      
      const filteredUpcoming = filtered.filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate > today;
      });
      
      const filteredCompleted = filtered.filter(e => {
        const eventDate = new Date(e.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < today;
      });

      // Update event counts
      document.getElementById("live-count").textContent = filteredLive.length;
      document.getElementById("upcoming-count").textContent = filteredUpcoming.length;
      document.getElementById("completed-count").textContent = filteredCompleted.length;

      // Repopulate grids with filtered events
      populateEventGrid(filteredLive, "live-events", "No matching events happening today");
      populateEventGrid(filteredUpcoming, "upcoming-events", "No matching upcoming events");
      populateEventGrid(filteredCompleted, "completed-events", "No matching completed events");

      // Update active filters display
      updateActiveFilters();
    }

    // Update active filters tags
    function updateActiveFilters() {
      if (!activeFiltersDiv) return;

      const activeTags = [];

      if (currentFilters.search) {
        activeTags.push({
          label: `Search: "${currentFilters.search}"`,
          type: 'search'
        });
      }

      if (currentFilters.category !== 'all') {
        activeTags.push({
          label: `Category: ${currentFilters.category}`,
          type: 'category'
        });
      }

      if (currentFilters.status !== 'all') {
        activeTags.push({
          label: `Status: ${currentFilters.status}`,
          type: 'status'
        });
      }

      if (currentFilters.date !== 'all') {
        const dateLabels = {
          'today': 'Today',
          'this-week': 'This Week',
          'this-month': 'This Month',
          'upcoming': 'Upcoming'
        };
        activeTags.push({
          label: `Date: ${dateLabels[currentFilters.date]}`,
          type: 'date'
        });
      }

      if (activeTags.length === 0) {
        activeFiltersDiv.style.display = 'none';
        activeFiltersDiv.innerHTML = '';
        return;
      }

      activeFiltersDiv.style.display = 'flex';
      activeFiltersDiv.innerHTML = activeTags.map(tag => `
        <div class="filter-tag" onclick="removeFilter('${tag.type}')">
          <span>${tag.label}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      `).join('');
    }

    // Remove individual filter
    window.removeFilter = function(filterType) {
      switch(filterType) {
        case 'search':
          currentFilters.search = '';
          if (searchInput) searchInput.value = '';
          break;
        case 'category':
          currentFilters.category = 'all';
          if (categoryFilter) categoryFilter.value = 'all';
          break;
        case 'status':
          currentFilters.status = 'all';
          if (statusFilter) statusFilter.value = 'all';
          break;
        case 'date':
          currentFilters.date = 'all';
          if (dateFilter) dateFilter.value = 'all';
          break;
      }
      applyFilters();
      showToast(`Filter removed!`);
    };

    // ============ END SEARCH & FILTER ============

    // Toggle favorite event
    window.toggleFavorite = async function (eventId) {
      const event = filteredEvents.find(e => e._id === eventId);
      if (!event) return;

      const index = favoriteEvents.findIndex(e => e._id === eventId);
      
      try {
        if (index === -1) {
          // Add to favorites
          const response = await fetch(`http://localhost:5000/users/${username}/favorites/${eventId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            favoriteEvents.push(event);
            showToast(`${event.name} added to favorites!`);
          }
        } else {
          // Remove from favorites
          const response = await fetch(`http://localhost:5000/users/${username}/favorites/${eventId}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            favoriteEvents.splice(index, 1);
            showToast(`${event.name} removed from favorites!`);
          }
        }
        
        // Refresh all grids
        populateEventGrid(liveEvents, "live-events", "No events happening today");
        populateEventGrid(upcomingEvents, "upcoming-events", "No upcoming events scheduled");
        populateEventGrid(completedEvents, "completed-events", "No completed events yet");
      } catch (error) {
        console.error("Error toggling favorite:", error);
        showToast("Failed to update favorites", "error");
      }
    };

    // Toggle pin event
    window.togglePin = async function (eventId) {
      const event = filteredEvents.find(e => e._id === eventId);
      if (!event) return;

      const index = pinnedEvents.findIndex(e => e._id === eventId);
      
      try {
        if (index === -1) {
          // Pin event
          const response = await fetch(`http://localhost:5000/users/${username}/pinned/${eventId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.ok) {
            pinnedEvents.push(event);
            showToast(`${event.name} pinned!`);
          }
        } else {
          // Unpin event
          const response = await fetch(`http://localhost:5000/users/${username}/pinned/${eventId}`, {
            method: 'DELETE'
          });
          
          if (response.ok) {
            pinnedEvents.splice(index, 1);
            showToast(`${event.name} unpinned!`);
          }
        }
        
        // Refresh all grids
        populateEventGrid(liveEvents, "live-events", "No events happening today");
        populateEventGrid(upcomingEvents, "upcoming-events", "No upcoming events scheduled");
        populateEventGrid(completedEvents, "completed-events", "No completed events yet");
      } catch (error) {
        console.error("Error toggling pin:", error);
        showToast("Failed to update pins", "error");
      }
    };

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
    console.error("❌ Error loading events:", error);
    alert("Failed to load events. Please try again.");
  }
});
