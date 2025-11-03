document.addEventListener("DOMContentLoaded", async function () {
    console.log("🏆 Leaderboard Page Loaded!");

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    let currentSort = "points"; // Default sorting by points

    // Load leaderboard from database
    await loadLeaderboard(currentSort);

    // Function to load leaderboard from API
    async function loadLeaderboard(sortBy) {
        try {
            console.log(`📡 Loading leaderboard sorted by: ${sortBy}`);
            
            const response = await fetch(`${API_CONFIG.BASE_URL}/leaderboard?sortBy=${sortBy}&limit=100`);
            if (!response.ok) {
                throw new Error("Failed to load leaderboard data");
            }

            const data = await response.json();
            const leaderboard = data.leaderboard;
            const totalUsers = data.totalUsers;

            console.log("✅ Leaderboard Data Loaded:", leaderboard);

            updateLeaderboard(leaderboard, sortBy);
            
            // If user is logged in, highlight their row and show their rank
            if (loggedInUser) {
                highlightUserRow(loggedInUser.username);
                await showUserRank(loggedInUser.username);
            }
        } catch (error) {
            console.error("❌ Error loading leaderboard:", error);
            showError("Failed to load leaderboard. Please try again later.");
        }
    }

    // Function to update leaderboard display
    function updateLeaderboard(leaderboard, sortBy) {
        const leaderboardTable = document.querySelector("#leaderboard tbody");

        if (!leaderboardTable) {
            console.error("❌ Leaderboard table not found");
            return;
        }

        if (leaderboard.length === 0) {
            leaderboardTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px;">
                        No users found in leaderboard yet.
                    </td>
                </tr>
            `;
            return;
        }

        // Populate leaderboard table
        leaderboardTable.innerHTML = leaderboard
            .map((user, index) => {
                const rankIcon = getRankIcon(index + 1);
                const achievementBadges = getAchievementBadges(user.achievements);
                const isCurrentUser = loggedInUser && user.username === loggedInUser.username;
                const isOrganizer = user.eventsCreated > 0;
                
                return `
                    <tr class="${isCurrentUser ? 'current-user-row' : ''}" data-username="${user.username}">
                        <td class="rank-cell">
                            ${rankIcon}
                            <span class="rank-number">${user.rank}</span>
                        </td>
                        <td class="user-cell">
                            <div class="user-info">
                                <span class="user-name">${user.fullName || user.username}</span>
                                ${isCurrentUser ? '<span class="you-badge">YOU</span>' : ''}
                                ${isOrganizer ? '<span class="organizer-badge"><i class="fas fa-crown"></i> Organizer</span>' : ''}
                                ${achievementBadges}
                            </div>
                        </td>
                        <td class="points-cell">
                            <span class="points-value">${user.points}</span> <i class="fas fa-trophy" style="color: gold;"></i>
                        </td>
                        <td class="stat-cell">
                            ${isOrganizer ? `${user.eventsCreated} <i class="fas fa-calendar-check"></i>` : '-'}
                        </td>
                        <td class="stat-cell">${user.eventsAttended || 0} <i class="fas fa-ticket-alt"></i></td>
                    </tr>
                `;
            })
            .join("");

        // Update active sort button
        updateSortButtons(sortBy);
    }

    // Get rank icon based on position
    function getRankIcon(rank) {
        switch(rank) {
            case 1: return '<span class="rank-medal gold"><i class="fas fa-medal" style="color: #FFD700;"></i></span>';
            case 2: return '<span class="rank-medal silver"><i class="fas fa-medal" style="color: #C0C0C0;"></i></span>';
            case 3: return '<span class="rank-medal bronze"><i class="fas fa-medal" style="color: #CD7F32;"></i></span>';
            default: return '';
        }
    }

    // Get achievement badges
    function getAchievementBadges(achievements) {
        if (!achievements || achievements.length === 0) return '';
        
        const badgeMap = {
            'rookie': { icon: '<i class="fas fa-seedling"></i>', name: 'Rookie' },
            'rising_star': { icon: '<i class="fas fa-star" style="color: #FFD700;"></i>', name: 'Rising Star' },
            'pro': { icon: '<i class="fas fa-gem" style="color: #00CED1;"></i>', name: 'Pro' },
            'legend': { icon: '<i class="fas fa-crown" style="color: #FFD700;"></i>', name: 'Legend' },
            'event_master': { icon: '<i class="fas fa-theater-masks"></i>', name: 'Event Master' },
            'super_attendee': { icon: '<i class="fas fa-award" style="color: #9370DB;"></i>', name: 'Super Attendee' }
        };
        
        return achievements.slice(0, 3).map(achievement => {
            const badge = badgeMap[achievement];
            if (badge) {
                return `<span class="achievement-badge" title="${badge.name}">${badge.icon}</span>`;
            }
            return '';
        }).join('');
    }

    // Highlight current user's row
    function highlightUserRow(username) {
        const rows = document.querySelectorAll('#leaderboard tbody tr');
        rows.forEach(row => {
            if (row.dataset.username === username) {
                row.classList.add('highlight');
                // Scroll to user's row
                setTimeout(() => {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 500);
            }
        });
    }

    // Show user's rank in header
    async function showUserRank(username) {
        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/users/${username}/rank`);
            if (response.ok) {
                const data = await response.json();
                
                // Remove existing rank card if present
                const existingRankInfo = document.querySelector('.user-rank-info');
                if (existingRankInfo) {
                    existingRankInfo.remove();
                }
                
                // Display user rank info
                const rankInfo = document.createElement('div');
                rankInfo.className = 'user-rank-info';
                rankInfo.innerHTML = `
                    <div class="rank-card">
                        <h3>Your Ranking</h3>
                        <div class="rank-details">
                            <div class="rank-item">
                                <span class="rank-label">Rank</span>
                                <span class="rank-value">#${data.rank}</span>
                            </div>
                            <div class="rank-item">
                                <span class="rank-label">Points</span>
                                <span class="rank-value">${data.points} <i class="fas fa-trophy" style="color: gold;"></i></span>
                            </div>
                            <div class="rank-item">
                                <span class="rank-label">Top</span>
                                <span class="rank-value">${100 - data.percentile}%</span>
                            </div>
                        </div>
                    </div>
                `;
                
                const container = document.querySelector('.leaderboard-wrapper');
                if (container) {
                    // Insert after the leaderboard-header
                    const header = container.querySelector('.leaderboard-header');
                    if (header) {
                        header.insertAdjacentElement('afterend', rankInfo);
                    } else {
                        container.insertBefore(rankInfo, container.firstChild);
                    }
                }
            }
        } catch (error) {
            console.error("Error loading user rank:", error);
        }
    }

    // Update sort button states
    function updateSortButtons(activeSort) {
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[onclick="sortLeaderboard('${activeSort}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
    }

    // Function to change sorting method
    window.sortLeaderboard = async function (sortBy) {
        currentSort = sortBy;
        await loadLeaderboard(sortBy);
    };

    // Show error message
    function showError(message) {
        const leaderboardTable = document.querySelector("#leaderboard tbody");
        if (leaderboardTable) {
            leaderboardTable.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 20px; color: #e74c3c;">
                        ⚠️ ${message}
                    </td>
                </tr>
            `;
        }
    }

    // Auto-refresh leaderboard every 30 seconds
    setInterval(() => {
        loadLeaderboard(currentSort);
    }, 30000);
});

// Keep the old populateEventList function for compatibility
function populateEventList(events, listId) {
    const eventList = document.getElementById(listId);
    if (eventList) {
        eventList.innerHTML = events.map(event => `
            <li>
                <a href="event-template.html?event=${encodeURIComponent(event.name)}">${event.name}</a> - ${event.date}
            </li>
        `).join("");
    }
}
