/**
 * Lazy Loading & Infinite Scroll Manager
 * Handles pagination, lazy loading, and infinite scroll for events
 */

class InfiniteScrollManager {
    constructor(options = {}) {
        this.currentPage = 1;
        this.limit = options.limit || 12;
        this.isLoading = false;
        this.hasMore = true;
        this.container = options.container || document.querySelector('.events-grid');
        this.apiEndpoint = options.apiEndpoint || '/events';
        this.onLoadComplete = options.onLoadComplete || null;
        this.searchQuery = '';
        this.filters = {};
        
        // Initialize
        this.init();
    }

    init() {
        // Set up intersection observer for infinite scroll
        this.setupIntersectionObserver();
        
        // Load initial data
        this.loadMore();
    }

    setupIntersectionObserver() {
        // Create a sentinel element at the bottom
        this.sentinel = document.createElement('div');
        this.sentinel.className = 'infinite-scroll-sentinel';
        this.sentinel.style.height = '10px';
        
        if (this.container) {
            this.container.parentElement.appendChild(this.sentinel);
        }

        // Create intersection observer
        const options = {
            root: null,
            rootMargin: '200px', // Trigger 200px before reaching sentinel
            threshold: 0
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.isLoading && this.hasMore) {
                    this.loadMore();
                }
            });
        }, options);

        this.observer.observe(this.sentinel);
    }

    async loadMore() {
        if (this.isLoading || !this.hasMore) return;

        this.isLoading = true;
        this.showLoadingSpinner();

        try {
            // Build query parameters
            const params = new URLSearchParams({
                page: this.currentPage,
                limit: this.limit
            });

            if (this.searchQuery) {
                params.append('search', this.searchQuery);
            }

            Object.keys(this.filters).forEach(key => {
                if (this.filters[key]) {
                    params.append(key, this.filters[key]);
                }
            });

            // Fetch data
            const response = await fetch(`${this.apiEndpoint}?${params}`);
            const data = await response.json();

            // Handle response
            if (data.events && data.events.length > 0) {
                this.renderEvents(data.events);
                this.currentPage++;
                this.hasMore = data.pagination?.hasMore || false;
            } else {
                this.hasMore = false;
                this.showEndMessage();
            }

            // Callback
            if (this.onLoadComplete) {
                this.onLoadComplete(data);
            }

        } catch (error) {
            console.error('Error loading events:', error);
            showError('Failed to load events. Please try again.');
            this.hasMore = false;
        } finally {
            this.isLoading = false;
            this.hideLoadingSpinner();
        }
    }

    renderEvents(events) {
        if (!this.container) return;

        events.forEach((event, index) => {
            const eventCard = this.createEventCard(event);
            
            // Add to container
            this.container.appendChild(eventCard);
            
            // Lazy load images
            this.lazyLoadImage(eventCard);
            
            // Animate entrance
            setTimeout(() => {
                eventCard.classList.add('fade-in');
            }, index * 50);
        });
    }

    createEventCard(event) {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.style.opacity = '0';
        
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        card.innerHTML = `
            <div class="event-card-image">
                <img data-src="${event.image || '/placeholder-event.jpg'}" 
                     alt="${event.name}" 
                     class="lazy-image">
                <div class="event-card-overlay">
                    <button class="favorite-btn" onclick="toggleFavorite('${event._id}')">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
            </div>
            <div class="event-card-content">
                <h3>${event.name}</h3>
                <div class="event-info">
                    <div class="event-info-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="event-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.venue || 'TBA'}</span>
                    </div>
                    <div class="event-info-item">
                        <i class="fas fa-ticket-alt"></i>
                        <span>${event.ticketsAvailable || 0} tickets</span>
                    </div>
                </div>
                <div class="event-card-footer">
                    <button class="btn-primary" onclick="viewEvent('${event._id}')">
                        View Details
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    lazyLoadImage(card) {
        const img = card.querySelector('.lazy-image');
        if (!img) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const image = entry.target;
                    image.src = image.dataset.src;
                    image.classList.add('loaded');
                    imageObserver.unobserve(image);
                }
            });
        });

        imageObserver.observe(img);
    }

    showLoadingSpinner() {
        if (!this.loadingSpinner) {
            this.loadingSpinner = document.createElement('div');
            this.loadingSpinner.className = 'infinite-scroll-loading';
            this.loadingSpinner.innerHTML = `
                <div class="loading-spinner"></div>
                <p>Loading more events...</p>
            `;
        }
        
        if (this.sentinel) {
            this.sentinel.parentElement.insertBefore(this.loadingSpinner, this.sentinel);
        }
    }

    hideLoadingSpinner() {
        if (this.loadingSpinner && this.loadingSpinner.parentElement) {
            this.loadingSpinner.remove();
        }
    }

    showEndMessage() {
        if (this.endMessage) return;
        
        this.endMessage = document.createElement('div');
        this.endMessage.className = 'infinite-scroll-end';
        this.endMessage.innerHTML = `
            <p>✨ You've reached the end of the list!</p>
        `;
        
        if (this.sentinel) {
            this.sentinel.parentElement.insertBefore(this.endMessage, this.sentinel);
        }
    }

    reset() {
        // Clear container
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        // Reset state
        this.currentPage = 1;
        this.hasMore = true;
        this.isLoading = false;
        
        // Remove end message
        if (this.endMessage && this.endMessage.parentElement) {
            this.endMessage.remove();
            this.endMessage = null;
        }
        
        // Load first page
        this.loadMore();
    }

    updateSearch(query) {
        this.searchQuery = query;
        this.reset();
    }

    updateFilters(filters) {
        this.filters = { ...this.filters, ...filters };
        this.reset();
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.sentinel && this.sentinel.parentElement) {
            this.sentinel.remove();
        }
        if (this.loadingSpinner && this.loadingSpinner.parentElement) {
            this.loadingSpinner.remove();
        }
        if (this.endMessage && this.endMessage.parentElement) {
            this.endMessage.remove();
        }
    }
}

// Initialize on events page
document.addEventListener('DOMContentLoaded', function() {
    const eventsGrid = document.querySelector('.events-grid');
    
    if (eventsGrid) {
        window.infiniteScroll = new InfiniteScrollManager({
            container: eventsGrid,
            limit: 12,
            onLoadComplete: (data) => {
                console.log(`Loaded ${data.events.length} events (Page ${data.pagination.page})`);
                
                // Update UI with total count
                const totalCount = document.querySelector('.total-events-count');
                if (totalCount && data.pagination) {
                    totalCount.textContent = `${data.pagination.total} Events`;
                }
            }
        });

        // Connect search bar
        const searchBar = document.querySelector('.search-bar');
        if (searchBar) {
            let searchTimeout;
            searchBar.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    window.infiniteScroll.updateSearch(e.target.value);
                }, 500);
            });
        }
    }
});
