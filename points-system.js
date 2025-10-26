// 🏆 Points System Utilities
// Load and display user points across the application

/**
 * Load user points from the backend
 * @param {string} username - Username to load points for
 * @returns {Promise<Object>} User points data
 */
async function loadUserPoints(username) {
    try {
        const response = await fetch(`http://localhost:5000/users/${username}/points`);
        if (!response.ok) {
            throw new Error('Failed to load user points');
        }
        
        const data = await response.json();
        console.log('🏆 User Points Loaded:', data);
        return data;
    } catch (error) {
        console.error('❌ Error loading user points:', error);
        return null;
    }
}

/**
 * Update points display on the page
 * @param {number} points - Number of points to display
 */
function updatePointsDisplay(points) {
    const pointsElement = document.getElementById('points-count');
    if (pointsElement) {
        // Animate the points update
        const currentPoints = parseInt(pointsElement.textContent) || 0;
        animateValue(pointsElement, currentPoints, points, 500);
    }
}

/**
 * Animate number changes
 */
function animateValue(element, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (range * progress));
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * Show points earned notification
 * @param {number} points - Points earned
 * @param {string} description - What action earned the points
 */
function showPointsNotification(points, description) {
    const notification = document.createElement('div');
    notification.className = 'points-notification';
    notification.innerHTML = `
        <div class="points-notification-content">
            <span class="points-icon"><i class="fas fa-trophy" style="color: gold; font-size: 24px;"></i></span>
            <div class="points-info">
                <strong class="points-amount">+${points} Points!</strong>
                <p class="points-description">${description}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/**
 * Check and award daily login bonus
 * @param {string} username - Username to award bonus to
 */
async function checkDailyLoginBonus(username) {
    try {
        const response = await fetch(`http://localhost:5000/users/${username}/daily-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
            throw new Error('Failed to check daily login');
        }
        
        const data = await response.json();
        
        if (!data.alreadyClaimed) {
            showPointsNotification(5, 'Daily login bonus!');
            
            // Update points display
            const pointsData = await loadUserPoints(username);
            if (pointsData) {
                updatePointsDisplay(pointsData.points);
            }
        }
        
        return data;
    } catch (error) {
        console.error('❌ Error checking daily login bonus:', error);
        return null;
    }
}

/**
 * Get user's rank information
 * @param {string} username - Username to get rank for
 * @returns {Promise<Object>} Rank data
 */
async function getUserRank(username) {
    try {
        const response = await fetch(`http://localhost:5000/users/${username}/rank`);
        if (!response.ok) {
            throw new Error('Failed to load user rank');
        }
        
        const data = await response.json();
        console.log('🏅 User Rank:', data);
        return data;
    } catch (error) {
        console.error('❌ Error loading user rank:', error);
        return null;
    }
}

/**
 * Get achievement badge HTML
 * @param {Array} achievements - Array of achievement IDs
 * @returns {string} HTML for achievement badges
 */
function getAchievementBadges(achievements) {
    if (!achievements || achievements.length === 0) return '';
    
    const badgeMap = {
        'rookie': { icon: '<i class="fas fa-seedling"></i>', name: 'Rookie', description: 'Earned 100 points' },
        'rising_star': { icon: '<i class="fas fa-star" style="color: #FFD700;"></i>', name: 'Rising Star', description: 'Earned 500 points' },
        'pro': { icon: '<i class="fas fa-gem" style="color: #00CED1;"></i>', name: 'Pro', description: 'Earned 1000 points' },
        'legend': { icon: '<i class="fas fa-crown" style="color: #FFD700;"></i>', name: 'Legend', description: 'Earned 2500 points' },
        'event_master': { icon: '<i class="fas fa-theater-masks"></i>', name: 'Event Master', description: 'Created 10 events' },
        'super_attendee': { icon: '<i class="fas fa-award" style="color: #9370DB;"></i>', name: 'Super Attendee', description: 'Attended 20 events' }
    };
    
    return achievements.map(achievement => {
        const badge = badgeMap[achievement];
        if (badge) {
            return `
                <span class="achievement-badge" title="${badge.name} - ${badge.description}">
                    ${badge.icon}
                </span>
            `;
        }
        return '';
    }).join('');
}

/**
 * Display points history
 * @param {Array} history - Array of point history items
 * @param {string} containerId - ID of container element
 */
function displayPointsHistory(history, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (!history || history.length === 0) {
        container.innerHTML = '<p class="no-history">No points history yet.</p>';
        return;
    }
    
    container.innerHTML = history.map(item => {
        const date = new Date(item.timestamp);
        const dateStr = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const actionIcon = getActionIcon(item.action);
        const pointsClass = item.points > 0 ? 'points-positive' : 'points-negative';
        
        return `
            <div class="history-item">
                <span class="history-icon">${actionIcon}</span>
                <div class="history-details">
                    <p class="history-description">${item.description}</p>
                    <span class="history-date">${dateStr}</span>
                </div>
                <span class="history-points ${pointsClass}">+${item.points}</span>
            </div>
        `;
    }).join('');
}

/**
 * Get icon for action type
 */
function getActionIcon(action) {
    const iconMap = {
        'registration': '<i class="fas fa-user-plus"></i>',
        'event_created': '<i class="fas fa-calendar-plus"></i>',
        'ticket_booked': '<i class="fas fa-ticket-alt"></i>',
        'event_attended': '<i class="fas fa-check-circle"></i>',
        'daily_login': '<i class="fas fa-calendar-day"></i>',
        'achievement': '<i class="fas fa-trophy"></i>',
        'referral': '<i class="fas fa-user-friends"></i>',
        'review': '<i class="fas fa-star"></i>'
    };
    
    return iconMap[action] || '<i class="fas fa-bullseye"></i>';
}

/**
 * Initialize points system on page load
 */
async function initializePointsSystem() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser || !loggedInUser.username) {
        console.log('No user logged in, skipping points system initialization');
        return;
    }
    
    console.log('🏆 Initializing Points System for:', loggedInUser.username);
    
    try {
        // Load user points
        const pointsData = await loadUserPoints(loggedInUser.username);
        if (pointsData) {
            updatePointsDisplay(pointsData.points);
        }
        
        // Check daily login bonus
        await checkDailyLoginBonus(loggedInUser.username);
        
    } catch (error) {
        console.error('❌ Error initializing points system:', error);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePointsSystem);
} else {
    initializePointsSystem();
}
