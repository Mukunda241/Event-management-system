/**
 * Notification Manager - Frontend
 * Handles real-time notification display and management
 */

class NotificationManager {
  constructor() {
    this.username = null;
    this.unreadCount = 0;
    this.notifications = [];
    this.currentPage = 1;
    this.hasMore = true;
    this.isLoading = false;
    this.refreshInterval = null;
    
    this.init();
  }

  /**
   * Initialize notification system
   */
  init() {
    // Get logged-in user
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
      console.log('No user logged in');
      return;
    }

    this.username = loggedInUser.username;
    console.log('📬 Notification system initialized for:', this.username);

    // Set up notification bell
    this.setupNotificationBell();

    // Load initial unread count
    this.loadUnreadCount();

    // Set up auto-refresh (every 30 seconds)
    this.startAutoRefresh();

    // Listen for custom events
    this.setupEventListeners();
  }

  /**
   * Set up notification bell click handler
   */
  setupNotificationBell() {
    const notificationBtn = document.querySelector('.notification-btn');
    if (!notificationBtn) return;

    notificationBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleNotificationPanel();
    });

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('notification-panel');
      const btn = document.querySelector('.notification-btn');
      
      if (panel && panel.classList.contains('active')) {
        if (!panel.contains(e.target) && !btn.contains(e.target)) {
          this.closeNotificationPanel();
        }
      }
    });
  }

  /**
   * Toggle notification panel
   */
  async toggleNotificationPanel() {
    let panel = document.getElementById('notification-panel');
    
    if (!panel) {
      panel = this.createNotificationPanel();
      document.body.appendChild(panel);
    }

    if (panel.classList.contains('active')) {
      this.closeNotificationPanel();
    } else {
      panel.classList.add('active');
      
      // Load notifications if empty
      if (this.notifications.length === 0) {
        await this.loadNotifications();
      }
      
      this.renderNotifications();
    }
  }

  /**
   * Close notification panel
   */
  closeNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (panel) {
      panel.classList.remove('active');
    }
  }

  /**
   * Create notification panel HTML
   */
  createNotificationPanel() {
    const panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.className = 'notification-panel';
    
    panel.innerHTML = `
      <div class="notification-header">
        <h3>
          <i class="fas fa-bell"></i>
          Notifications
          <span class="notification-count-badge" id="panel-count-badge">0</span>
        </h3>
        <div class="notification-actions">
          <button class="btn-icon" onclick="notificationManager.markAllAsRead()" title="Mark all as read">
            <i class="fas fa-check-double"></i>
          </button>
          <button class="btn-icon" onclick="notificationManager.closeNotificationPanel()" title="Close">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <div class="notification-tabs">
        <button class="notification-tab active" data-filter="all" onclick="notificationManager.filterNotifications('all')">
          All
        </button>
        <button class="notification-tab" data-filter="unread" onclick="notificationManager.filterNotifications('unread')">
          Unread
        </button>
      </div>
      
      <div class="notification-list" id="notification-list">
        <div class="notification-loading">
          <div class="loading-spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
      
      <div class="notification-footer">
        <button class="btn-text" onclick="notificationManager.loadMore()" id="load-more-btn">
          Load More
        </button>
      </div>
    `;
    
    return panel;
  }

  /**
   * Load unread count
   */
  async loadUnreadCount() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/${this.username}/unread-count`);
      const data = await response.json();
      
      this.unreadCount = data.count;
      this.updateBadge();
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }

  /**
   * Load notifications
   */
  async loadNotifications(page = 1) {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/notifications/${this.username}?page=${page}&limit=20`);
      const data = await response.json();
      
      if (page === 1) {
        this.notifications = data.notifications;
      } else {
        this.notifications.push(...data.notifications);
      }
      
      this.currentPage = page;
      this.hasMore = data.pagination.hasMore;
      this.unreadCount = data.unreadCount;
      
      this.updateBadge();
      this.renderNotifications();
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.showError('Failed to load notifications');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Render notifications
   */
  renderNotifications() {
    const listContainer = document.getElementById('notification-list');
    if (!listContainer) return;

    // Update count badge in panel
    const panelBadge = document.getElementById('panel-count-badge');
    if (panelBadge) {
      panelBadge.textContent = this.unreadCount;
      panelBadge.style.display = this.unreadCount > 0 ? 'inline-block' : 'none';
    }

    // Filter notifications
    const activeFilter = document.querySelector('.notification-tab.active')?.dataset.filter || 'all';
    const filteredNotifications = activeFilter === 'unread' 
      ? this.notifications.filter(n => !n.isRead)
      : this.notifications;

    if (filteredNotifications.length === 0) {
      listContainer.innerHTML = `
        <div class="notification-empty">
          <i class="fas fa-bell-slash"></i>
          <p>No notifications</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filteredNotifications.map(notification => 
      this.createNotificationHTML(notification)
    ).join('');

    // Update load more button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.style.display = this.hasMore ? 'block' : 'none';
    }
  }

  /**
   * Create notification HTML
   */
  createNotificationHTML(notification) {
    const timeAgo = this.getTimeAgo(new Date(notification.createdAt));
    const priorityClass = notification.priority !== 'normal' ? `priority-${notification.priority}` : '';
    const unreadClass = !notification.isRead ? 'unread' : '';
    
    return `
      <div class="notification-item ${unreadClass} ${priorityClass}" data-id="${notification._id}">
        <div class="notification-icon ${notification.type}">
          <i class="fas ${notification.icon}"></i>
        </div>
        <div class="notification-content" onclick="notificationManager.handleNotificationClick('${notification._id}', '${notification.actionUrl || ''}')">
          <div class="notification-title">${notification.title}</div>
          <div class="notification-message">${notification.message}</div>
          <div class="notification-meta">
            <span class="notification-time">
              <i class="far fa-clock"></i>
              ${timeAgo}
            </span>
            ${notification.relatedEventName ? `
              <span class="notification-event">
                <i class="fas fa-calendar"></i>
                ${notification.relatedEventName}
              </span>
            ` : ''}
          </div>
          ${notification.actionLabel && notification.actionUrl ? `
            <div class="notification-action">
              <button class="btn-sm btn-primary">
                ${notification.actionLabel}
                <i class="fas fa-arrow-right"></i>
              </button>
            </div>
          ` : ''}
        </div>
        <div class="notification-menu">
          <button class="btn-icon-sm" onclick="notificationManager.toggleNotificationMenu(event, '${notification._id}')">
            <i class="fas fa-ellipsis-v"></i>
          </button>
          <div class="notification-dropdown" id="menu-${notification._id}">
            ${!notification.isRead ? `
              <button onclick="notificationManager.markAsRead('${notification._id}')">
                <i class="fas fa-check"></i>
                Mark as read
              </button>
            ` : ''}
            <button onclick="notificationManager.deleteNotification('${notification._id}')">
              <i class="fas fa-trash"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Handle notification click
   */
  async handleNotificationClick(notificationId, actionUrl) {
    // Mark as read
    await this.markAsRead(notificationId);
    
    // Navigate if URL exists
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  }

  /**
   * Toggle notification dropdown menu
   */
  toggleNotificationMenu(event, notificationId) {
    event.stopPropagation();
    
    // Close all other menus
    document.querySelectorAll('.notification-dropdown').forEach(menu => {
      if (menu.id !== `menu-${notificationId}`) {
        menu.classList.remove('active');
      }
    });
    
    // Toggle this menu
    const menu = document.getElementById(`menu-${notificationId}`);
    if (menu) {
      menu.classList.toggle('active');
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await fetch(`${API_CONFIG.BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      // Update local state
      const notification = this.notifications.find(n => n._id === notificationId);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.updateBadge();
        this.renderNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Mark all as read
   */
  async markAllAsRead() {
    try {
      await fetch(`${API_CONFIG.BASE_URL}/api/notifications/${this.username}/read-all`, {
        method: 'PUT'
      });
      
      // Update local state
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
      this.updateBadge();
      this.renderNotifications();
      
      if (window.showSuccess) {
        window.showSuccess('All notifications marked as read');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      if (window.showError) {
        window.showError('Failed to mark all as read');
      }
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      await fetch(`${API_CONFIG.BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE'
      });
      
      // Update local state
      const index = this.notifications.findIndex(n => n._id === notificationId);
      if (index > -1) {
        const notification = this.notifications[index];
        if (!notification.isRead) {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
        this.notifications.splice(index, 1);
        this.updateBadge();
        this.renderNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }

  /**
   * Filter notifications
   */
  filterNotifications(filter) {
    // Update active tab
    document.querySelectorAll('.notification-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    
    this.renderNotifications();
  }

  /**
   * Load more notifications
   */
  async loadMore() {
    if (this.hasMore && !this.isLoading) {
      await this.loadNotifications(this.currentPage + 1);
    }
  }

  /**
   * Update badge
   */
  updateBadge() {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
      badge.textContent = this.unreadCount;
      badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
    }
  }

  /**
   * Start auto-refresh
   */
  startAutoRefresh() {
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadUnreadCount();
      
      // If panel is open, refresh notifications
      const panel = document.getElementById('notification-panel');
      if (panel && panel.classList.contains('active')) {
        this.loadNotifications(1);
      }
    }, 30000);
  }

  /**
   * Stop auto-refresh
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Setup event listeners for custom events
   */
  setupEventListeners() {
    // Listen for custom notification events
    window.addEventListener('new-notification', (e) => {
      this.unreadCount++;
      this.updateBadge();
      
      // Show toast if available
      if (window.showInfo && e.detail) {
        window.showInfo(e.detail.message);
      }
    });
  }

  /**
   * Get time ago string
   */
  getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 7) return date.toLocaleDateString();
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  /**
   * Show error message
   */
  showError(message) {
    if (window.showError) {
      window.showError(message);
    } else {
      console.error(message);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopAutoRefresh();
    this.closeNotificationPanel();
  }
}

// Initialize notification manager on page load
let notificationManager;

document.addEventListener('DOMContentLoaded', () => {
  notificationManager = new NotificationManager();
  
  // Make it globally accessible
  window.notificationManager = notificationManager;
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (notificationManager) {
    notificationManager.destroy();
  }
});
