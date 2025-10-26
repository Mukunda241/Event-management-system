// 🔄 Auto-update event status based on date
async function autoUpdateEventStatuses() {
    console.log("🔄 Running auto-update for event statuses...");
    
    const API_URL = "http://localhost:5000/events";
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) return false;
        
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
            return true;
        }
        return false;
    } catch (error) {
        console.error(" Auto-update failed:", error);
        return false;
    }
}

// Event Template Page - Load and Display Event Details
document.addEventListener("DOMContentLoaded", async () => {
    console.log("📅 Event Template Page Loaded!");
    
    // Run auto-update on page load
    await autoUpdateEventStatuses();

    const urlParams = new URLSearchParams(window.location.search);
    const eventName = decodeURIComponent(urlParams.get("event") || "").trim();

    if (!eventName) {
        console.error("No event name found in URL!");
        document.querySelector(".event-title").textContent = "Event Not Found";
        showToast("No event specified!", "error");
        return;
    }

    try {
        console.log("Fetching event:", eventName);
        
        // Fetch events from backend
        const response = await fetch("http://localhost:5000/events");
        if (!response.ok) {
            throw new Error("Failed to fetch events");
        }
        
        const responseData = await response.json();
        // Handle both old format (array) and new format (object with events array)
        const events = Array.isArray(responseData) ? responseData : responseData.events;
        console.log(" Events loaded:", events.length);

        // Find the event by name
        const event = events.find(e => e.name.trim() === eventName);

        if (!event) {
            console.error("Event not found:", eventName);
            document.querySelector(".event-title").textContent = "Event Not Found";
            showToast("Event not found!", "error");
            setTimeout(() => window.location.href = "events.html", 2000);
            return;
        }

        console.log("🎯 Event found:", event);

        // Populate event details
        populateEventDetails(event);
        
        // Initialize interactive features
        initializeRegistration(event);
        initializeFavorite(event);
        initializePin(event);
        initializeShare(event);
        
        // Update attendee count
        updateAttendeeCount(event);

    } catch (error) {
        console.error("Error loading event:", error);
        showToast("Error loading event details", "error");
        document.querySelector(".event-title").textContent = "Error Loading Event";
    }
});

// Populate all event details in the page
function populateEventDetails(event) {
    // Header section
    document.querySelector(".event-title").textContent = event.name;
    document.querySelector(".event-subtitle").textContent = event.tagline || "Join us for this amazing event!";
    document.getElementById("breadcrumbEvent").textContent = event.name;
    document.getElementById("eventCategory").textContent = event.category || "General";
    
    // Quick meta in header
    document.getElementById("quickDate").textContent = event.date || "-";
    document.getElementById("quickTime").textContent = event.time || "All Day";
    document.getElementById("quickVenue").textContent = event.venue || "-";
    
    // Event details card
    document.getElementById("eventDate").textContent = event.date || "-";
    document.getElementById("eventTime").textContent = event.time || "All Day";
    document.getElementById("eventVenue").textContent = event.venue || "-";
    document.getElementById("eventCategoryDetail").textContent = event.category || "General";
    
    // Status with color-coded badge
    const status = event.status || 'Active';
    const statusConfig = {
        'Draft': { color: '#6b7280', icon: '', text: 'Draft' },
        'Active': { color: '#10b981', icon: '', text: 'Active' },
        'Closed': { color: '#ef4444', icon: '', text: 'Closed' },
        'Completed': { color: '#3b82f6', icon: '', text: 'Completed' },
        'Cancelled': { color: '#f59e0b', icon: '', text: 'Cancelled' }
    };
    const statusInfo = statusConfig[status] || statusConfig['Active'];
    
    const statusElement = document.getElementById("eventStatusDetail");
    statusElement.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; background: ${statusInfo.color}; color: white; border-radius: 20px; font-weight: 700; font-size: 0.9rem; box-shadow: 0 2px 6px rgba(0,0,0,0.15);">
            <span>${statusInfo.icon}</span>
            <span>${statusInfo.text}</span>
        </span>
    `;
    
    document.getElementById("eventOrganizer").textContent = event.organizer || "Unknown";
    
    // Description
    document.getElementById("eventDescription").textContent = event.description || "No description available.";
    
    // Event rating
    document.getElementById("eventRating").textContent = event.rating || "4.8";
}


// Initialize registration functionality
// Global variables for ticket system
let currentEvent = null;
let ticketQuantity = 1;

function initializeRegistration(event) {
    currentEvent = event; // Store event globally
    
    const getTicketsBtn = document.getElementById("getTicketsBtn");
    const cancelTicketsBtn = document.getElementById("cancelTicketsBtn");
    const statusText = document.getElementById("registrationStatus");
    const pricingInfo = document.getElementById("eventPricingInfo");
    
    const eventStatus = event.status || 'Active';
    
    // Check if event has passed
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);
    const isPastEvent = eventDate < today;
    
    // Display pricing information
    if (pricingInfo) {
        if (event.isPaid) {
            pricingInfo.className = 'event-pricing-info paid';
            pricingInfo.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
                <span>Paid Event: ₹${event.ticketPrice} per ticket</span>
            `;
        } else {
            pricingInfo.className = 'event-pricing-info free';
            pricingInfo.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Free Event - No charge</span>
            `;
        }
    }
    
    // Check if registration is allowed based on status and date
    const canRegister = eventStatus === 'Active' && !isPastEvent;
    
    async function updateRegistrationUI() {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        const username = loggedInUser ? loggedInUser.username : null;
        
        // Check if user already has tickets in database
        let hasTickets = false;
        if (username) {
            try {
                const response = await fetch(`http://localhost:5000/tickets/${username}`);
                if (response.ok) {
                    const tickets = await response.json();
                    hasTickets = tickets.some(t => t.eventId === event._id);
                    console.log("🎫 User has tickets:", hasTickets, "for event:", event.name);
                }
            } catch (error) {
                console.error(" Error checking tickets:", error);
            }
        }
        
        // Handle different statuses
        if (!canRegister) {
            getTicketsBtn.disabled = true;
            cancelTicketsBtn.disabled = true;
            getTicketsBtn.style.opacity = '0.5';
            getTicketsBtn.style.cursor = 'not-allowed';
            
            if (isPastEvent) {
                statusText.textContent = "Event has ended - Tickets no longer available";
                statusText.style.color = '#94a3b8';
                getTicketsBtn.textContent = "Event Ended";
            } else if (eventStatus === 'Cancelled') {
                statusText.textContent = "Event has been cancelled";
                statusText.style.color = '#f59e0b';
                getTicketsBtn.textContent = "Event Cancelled";
            } else if (eventStatus === 'Draft') {
                statusText.textContent = "Event is in draft mode - Tickets not available";
                statusText.style.color = '#6b7280';
                getTicketsBtn.textContent = "Not Available";
            } else if (eventStatus === 'Closed') {
                statusText.textContent = "Ticket sales closed";
                statusText.style.color = '#ef4444';
                getTicketsBtn.textContent = "Sales Closed";
            } else if (eventStatus === 'Completed') {
                statusText.textContent = "Event has ended";
                statusText.style.color = '#3b82f6';
                getTicketsBtn.textContent = "Event Ended";
            }
        } else if (hasTickets) {
            getTicketsBtn.classList.add("hidden");
            cancelTicketsBtn.classList.remove("hidden");
            
            if (isPastEvent) {
                // Disable cancel for past events
                cancelTicketsBtn.disabled = true;
                cancelTicketsBtn.style.opacity = '0.6';
                cancelTicketsBtn.style.cursor = 'not-allowed';
                statusText.textContent = "Event completed - Cannot cancel booking";
            } else {
                cancelTicketsBtn.disabled = false;
                cancelTicketsBtn.style.opacity = '1';
                cancelTicketsBtn.style.cursor = 'pointer';
                statusText.textContent = "You have tickets for this event";
            }
            statusText.style.color = '#10b981';
        } else {
            getTicketsBtn.classList.remove("hidden");
            cancelTicketsBtn.classList.add("hidden");
            getTicketsBtn.disabled = false;
            getTicketsBtn.style.opacity = '1';
            getTicketsBtn.style.cursor = 'pointer';
            statusText.textContent = "";
        }
    }
    
    // Open ticket modal
    getTicketsBtn.addEventListener("click", () => {
        if (isPastEvent) {
            showToast("This event has already ended. Tickets are no longer available.", "error");
            return;
        }
        if (eventStatus === 'Cancelled') {
            showToast("This event has been cancelled. Tickets are not available.", "error");
            return;
        }
        if (!canRegister) {
            showToast("Tickets are not available for this event", "error");
            return;
        }
        openTicketModal(event);
    });
    
    // Cancel tickets/booking
    cancelTicketsBtn.addEventListener("click", async () => {
        if (isPastEvent) {
            showToast("Cannot cancel booking for past events", "error");
            return;
        }
        
        // Use custom modal instead of browser confirm
        showCancelConfirmation(event.name, async () => {
            // Get current user
            const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
            const username = loggedInUser ? loggedInUser.username : null;
            
            if (!username) {
                showToast("Please login to cancel booking", "error");
                return;
            }
            
            console.log("Cancelling booking for:", event.name, "User:", username);
            
            try {
                // Cancel ticket in database
                const response = await fetch(`http://localhost:5000/tickets/${event._id}/${username}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || "Failed to cancel ticket");
                }
                
                const result = await response.json();
                console.log("Ticket cancelled successfully:", result);
                
                // Show success with points info
                showToast(`${result.message} | -50 points deducted`, "success");
                
                // Show points deduction notification if available
                if (typeof showPointsNotification === 'function') {
                    showPointsNotification(-50, 'Ticket cancelled');
                }
                
                updateRegistrationUI();
                updateAttendeeCount(event);
                
                // Reload user points if function exists
                if (typeof loadUserPoints === 'function') {
                    await loadUserPoints();
                }
                
                // Reload page to refresh data
                setTimeout(() => location.reload(), 1500);
            } catch (error) {
                console.error("Error cancelling ticket:", error);
                showToast(error.message || "Failed to cancel booking. Please try again.", "error");
            }
        });
    });
    
    updateRegistrationUI();
}

// Open Ticket Modal
async function openTicketModal(event) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const username = loggedInUser ? loggedInUser.username : null;
    
    if (!username) {
        showToast("Please login to book tickets", "error");
        return;
    }
    
    // Check for duplicate booking in database
    try {
        const response = await fetch(`http://localhost:5000/tickets/${username}`);
        if (response.ok) {
            const tickets = await response.json();
            const alreadyBooked = tickets.some(ticket => ticket.eventId === event._id);
            
            if (alreadyBooked) {
                showToast(" You already have tickets for this event!", "error");
                return;
            }
        }
    } catch (error) {
        console.error("Error checking existing tickets:", error);
    }
    
    const modal = document.getElementById("ticketModal");
    const modalEventName = document.getElementById("modalEventName");
    const modalEventDate = document.getElementById("modalEventDate");
    const modalEventVenue = document.getElementById("modalEventVenue");
    const modalTicketPrice = document.getElementById("modalTicketPrice");
    const priceTag = document.querySelector(".price-tag");
    const checkoutBtnText = document.getElementById("checkoutBtnText");
    
    // Populate modal with event details
    modalEventName.textContent = event.name;
    modalEventDate.textContent = `${new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at ${event.time}`;
    modalEventVenue.textContent = event.venue;
    
    // Set pricing
    if (event.isPaid) {
        modalTicketPrice.textContent = `₹${event.ticketPrice}`;
        priceTag.classList.remove('free');
        checkoutBtnText.textContent = "Proceed to Payment";
    } else {
        modalTicketPrice.textContent = "FREE";
        priceTag.classList.add('free');
        checkoutBtnText.textContent = "Confirm Tickets";
    }
    
    // Reset quantity to 1
    ticketQuantity = 1;
    document.getElementById("ticketQuantity").value = 1;
    
    // Calculate available tickets
    const registered = event.registeredUsers?.length || 0;
    const available = event.capacity - registered;
    document.getElementById("availableTickets").textContent = `${available} tickets available`;
    
    // Update total
    updateTotal(event);
    
    // Show modal
    modal.style.display = "flex";
}

// Close Ticket Modal
function closeTicketModal() {
    document.getElementById("ticketModal").style.display = "none";
}

// Update Total Calculation
function updateTotal(event) {
    const price = event.isPaid ? event.ticketPrice : 0;
    const subtotal = price * ticketQuantity;
    const total = subtotal;
    
    document.getElementById("subtotal").textContent = `₹${subtotal}`;
    document.getElementById("grandTotal").textContent = `₹${total}`;
}

// Quantity Controls
document.getElementById("increaseQty").addEventListener("click", () => {
    const input = document.getElementById("ticketQuantity");
    const max = parseInt(input.max);
    if (ticketQuantity < max) {
        ticketQuantity++;
        input.value = ticketQuantity;
        updateTotal(currentEvent);
    }
});

document.getElementById("decreaseQty").addEventListener("click", () => {
    const input = document.getElementById("ticketQuantity");
    if (ticketQuantity > 1) {
        ticketQuantity--;
        input.value = ticketQuantity;
        updateTotal(currentEvent);
    }
});

// Proceed to Checkout
document.getElementById("proceedToCheckout").addEventListener("click", async () => {
    if (!currentEvent) return;
    
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) {
        showToast("Please login to continue", "error");
        setTimeout(() => window.location.href = "login.html", 1500);
        return;
    }
    
    const username = loggedInUser.username || "guest";
    
    // Generate ticket IDs
    const tickets = [];
    for (let i = 0; i < ticketQuantity; i++) {
        tickets.push(`TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);
    }
    
    const totalAmount = currentEvent.isPaid ? (currentEvent.ticketPrice * ticketQuantity) : 0;
    
    // Save ticket to database
    try {
        const response = await fetch(`http://localhost:5000/events/${currentEvent._id}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                fullName: loggedInUser.fullName || loggedInUser.username,
                email: loggedInUser.email || '',
                quantity: ticketQuantity,
                tickets: tickets,
                totalAmount: totalAmount,
                paymentStatus: currentEvent.isPaid ? 'pending' : 'completed'
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            showToast(error.error || "Failed to book tickets", "error");
            return;
        }
        
        const result = await response.json();
        console.log(" Ticket booked successfully:", result);
        
        closeTicketModal();
        
        if (currentEvent.isPaid) {
            showToast(`💳 Redirecting to payment... Total: ₹${totalAmount}`, "info");
            setTimeout(() => {
                // TODO: Integrate payment gateway
                showToast(" Payment successful! Tickets confirmed!", "success");
                location.reload();
            }, 2000);
        } else {
            showToast(` ${ticketQuantity} ticket(s) confirmed successfully!`, "success");
            setTimeout(() => location.reload(), 1500);
        }
    } catch (error) {
        console.error(" Error booking tickets:", error);
        showToast("Failed to book tickets. Please try again.", "error");
    }
});

// Initialize favorite functionality
function initializeFavorite(event) {
    const favoriteBtn = document.getElementById("favoriteBtn");
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    
    function updateFavoriteUI() {
        const isFavorite = favorites.includes(event.name);
        const svg = favoriteBtn.querySelector("svg path");
        const text = favoriteBtn.querySelector("span");
        
        if (isFavorite) {
            svg.setAttribute("fill", "currentColor");
            text.textContent = "Remove from Favorites";
        } else {
            svg.setAttribute("fill", "none");
            text.textContent = "Add to Favorites";
        }
    }
    
    favoriteBtn.addEventListener("click", () => {
        if (favorites.includes(event.name)) {
            favorites = favorites.filter(f => f !== event.name);
            showToast(" Removed from favorites", "info");
        } else {
            favorites.push(event.name);
            showToast(" Added to favorites!", "success");
        }
        localStorage.setItem("favorites", JSON.stringify(favorites));
        updateFavoriteUI();
    });
    
    updateFavoriteUI();
}

// Initialize pin functionality
function initializePin(event) {
    const pinBtn = document.getElementById("pinBtn");
    let pinnedEvents = JSON.parse(localStorage.getItem("pinnedEvents")) || [];
    
    function updatePinUI() {
        const isPinned = pinnedEvents.includes(event.name);
        const text = pinBtn.querySelector("span");
        
        if (isPinned) {
            pinBtn.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
            pinBtn.style.color = "white";
            pinBtn.style.borderColor = "transparent";
            text.textContent = "Unpin Event";
        } else {
            pinBtn.style.background = "white";
            pinBtn.style.color = "#2d3748";
            pinBtn.style.borderColor = "#e2e8f0";
            text.textContent = "Pin Event";
        }
    }
    
    pinBtn.addEventListener("click", () => {
        if (pinnedEvents.includes(event.name)) {
            pinnedEvents = pinnedEvents.filter(p => p !== event.name);
            showToast(" Event unpinned", "info");
        } else {
            pinnedEvents.push(event.name);
            showToast(" Event pinned!", "success");
        }
        localStorage.setItem("pinnedEvents", JSON.stringify(pinnedEvents));
        updatePinUI();
    });
    
    updatePinUI();
}

// Initialize share functionality
function initializeShare(event) {
    const shareBtn = document.getElementById("shareBtn");
    
    shareBtn.addEventListener("click", async () => {
        const shareData = {
            title: event.name,
            text: `Check out this event: ${event.name}`,
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                showToast(" Shared successfully!", "success");
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(window.location.href);
                showToast(" Link copied to clipboard!", "success");
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error("Share error:", error);
                showToast(" Failed to share", "error");
            }
        }
    });
}

// Update attendee count from database
async function updateAttendeeCount(event) {
    try {
        // Fetch fresh event data to get registeredUsers count
        const response = await fetch(`http://localhost:5000/events/${event._id}`);
        if (response.ok) {
            const eventData = await response.json();
            const dbCount = eventData.registeredUsers ? eventData.registeredUsers.length : 0;
            document.getElementById("attendeesCount").textContent = dbCount;
        } else {
            // Fallback to event data
            const baseCount = event.registeredUsers ? event.registeredUsers.length : (event.attendees || 0);
            document.getElementById("attendeesCount").textContent = baseCount;
        }
    } catch (error) {
        console.error("Error fetching attendee count:", error);
        const baseCount = event.registeredUsers ? event.registeredUsers.length : (event.attendees || 0);
        document.getElementById("attendeesCount").textContent = baseCount;
    }
}

// Toast notification function
function showToast(message, type = "info") {
    const existingToast = document.querySelector(".toast-notification");
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement("div");
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "fadeOut 0.3s ease-out";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Logout function
function logout() {
    localStorage.removeItem("loggedInUser");
    showToast(" Logged out successfully", "success");
    setTimeout(() => window.location.href = "login.html", 1000);
}
//         }

//     } catch (error) {
//         console.error(" Error loading event data:", error);
//     }
// });
document.addEventListener("DOMContentLoaded", async () => {
    console.log("📅 Event Detail Page Loaded!");

    // Get event name from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const eventName = decodeURIComponent(urlParams.get("event"));

    if (!eventName || eventName === "null") {
        console.error(" No event name found in URL!");
        document.getElementById("eventName").innerText = "Event Not Found";
        document.getElementById("eventTagline").innerText = "Please return to the events page";
        return;
    }

    try {
        // Get logged-in user info
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        if (!loggedInUser) {
            alert("Please log in first.");
            window.location.href = "login.html";
            return;
        }

        // Fetch all events from backend
        const API_URL = "http://localhost:5000/events";
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error("Failed to load events from backend");
        }

        const data = await response.json();
        const allEvents = data.events;
        console.log(" Events loaded:", allEvents);

        // Find the event by name
        const event = allEvents.find(e => e.name.trim() === eventName.trim());

        if (!event) {
            console.error(" Event not found:", eventName);
            document.getElementById("eventName").innerText = "Event Not Found";
            document.getElementById("eventTagline").innerText = "This event may have been removed or doesn't exist";
            return;
        }

        console.log("🎯 Event found:", event);

        // Populate event details
        document.getElementById("eventName").innerText = event.name;
        document.getElementById("eventTagline").innerText = `Join us for an amazing experience at ${event.venue}`;
        document.getElementById("eventDate").innerText = event.date || "Date Not Available";
        document.getElementById("eventVenue").innerText = event.venue || "Venue Not Available";
        document.getElementById("eventOrganizer").innerText = event.organizer || "Unknown Organizer";
        document.getElementById("eventDescription").innerText = event.description || "No description provided for this event.";

        // Update page title
        document.title = `${event.name} - EventPulse`;

        // Load user's registered events, favorites, and pins
        let registeredEvents = JSON.parse(localStorage.getItem("registeredEvents")) || [];
        // Load favorites and pinned events from database
        let favoriteEvents = [];
        let pinnedEvents = [];
        
        if (loggedInUser && loggedInUser.username) {
            try {
                const favoritesResponse = await fetch(`http://localhost:5000/users/${loggedInUser.username}/favorites`);
                if (favoritesResponse.ok) {
                    favoriteEvents = await favoritesResponse.json();
                }
                
                const pinnedResponse = await fetch(`http://localhost:5000/users/${loggedInUser.username}/pinned`);
                if (pinnedResponse.ok) {
                    pinnedEvents = await pinnedResponse.json();
                }
            } catch (error) {
                console.error("Error loading user preferences:", error);
            }
        }

        // Registration functionality is handled above in the first DOMContentLoaded
        // (lines 200-300 with database checking)

        // Favorite functionality
        const favoriteBtn = document.getElementById("favoriteBtn");
        
        function updateFavoriteUI() {
            const isFavorited = favoriteEvents.some(e => e._id === event._id);
            
            if (isFavorited) {
                favoriteBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Remove from Favorites
                `;
                favoriteBtn.style.background = "linear-gradient(135deg, #ef4444, #dc2626)";
            } else {
                favoriteBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                    Add to Favorites
                `;
                favoriteBtn.style.background = "";
            }
        }

        favoriteBtn.addEventListener("click", async () => {
            const index = favoriteEvents.findIndex(e => e._id === event._id);
            
            try {
                if (index === -1) {
                    const response = await fetch(`http://localhost:5000/users/${loggedInUser.username}/favorites/${event._id}`, {
                        method: 'POST'
                    });
                    
                    if (response.ok) {
                        favoriteEvents.push(event);
                        showToast(`${event.name} added to favorites!`);
                    } else {
                        throw new Error('Failed to add favorite');
                    }
                } else {
                    const response = await fetch(`http://localhost:5000/users/${loggedInUser.username}/favorites/${event._id}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        favoriteEvents.splice(index, 1);
                        showToast(`${event.name} removed from favorites!`);
                    } else {
                        throw new Error('Failed to remove favorite');
                    }
                }
                
                updateFavoriteUI();
            } catch (error) {
                console.error("Error updating favorite:", error);
                showToast("Failed to update favorite. Please try again.", "error");
            }
        });

        updateFavoriteUI();

        // Pin functionality
        const pinBtn = document.getElementById("pinBtn");
        
        function updatePinUI() {
            const isPinned = pinnedEvents.some(e => e._id === event._id);
            
            if (isPinned) {
                pinBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                    Unpin Event
                `;
                pinBtn.style.background = "linear-gradient(135deg, #8b5cf6, #7c3aed)";
            } else {
                pinBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                    </svg>
                    Pin Event
                `;
                pinBtn.style.background = "";
            }
        }

        pinBtn.addEventListener("click", async () => {
            const index = pinnedEvents.findIndex(e => e._id === event._id);
            
            try {
                if (index === -1) {
                    const response = await fetch(`http://localhost:5000/users/${loggedInUser.username}/pinned/${event._id}`, {
                        method: 'POST'
                    });
                    
                    if (response.ok) {
                        pinnedEvents.push(event);
                        showToast(`${event.name} pinned to dashboard!`);
                    } else {
                        throw new Error('Failed to pin event');
                    }
                } else {
                    const response = await fetch(`http://localhost:5000/users/${loggedInUser.username}/pinned/${event._id}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        pinnedEvents.splice(index, 1);
                        showToast(`${event.name} unpinned!`);
                    } else {
                        throw new Error('Failed to unpin event');
                    }
                }
                
                updatePinUI();
            } catch (error) {
                console.error("Error updating pin:", error);
                showToast("Failed to update pin. Please try again.", "error");
            }
        });

        updatePinUI();

        // Update attendee count
        function updateAttendeeCount() {
            const count = registeredEvents.length;
            document.getElementById("attendeesCount").textContent = count > 0 ? count : "-";
        }

        updateAttendeeCount();

        // Share functionality
        const shareButtons = document.querySelectorAll('.action-btn');
        if (shareButtons[2]) {
            shareButtons[2].addEventListener('click', () => {
                const url = window.location.href;
                if (navigator.share) {
                    navigator.share({
                        title: event.name,
                        text: `Check out this event: ${event.name}`,
                        url: url
                    }).then(() => {
                        showToast('📤 Event shared successfully!');
                    }).catch(err => {
                        console.log('Share failed:', err);
                        copyToClipboard(url);
                    });
                } else {
                    copyToClipboard(url);
                }
            });
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('🔗 Link copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy:', err);
                showToast(' Failed to copy link');
            });
        }

    } catch (error) {
        console.error(" Error loading event:", error);
        document.getElementById("eventName").innerText = "Error Loading Event";
        document.getElementById("eventTagline").innerText = "Please try again later";
    }
});

// Toast notification function
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
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            toast.remove();
            style.remove();
        }, 300);
    }, 3000);
}

