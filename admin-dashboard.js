// Check authentication and admin access
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'admin-login.html';
        return;
    }

    try {
        const user = JSON.parse(currentUser);
        if (user.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            window.location.href = 'admin-login.html';
            return;
        }
    } catch (err) {
        console.error('Error parsing user data:', err);
        window.location.href = 'admin-login.html';
        return;
    }

    // Logout handler
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = 'admin-login.html';
    });

    // Load organizers
    loadOrganizers();

    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Filter organizers
            const filter = tab.dataset.filter;
            filterOrganizers(filter);
        });
    });
});

let allOrganizers = [];

async function loadOrganizers() {
    try {
        const response = await fetch('http://localhost:5000/admin/organizers');
        
        if (!response.ok) {
            throw new Error('Failed to load organizers');
        }

        allOrganizers = await response.json();
        updateStats();
        displayOrganizers(allOrganizers);
    } catch (err) {
        console.error('Error loading organizers:', err);
        showToast('Failed to load organizers', 'error');
    }
}

function updateStats() {
    const pending = allOrganizers.filter(o => o.accountStatus === 'pending').length;
    const approved = allOrganizers.filter(o => o.accountStatus === 'approved').length;
    const rejected = allOrganizers.filter(o => o.accountStatus === 'rejected').length;
    const total = allOrganizers.length;

    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('approvedCount').textContent = approved;
    document.getElementById('rejectedCount').textContent = rejected;
    document.getElementById('totalCount').textContent = total;
}

function displayOrganizers(organizers) {
    const container = document.getElementById('organizersContainer');
    
    if (organizers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <h3>No organizers found</h3>
                <p>There are no organizer accounts matching this filter.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = organizers.map(organizer => createOrganizerRow(organizer)).join('');
}

function createOrganizerRow(organizer) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const createdDate = new Date(organizer.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    let approvalInfo = '';
    if (organizer.accountStatus !== 'pending' && organizer.approvedBy) {
        const approvedDate = new Date(organizer.approvedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        const action = organizer.accountStatus === 'approved' ? 'Approved' : 'Rejected';
        approvalInfo = `
            <div class="approval-info">
                ${action} by <strong>${organizer.approvedBy}</strong><br>
                on ${approvedDate}
            </div>
        `;
    }

    const isPending = organizer.accountStatus === 'pending';
    
    return `
        <div class="organizer-row" data-status="${organizer.accountStatus}">
            <div class="organizer-info">
                <h3>${organizer.fullName || 'N/A'}</h3>
                <p>@${organizer.username}</p>
            </div>
            <div class="organizer-info">
                <p>${organizer.email || 'No email provided'}</p>
            </div>
            <div>
                <span class="status-badge ${organizer.accountStatus}">
                    ${organizer.accountStatus}
                </span>
            </div>
            <div class="date-info">
                Registered on<br>
                <strong>${createdDate}</strong>
            </div>
            <div>
                ${isPending ? `
                    <div class="action-buttons">
                        <button class="btn-approve" onclick="approveOrganizer('${organizer.username}')">
                            ✓ Approve
                        </button>
                        <button class="btn-reject" onclick="rejectOrganizer('${organizer.username}')">
                            ✕ Reject
                        </button>
                    </div>
                ` : approvalInfo}
            </div>
        </div>
    `;
}

function filterOrganizers(filter) {
    let filtered = allOrganizers;
    
    if (filter !== 'all') {
        filtered = allOrganizers.filter(o => o.accountStatus === filter);
    }
    
    displayOrganizers(filtered);
}

async function approveOrganizer(username) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!confirm(`Are you sure you want to approve ${username}?`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/admin/approve-organizer/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                adminUsername: currentUser.username
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to approve organizer');
        }

        showToast(`${username} has been approved!`, 'success');
        loadOrganizers(); // Reload the list
    } catch (err) {
        console.error('Error approving organizer:', err);
        showToast(err.message, 'error');
    }
}

async function rejectOrganizer(username) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!confirm(`Are you sure you want to reject ${username}? This action cannot be undone easily.`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/admin/reject-organizer/${username}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                adminUsername: currentUser.username
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to reject organizer');
        }

        showToast(`${username} has been rejected`, 'success');
        loadOrganizers(); // Reload the list
    } catch (err) {
        console.error('Error rejecting organizer:', err);
        showToast(err.message, 'error');
    }
}

function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                      type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                      'linear-gradient(135deg, #667eea, #764ba2)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;

    // Add animation
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

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}
