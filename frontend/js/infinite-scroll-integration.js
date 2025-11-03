/**
 * Infinite Scroll Integration for Events Page
 * Works with existing events.js structure
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        API_URL: `${API_CONFIG.BASE_URL}/events`,
        LIMIT: 12,
        TRIGGER_DISTANCE: '200px',
        DEBOUNCE_DELAY: 500
    };

    // State management
    const state = {
        currentPage: 1,
        isLoading: false,
        hasMore: true,
        searchQuery: '',
        categoryFilter: 'all',
        statusFilter: 'all',
        allEvents: [],
        loadedEvents: []
    };

    /**
     * Initialize infinite scroll after DOM is loaded
     */
    function init() {
        console.log('🚀 Initializing infinite scroll...');
        
        // Wait for existing events.js to finish loading
        setTimeout(() => {
            setupInfiniteScroll();
            setupSearchAndFilters();
        }, 1000);
    }

    /**
     * Set up intersection observer for infinite scroll
     */
    function setupInfiniteScroll() {
        const upcomingGrid = document.getElementById('upcoming-events');
        if (!upcomingGrid) {
            console.warn('Upcoming events grid not found');
            return;
        }

        // Create sentinel element
        const sentinel = document.createElement('div');
        sentinel.id = 'infinite-scroll-sentinel';
        sentinel.style.height = '10px';
        sentinel.style.width = '100%';
        
        // Insert after the grid
        upcomingGrid.parentElement.appendChild(sentinel);

        // Create intersection observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !state.isLoading && state.hasMore) {
                    console.log('📍 Reached scroll trigger point');
                    loadMoreEvents();
                }
            });
        }, {
            root: null,
            rootMargin: CONFIG.TRIGGER_DISTANCE,
            threshold: 0
        });

        observer.observe(sentinel);
        console.log('✅ Infinite scroll observer initialized');
    }

    /**
     * Set up search and filter handlers
     */
    function setupSearchAndFilters() {
        const searchInput = document.getElementById('searchInput');
        const categoryFilter = document.getElementById('categoryFilter');

        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    state.searchQuery = e.target.value.toLowerCase();
                    resetAndReload();
                }, CONFIG.DEBOUNCE_DELAY);
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                state.categoryFilter = e.target.value;
                resetAndReload();
            });
        }
    }

    /**
     * Load more events from API
     */
    async function loadMoreEvents() {
        if (state.isLoading || !state.hasMore) return;

        state.isLoading = true;
        showLoadingSpinner();

        try {
            // Build query parameters
            const params = new URLSearchParams({
                page: state.currentPage,
                limit: CONFIG.LIMIT
            });

            if (state.searchQuery) {
                params.append('search', state.searchQuery);
            }

            if (state.categoryFilter && state.categoryFilter !== 'all') {
                params.append('category', state.categoryFilter);
            }

            // Fetch data
            const response = await fetch(`${CONFIG.API_URL}?${params}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            console.log(`📦 Loaded page ${state.currentPage}:`, data);

            // Handle old API format (array) vs new format (object with pagination)
            let events, hasMore;
            
            if (Array.isArray(data)) {
                // Old format: just array of events
                events = data;
                hasMore = events.length === CONFIG.LIMIT;
            } else {
                // New format: {events: [...], pagination: {...}}
                events = data.events || [];
                hasMore = data.pagination?.hasMore || false;
            }

            if (events && events.length > 0) {
                state.loadedEvents.push(...events);
                appendEvents(events);
                state.currentPage++;
                state.hasMore = hasMore;
            } else {
                state.hasMore = false;
                showEndMessage();
            }

        } catch (error) {
            console.error('❌ Error loading events:', error);
            showError('Failed to load events. Please try again.');
            state.hasMore = false;
        } finally {
            state.isLoading = false;
            hideLoadingSpinner();
        }
    }

    /**
     * Append events to the grid
     */
    function appendEvents(events) {
        const upcomingGrid = document.getElementById('upcoming-events');
        if (!upcomingGrid) return;

        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const username = loggedInUser?.username || '';

        events.forEach((event, index) => {
            // Skip if event already exists
            if (document.querySelector(`[data-event-id="${event._id}"]`)) {
                return;
            }

            const eventCard = createEventCard(event, username);
            upcomingGrid.appendChild(eventCard);

            // Animate entrance
            setTimeout(() => {
                eventCard.style.opacity = '1';
                eventCard.style.transform = 'translateY(0)';
            }, index * 50);

            // Lazy load image
            lazyLoadImage(eventCard);
        });

        // Update count
        const countElement = document.getElementById('upcoming-count');
        if (countElement) {
            countElement.textContent = state.loadedEvents.length;
        }
    }

    /**
     * Create event card HTML
     */
    function createEventCard(event, username) {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.setAttribute('data-event-id', event._id);
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        const isFavorited = event.favorites?.includes(username) || false;
        const isPinned = event.pinnedBy?.includes(username) || false;

        card.innerHTML = `
            <div class="event-card-badge ${event.status?.toLowerCase() || 'active'}">
                ${event.status || 'Active'}
            </div>
            <div class="event-card-image">
                ${event.image ? 
                    `<img data-src="${event.image}" alt="${event.name}" class="lazy-image">` :
                    `<div class="event-placeholder">📅</div>`
                }
            </div>
            <div class="event-card-content">
                <h3>${event.name}</h3>
                <div class="event-meta">
                    <span>📅 ${formattedDate}</span>
                    <span>📍 ${event.venue || 'TBA'}</span>
                    ${event.category ? `<span>🏷️ ${event.category}</span>` : ''}
                </div>
                <p class="event-description">${event.description || ''}</p>
                <div class="event-card-footer">
                    <button onclick="toggleFavorite('${event._id}')" class="action-btn ${isFavorited ? 'active' : ''}">
                        ${isFavorited ? '❤️' : '🤍'} Favorite
                    </button>
                    <button onclick="togglePin('${event._id}')" class="action-btn ${isPinned ? 'active' : ''}">
                        ${isPinned ? '📌' : '📍'} Pin
                    </button>
                    <button onclick="window.location.href='event-template.html?event=${encodeURIComponent(event.name)}'" class="action-btn primary">
                        View Details
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Lazy load image
     */
    function lazyLoadImage(card) {
        const img = card.querySelector('.lazy-image');
        if (!img) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    if (image.dataset.src) {
                        image.src = image.dataset.src;
                        image.classList.add('loaded');
                        observer.unobserve(image);
                    }
                }
            });
        });

        observer.observe(img);
    }

    /**
     * Show loading spinner
     */
    function showLoadingSpinner() {
        let spinner = document.getElementById('infinite-scroll-loading');
        
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'infinite-scroll-loading';
            spinner.className = 'infinite-scroll-loading';
            spinner.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Loading more events...</p>
            `;
        }

        const sentinel = document.getElementById('infinite-scroll-sentinel');
        if (sentinel && sentinel.parentElement) {
            sentinel.parentElement.insertBefore(spinner, sentinel);
        }
    }

    /**
     * Hide loading spinner
     */
    function hideLoadingSpinner() {
        const spinner = document.getElementById('infinite-scroll-loading');
        if (spinner && spinner.parentElement) {
            spinner.remove();
        }
    }

    /**
     * Show end message
     */
    function showEndMessage() {
        let endMessage = document.getElementById('infinite-scroll-end');
        
        if (!endMessage) {
            endMessage = document.createElement('div');
            endMessage.id = 'infinite-scroll-end';
            endMessage.className = 'infinite-scroll-end';
            endMessage.innerHTML = `<p>✨ You've reached the end of the list!</p>`;
            
            const sentinel = document.getElementById('infinite-scroll-sentinel');
            if (sentinel && sentinel.parentElement) {
                sentinel.parentElement.insertBefore(endMessage, sentinel);
            }
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        // Use existing toast system if available
        if (window.showError) {
            window.showError(message);
        } else {
            console.error(message);
        }
    }

    /**
     * Reset and reload from page 1
     */
    function resetAndReload() {
        console.log('🔄 Resetting infinite scroll...');
        
        // Clear state
        state.currentPage = 1;
        state.hasMore = true;
        state.isLoading = false;
        state.loadedEvents = [];

        // Clear grid
        const upcomingGrid = document.getElementById('upcoming-events');
        if (upcomingGrid) {
            upcomingGrid.innerHTML = '';
        }

        // Remove end message
        const endMessage = document.getElementById('infinite-scroll-end');
        if (endMessage && endMessage.parentElement) {
            endMessage.remove();
        }

        // Load first page
        loadMoreEvents();
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for debugging
    window.infiniteScrollDebug = {
        state,
        reload: resetAndReload,
        loadMore: loadMoreEvents
    };

    console.log('✅ Infinite scroll integration loaded');
})();
