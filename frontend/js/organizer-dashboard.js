// organizer-dashboard.js - Dashboard functionality for event organizers

let loggedInOrganizer = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Setup logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    }
});

// Check if user is logged in
function checkAuth() {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    
    if (!user || user.role !== 'manager') {
        alert('Please login as an organizer to access this dashboard');
        window.location.href = 'login.html';
        return;
    }
    
    loggedInOrganizer = user;
    
    // Display organizer name in header
    const organizerNameEl = document.getElementById('organizerName');
    if (organizerNameEl && user.username) {
        organizerNameEl.textContent = user.username;
    }
    
    loadDashboard();
}

// Load dashboard data
async function loadDashboard() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/organizers/${loggedInOrganizer.username}/events`);
        
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        
        const data = await response.json();
        
        // Update statistics cards
        updateStatistics(data.overallStatistics);
        
        // Display events table
        displayEventsTable(data.events);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        showError('Failed to load dashboard data. Please try again.');
    }
}

// Update statistics cards
function updateStatistics(stats) {
    document.getElementById('totalEvents').textContent = stats.totalEvents || 0;
    document.getElementById('activeEvents').textContent = stats.activeEvents || 0;
    document.getElementById('totalBookings').textContent = stats.totalBookingsAllEvents || 0;
    document.getElementById('totalRevenue').textContent = `₹${stats.totalRevenueAllEvents || 0}`;
}

// Display events in table format
function displayEventsTable(events) {
    const container = document.getElementById('eventsTableContainer');
    
    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <h3>No Events Yet</h3>
                <p>Create your first event to see analytics here!</p>
                <a href="event-management.html" class="btn btn-primary" style="margin-top: 20px;">Create Event</a>
            </div>
        `;
        return;
    }
    
    let tableHTML = `
        <table class="event-table">
            <thead>
                <tr>
                    <th>Event Name</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                    <th>Bookings</th>
                    <th>Capacity</th>
                    <th>Revenue</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    events.forEach(event => {
        const statusClass = `status-${event.status.toLowerCase()}`;
        const capacityPercent = event.statistics.capacityPercentage;
        const capacityColor = capacityPercent >= 90 ? '#e74c3c' : capacityPercent >= 70 ? '#f39c12' : '#27ae60';
        
        tableHTML += `
            <tr>
                <td><strong>${event.name}</strong><br><small style="color: #666;">${event.category || 'General'}</small></td>
                <td>${formatDate(event.date)}<br><small style="color: #666;">${event.time}</small></td>
                <td><span class="status-badge ${statusClass}">${event.status}</span></td>
                <td><strong>${event.statistics.totalBookings}</strong></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <span>${event.statistics.totalTickets} / ${event.capacity}</span>
                        <span style="color: ${capacityColor}; font-weight: bold;">(${capacityPercent}%)</span>
                    </div>
                    <div style="background: #e0e0e0; height: 4px; border-radius: 2px; margin-top: 5px;">
                        <div style="background: ${capacityColor}; width: ${capacityPercent}%; height: 100%; border-radius: 2px;"></div>
                    </div>
                </td>
                <td><strong style="color: #27ae60;">₹${event.statistics.totalRevenue}</strong></td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn btn-view" onclick="viewBookings('${event._id}', '${event.name}')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            View
                        </button>
                        <button class="action-btn btn-export" onclick="exportCSV('${event._id}', '${event.name}')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 16px; height: 16px;">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Export
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

// View bookings for a specific event
async function viewBookings(eventId, eventName) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/events/${eventId}/bookings`);
        
        if (!response.ok) {
            throw new Error('Failed to load bookings');
        }
        
        const data = await response.json();
        displayBookingsModal(data, eventName);
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        alert('Failed to load bookings. Please try again.');
    }
}

// Display bookings in modal
function displayBookingsModal(data, eventName) {
    const modal = document.getElementById('bookingsModal');
    const modalBody = document.getElementById('modalBody');
    const modalEventName = document.getElementById('modalEventName');
    
    modalEventName.textContent = `${eventName} - Bookings`;
    
    let modalContent = `
        <div class="booking-stats">
            <div class="booking-stat">
                <div class="booking-stat-label">Total Bookings</div>
                <div class="booking-stat-value">${data.statistics.totalBookings}</div>
            </div>
            <div class="booking-stat">
                <div class="booking-stat-label">Total Tickets</div>
                <div class="booking-stat-value">${data.statistics.totalTickets}</div>
            </div>
            <div class="booking-stat">
                <div class="booking-stat-label">Revenue</div>
                <div class="booking-stat-value" style="color: #27ae60;">₹${data.statistics.totalRevenue}</div>
            </div>
            <div class="booking-stat">
                <div class="booking-stat-label">Available Seats</div>
                <div class="booking-stat-value" style="color: #3498db;">${data.statistics.availableSeats}</div>
            </div>
        </div>
    `;
    
    if (data.bookings && data.bookings.length > 0) {
        modalContent += `
            <h3 style="margin-top: 25px; margin-bottom: 15px;">Attendee List</h3>
            <table class="bookings-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Tickets</th>
                        <th>Amount</th>
                        <th>Booked On</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.bookings.forEach(booking => {
            modalContent += `
                <tr>
                    <td><strong>${booking.fullName}</strong><br><small style="color: #666;">@${booking.username}</small></td>
                    <td>${booking.email}</td>
                    <td>${booking.quantity}</td>
                    <td><strong style="color: #27ae60;">₹${booking.totalAmount}</strong></td>
                    <td>${formatDateTime(booking.registeredAt)}</td>
                </tr>
            `;
        });
        
        modalContent += `
                </tbody>
            </table>
        `;
    } else {
        modalContent += `
            <div class="empty-state">
                <p>No bookings yet for this event.</p>
            </div>
        `;
    }
    
    modalBody.innerHTML = modalContent;
    modal.classList.add('active');
}

// Close bookings modal
function closeBookingsModal() {
    const modal = document.getElementById('bookingsModal');
    modal.classList.remove('active');
}

// Export bookings to CSV
async function exportCSV(eventId, eventName) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/events/${eventId}/bookings`);
        
        if (!response.ok) {
            throw new Error('Failed to load bookings');
        }
        
        const data = await response.json();
        
        if (!data.bookings || data.bookings.length === 0) {
            alert('No bookings to export for this event.');
            return;
        }
        
        // Create CSV content
        let csvContent = 'Name,Username,Email,Tickets,Amount,Payment Status,Booking Date\n';
        
        data.bookings.forEach(booking => {
            csvContent += `"${booking.fullName}","${booking.username}","${booking.email}",${booking.quantity},${booking.totalAmount},"${booking.paymentStatus}","${formatDateTime(booking.registeredAt)}"\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const fileName = `${eventName.replace(/[^a-z0-9]/gi, '_')}_Bookings_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert(`✅ Bookings exported successfully!\n\nFile: ${fileName}`);
        
    } catch (error) {
        console.error('Error exporting bookings:', error);
        alert('Failed to export bookings. Please try again.');
    }
}

// Utility: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Utility: Format date and time
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    return `${date.toLocaleDateString('en-US', dateOptions)} ${date.toLocaleTimeString('en-US', timeOptions)}`;
}

// Utility: Show error message
function showError(message) {
    const container = document.getElementById('eventsTableContainer');
    container.innerHTML = `
        <div class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #e74c3c;">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="loadDashboard()" style="margin-top: 20px;">Retry</button>
        </div>
    `;
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('bookingsModal');
    if (event.target === modal) {
        closeBookingsModal();
    }
}
