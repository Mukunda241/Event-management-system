// Global Header Search Functionality
// This script provides search functionality for the header search bar across all pages

document.addEventListener('DOMContentLoaded', function() {
    const headerSearchBar = document.querySelector('.search-bar');
    
    if (!headerSearchBar) return;

    // Debounce function to avoid excessive searches
    let searchTimeout;
    
    headerSearchBar.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const searchQuery = e.target.value.toLowerCase().trim();
        
        searchTimeout = setTimeout(() => {
            performHeaderSearch(searchQuery);
        }, 300);
    });

    // Handle Enter key
    headerSearchBar.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(searchTimeout);
            const searchQuery = e.target.value.toLowerCase().trim();
            performHeaderSearch(searchQuery);
        }
    });

    function performHeaderSearch(query) {
        // If empty, show all events
        if (!query) {
            showAllEvents();
            return;
        }

        // Get all event cards on the current page
        const eventCards = document.querySelectorAll('.event-card');
        let foundCount = 0;

        eventCards.forEach(card => {
            // Get event details from the card
            const eventName = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const eventInfoItems = card.querySelectorAll('.event-info-item span');
            
            let eventDate = '';
            let eventVenue = '';
            let eventOrganizer = '';
            
            eventInfoItems.forEach((item, index) => {
                const text = item.textContent.toLowerCase();
                if (index === 0) eventDate = text;
                if (index === 1) eventVenue = text;
                if (index === 2) eventOrganizer = text.replace('organized by ', '');
            });

            const eventDescription = card.querySelector('.event-description')?.textContent.toLowerCase() || '';

            // Check if query matches any field
            const matches = 
                eventName.includes(query) ||
                eventVenue.includes(query) ||
                eventOrganizer.includes(query) ||
                eventDescription.includes(query) ||
                eventDate.includes(query);

            // Show/hide card based on match
            if (matches) {
                card.style.display = '';
                card.style.animation = 'fadeInUp 0.3s ease-out';
                foundCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update section counts if they exist
        updateSectionCounts();

        // Show "no results" message if nothing found
        if (foundCount === 0) {
            showNoResultsMessage(query);
        } else {
            removeNoResultsMessage();
        }
    }

    function showAllEvents() {
        const eventCards = document.querySelectorAll('.event-card');
        eventCards.forEach(card => {
            card.style.display = '';
        });
        updateSectionCounts();
        removeNoResultsMessage();
    }

    function updateSectionCounts() {
        // Update counts for sections (Live, Upcoming, Completed)
        const sections = [
            { grid: 'live-events', count: 'live-count' },
            { grid: 'upcoming-events', count: 'upcoming-count' },
            { grid: 'completed-events', count: 'completed-count' },
            // Use the actual IDs used in index.html
            { grid: 'pinned-events', count: 'pinnedCount' },
            { grid: 'favorite-events', count: 'favorites-count' }
        ];

        sections.forEach(section => {
            const grid = document.getElementById(section.grid);
            const countElement = document.getElementById(section.count);
            
            if (grid && countElement) {
                const visibleCards = grid.querySelectorAll('.event-card:not([style*="display: none"])');
                countElement.textContent = visibleCards.length;
            }
        });
    }

    function showNoResultsMessage(query) {
        removeNoResultsMessage(); // Remove any existing message

        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        const noResultsDiv = document.createElement('div');
        noResultsDiv.id = 'header-search-no-results';
        noResultsDiv.innerHTML = `
            <div style="
                text-align: center;
                padding: 60px 20px;
                background: white;
                border-radius: 20px;
                margin: 20px auto;
                max-width: 600px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                animation: fadeInUp 0.4s ease-out;
            ">
                <svg viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2" style="width: 80px; height: 80px; margin: 0 auto 20px;">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                    <line x1="11" y1="8" x2="11" y2="14"/>
                    <line x1="11" y1="16" x2="11.01" y2="16"/>
                </svg>
                <h2 style="color: #667eea; margin-bottom: 10px; font-size: 1.8rem;">No Events Found</h2>
                <p style="color: #666; font-size: 1.1rem; margin-bottom: 20px;">
                    No events match your search for "<strong>${query}</strong>"
                </p>
                <button onclick="document.querySelector('.search-bar').value = ''; document.querySelector('.search-bar').dispatchEvent(new Event('input'));" 
                    style="
                        background: linear-gradient(135deg, #667eea, #764ba2);
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 25px;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: transform 0.2s ease;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'"
                >
                    Clear Search
                </button>
            </div>
        `;

        // Insert after page hero or at the top of main content
        const pageHero = document.querySelector('.page-hero');
        if (pageHero) {
            pageHero.after(noResultsDiv);
        } else {
            mainContent.insertBefore(noResultsDiv, mainContent.firstChild);
        }
    }

    function removeNoResultsMessage() {
        const noResultsDiv = document.getElementById('header-search-no-results');
        if (noResultsDiv) {
            noResultsDiv.remove();
        }
    }

    // Add CSS animation if not already present
    if (!document.getElementById('header-search-animations')) {
        const style = document.createElement('style');
        style.id = 'header-search-animations';
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
});
