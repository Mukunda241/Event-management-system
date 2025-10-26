// My Tickets Page
document.addEventListener("DOMContentLoaded", async () => {
    console.log("🎫 My Tickets Page Loaded!");

    // Check if user is logged in
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        alert("Please login to view your tickets");
        window.location.href = "login.html";
        return;
    }

    const ticketsGrid = document.getElementById("ticketsGrid");
    const emptyState = document.getElementById("emptyState");
    let currentFilter = 'all';

    // Function to load tickets from database
    async function loadTickets() {
        try {
            const response = await fetch(`http://localhost:5000/tickets/${loggedInUser.username}`);
            if (!response.ok) {
                throw new Error('Failed to load tickets');
            }
            const tickets = await response.json();
            console.log("📥 Loaded tickets from database:", tickets);
            return tickets;
        } catch (error) {
            console.error(" Error loading tickets:", error);
            return [];
        }
    }

    // Filter tabs functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            displayTickets();
        });
    });

    async function displayTickets() {
        // Always reload tickets from database to get fresh data
        const myTickets = await loadTickets();
        
        if (myTickets.length === 0) {
            emptyState.classList.remove('hidden');
            ticketsGrid.innerHTML = '';
            updateStatistics();
            return;
        }

        emptyState.classList.add('hidden');

        // Filter tickets based on current filter
        let filteredTickets = myTickets;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (currentFilter === 'upcoming') {
            filteredTickets = myTickets.filter(ticket => {
                const eventDate = new Date(ticket.eventDate);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate >= today;
            });
        } else if (currentFilter === 'past') {
            filteredTickets = myTickets.filter(ticket => {
                const eventDate = new Date(ticket.eventDate);
                eventDate.setHours(0, 0, 0, 0);
                return eventDate < today;
            });
        }

        if (filteredTickets.length === 0) {
            ticketsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px;">
                    <p style="color: #718096; font-size: 1.1rem;">No ${currentFilter} tickets found</p>
                </div>
            `;
            return;
        }

        ticketsGrid.innerHTML = filteredTickets.map((ticket, index) => createTicketCard(ticket, index)).join('');
        
        // Add staggered animation
        const cards = document.querySelectorAll('.ticket-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });

        // Update statistics
        updateStatistics();
    }

    async function updateStatistics() {
        // Always reload tickets from database to get fresh data
        const myTickets = await loadTickets();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Total tickets count
        const totalTickets = myTickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
        
        // Upcoming events count
        const upcomingEvents = myTickets.filter(ticket => {
            const eventDate = new Date(ticket.eventDate);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate >= today;
        }).length;
        
        // Completed events count
        const completedEvents = myTickets.filter(ticket => {
            const eventDate = new Date(ticket.eventDate);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate < today;
        }).length;
        
        // Total amount spent
        const totalSpent = myTickets.reduce((sum, ticket) => sum + (ticket.totalAmount || 0), 0);
        
        // Update DOM elements
        document.getElementById('totalTickets').textContent = totalTickets;
        document.getElementById('upcomingEvents').textContent = upcomingEvents;
        document.getElementById('completedEvents').textContent = completedEvents;
        document.getElementById('totalSpent').textContent = `₹${totalSpent}`;
    }

    function createTicketCard(ticket, index) {
        const eventDate = new Date(ticket.eventDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        eventDate.setHours(0, 0, 0, 0);
        
        const isPast = eventDate < today;
        const statusClass = isPast ? 'past' : 'upcoming';
        const statusText = isPast ? 'Completed' : 'Upcoming';

        const formattedDate = new Date(ticket.eventDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        return `
            <div class="ticket-card ${isPast ? 'expired' : ''}">
                ${isPast ? '<div class="expired-overlay">⏰ EXPIRED</div>' : ''}
                <div class="ticket-header">
                    <span class="ticket-status-badge ${statusClass}">${statusText}</span>
                    <h3>${ticket.eventName}</h3>
                    <div class="ticket-date">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>${formattedDate}</span>
                    </div>
                </div>
                
                <div class="ticket-body">
                    <div class="ticket-info">
                        <div class="info-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>${ticket.eventTime}</span>
                        </div>
                        <div class="info-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            <span>${ticket.eventVenue}</span>
                        </div>
                        <div class="info-item">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>Booked on ${new Date(ticket.bookedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    
                    <div class="ticket-summary">
                        <div class="summary-item">
                            <div class="summary-label">Quantity</div>
                            <div class="summary-value">${ticket.quantity}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Total Amount</div>
                            <div class="summary-value amount">
                                ${ticket.isPaid ? `₹${ticket.totalAmount}` : 'FREE'}
                            </div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Status</div>
                            <div class="summary-value" style="color: ${ticket.paymentStatus === 'completed' ? '#10b981' : '#f59e0b'}">
                                ${ticket.paymentStatus === 'completed' ? '✓' : '⏳'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="ticket-ids">
                        <h4><i class="fas fa-qrcode"></i> Your Ticket IDs:</h4>
                        <div class="ticket-id-list">
                            ${ticket.tickets.map(id => `
                                <div class="ticket-id-item">${id}</div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="ticket-actions">
                        <button class="action-btn view-event-btn" ${isPast ? 'disabled' : ''} onclick="viewEvent('${ticket.eventName}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            ${isPast ? 'Event Ended' : 'View Event'}
                        </button>
                        <button class="action-btn download-btn" onclick="downloadTicket('${ticket.eventName}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download
                        </button>
                        ${!isPast ? `
                        <button class="action-btn cancel-btn" onclick="cancelTicket('${ticket.eventId}', '${ticket.eventName}')">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            Cancel Ticket
                        </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // View Event
    window.viewEvent = function(eventName) {
        window.location.href = `event-template.html?event=${encodeURIComponent(eventName)}`;
    };

    // Download Ticket (placeholder)
    window.downloadTicket = function(eventName) {
        const ticket = myTickets.find(t => t.eventName === eventName);
        if (!ticket) return;

        // Create a simple text file with ticket details
        const ticketText = `
═══════════════════════════════════
           EVENT TICKET
═══════════════════════════════════

Event: ${ticket.eventName}
Date: ${new Date(ticket.eventDate).toLocaleDateString()}
Time: ${ticket.eventTime}
Venue: ${ticket.eventVenue}

Quantity: ${ticket.quantity} ticket(s)
Total Amount: ${ticket.isPaid ? `₹${ticket.totalAmount}` : 'FREE'}

Ticket IDs:
${ticket.tickets.map((id, i) => `${i + 1}. ${id}`).join('\n')}

Booked on: ${new Date(ticket.bookedAt).toLocaleString()}

═══════════════════════════════════
        Thank you for booking!
═══════════════════════════════════
        `;

        const blob = new Blob([ticketText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ticket-${ticket.eventName.replace(/\s+/g, '-')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast(" Ticket downloaded!", "success");
    };

    // Cancel Ticket
    window.cancelTicket = async function(eventId, eventName) {
        // Use custom modal instead of browser confirm
        showCancelConfirmation(eventName, async () => {
            try {
                const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
                if (!loggedInUser) {
                    showToast("Please login to cancel ticket", "error");
                    return;
                }
                
                showToast("Cancelling ticket...", "info");
                
                // Call backend API to cancel ticket
                const response = await fetch(`http://localhost:5000/tickets/${eventId}/${loggedInUser.username}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to cancel ticket');
                }
                
                const data = await response.json();
                
                // Show success message
                showToast(`${data.message} | -50 points deducted`, "success");
                
                // Show points deduction notification if available
                if (typeof showPointsNotification === 'function') {
                    showPointsNotification(-50, 'Ticket cancelled');
                }
                
                // Reload tickets to reflect changes
                setTimeout(() => {
                    loadMyTickets();
                }, 1000);
                
                // Reload user points if function exists
                if (typeof loadUserPoints === 'function') {
                    await loadUserPoints();
                }
                
            } catch (error) {
                console.error("Error cancelling ticket:", error);
                showToast(error.message, "error");
            }
        });
    };

    // Toast notification
    function showToast(message, type = "info") {
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Logout function
    window.logout = function() {
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
    };

    // Listen for storage changes (when tickets are cancelled in another tab/window)
    window.addEventListener('storage', (e) => {
        if (e.key === 'myTickets') {
            console.log('🔄 Tickets updated in storage, refreshing...');
            displayTickets();
        }
    });

    // Listen for page visibility changes (when user comes back to this page)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('👁️ Page visible again, refreshing tickets...');
            displayTickets();
        }
    });

    // Listen for focus events (when user clicks back to this page)
    window.addEventListener('focus', () => {
        console.log('🔍 Page focused, refreshing tickets...');
        displayTickets();
    });

    // Initial display
    displayTickets();
});
