/**
 * Notification Service
 * Handles creation and management of notifications
 */

const Notification = require('./notifications-schema');

class NotificationService {
  /**
   * Create a notification
   */
  static async create({
    recipientUsername,
    type,
    title,
    message,
    icon = 'fa-bell',
    priority = 'normal',
    relatedEvent = null,
    relatedEventName = null,
    relatedUser = null,
    actionUrl = null,
    actionLabel = null,
    metadata = {},
    expiresInDays = 30
  }) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      const notification = await Notification.createNotification({
        recipientUsername,
        type,
        title,
        message,
        icon,
        priority,
        relatedEvent,
        relatedEventName,
        relatedUser,
        actionUrl,
        actionLabel,
        metadata,
        expiresAt
      });

      console.log(`📬 Notification created for ${recipientUsername}: ${title}`);
      return notification;
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Notify when a new event is created
   */
  static async notifyEventCreated(event, creatorUsername) {
    // Notify all users except the creator
    const User = require('./server').User; // Import User model
    const users = await User.find({ 
      username: { $ne: creatorUsername },
      role: { $in: ['user', 'manager'] }
    });

    const notifications = users.map(user => 
      this.create({
        recipientUsername: user.username,
        type: 'event_created',
        title: '🎉 New Event Available!',
        message: `${event.name} is now open for registration`,
        icon: 'fa-calendar-plus',
        priority: 'normal',
        relatedEvent: event._id,
        relatedEventName: event.name,
        relatedUser: creatorUsername,
        actionUrl: `event-template.html?id=${event._id}`,
        actionLabel: 'View Event'
      })
    );

    return await Promise.all(notifications);
  }

  /**
   * Notify when event is updated
   */
  static async notifyEventUpdated(event, registeredUsers) {
    const notifications = registeredUsers.map(user => 
      this.create({
        recipientUsername: user.username,
        type: 'event_updated',
        title: '📝 Event Updated',
        message: `${event.name} has been updated. Check the latest details.`,
        icon: 'fa-edit',
        priority: 'high',
        relatedEvent: event._id,
        relatedEventName: event.name,
        actionUrl: `event-template.html?id=${event._id}`,
        actionLabel: 'View Changes'
      })
    );

    return await Promise.all(notifications);
  }

  /**
   * Notify when event is cancelled
   */
  static async notifyEventCancelled(event, registeredUsers) {
    const notifications = registeredUsers.map(user => 
      this.create({
        recipientUsername: user.username,
        type: 'event_cancelled',
        title: '❌ Event Cancelled',
        message: `${event.name} has been cancelled. We apologize for any inconvenience.`,
        icon: 'fa-times-circle',
        priority: 'urgent',
        relatedEvent: event._id,
        relatedEventName: event.name,
        actionUrl: 'events.html',
        actionLabel: 'Browse Events'
      })
    );

    return await Promise.all(notifications);
  }

  /**
   * Notify event reminder (1 day before)
   */
  static async notifyEventReminder(event, registeredUsers) {
    const notifications = registeredUsers.map(user => 
      this.create({
        recipientUsername: user.username,
        type: 'event_reminder',
        title: '⏰ Event Reminder',
        message: `${event.name} is tomorrow at ${event.time}!`,
        icon: 'fa-clock',
        priority: 'high',
        relatedEvent: event._id,
        relatedEventName: event.name,
        actionUrl: `event-template.html?id=${event._id}`,
        actionLabel: 'View Details'
      })
    );

    return await Promise.all(notifications);
  }

  /**
   * Notify successful registration
   */
  static async notifyRegistrationSuccess(username, event, ticketIds) {
    return await this.create({
      recipientUsername: username,
      type: 'registration_success',
      title: '✅ Registration Successful!',
      message: `You're registered for ${event.name}. Your ticket${ticketIds.length > 1 ? 's' : ''}: ${ticketIds.join(', ')}`,
      icon: 'fa-check-circle',
      priority: 'high',
      relatedEvent: event._id,
      relatedEventName: event.name,
      actionUrl: 'my-tickets.html',
      actionLabel: 'View Tickets',
      metadata: { ticketIds }
    });
  }

  /**
   * Notify organizer of new attendee
   */
  static async notifyNewAttendee(organizerUsername, event, attendeeName) {
    return await this.create({
      recipientUsername: organizerUsername,
      type: 'new_attendee',
      title: '👥 New Registration!',
      message: `${attendeeName} registered for ${event.name}`,
      icon: 'fa-user-plus',
      priority: 'normal',
      relatedEvent: event._id,
      relatedEventName: event.name,
      relatedUser: attendeeName,
      actionUrl: `event-management.html?id=${event._id}`,
      actionLabel: 'View Attendees'
    });
  }

  /**
   * Notify points earned
   */
  static async notifyPointsEarned(username, points, reason, eventName = null) {
    return await this.create({
      recipientUsername: username,
      type: 'points_earned',
      title: '🎁 Points Earned!',
      message: `You earned ${points} points for ${reason}`,
      icon: 'fa-star',
      priority: 'normal',
      relatedEventName: eventName,
      actionUrl: 'leaderboard.html',
      actionLabel: 'View Leaderboard',
      metadata: { points, reason }
    });
  }

  /**
   * Notify achievement unlocked
   */
  static async notifyAchievementUnlocked(username, achievementName, achievementDescription) {
    return await this.create({
      recipientUsername: username,
      type: 'achievement_unlocked',
      title: '🏆 Achievement Unlocked!',
      message: `${achievementName}: ${achievementDescription}`,
      icon: 'fa-trophy',
      priority: 'high',
      actionUrl: 'profile.html',
      actionLabel: 'View Profile',
      metadata: { achievement: achievementName }
    });
  }

  /**
   * Notify manager approval/rejection
   */
  static async notifyManagerStatus(username, approved, approverName = null) {
    if (approved) {
      return await this.create({
        recipientUsername: username,
        type: 'manager_approved',
        title: '✅ Manager Account Approved!',
        message: `Your manager account has been approved by ${approverName || 'admin'}. You can now create events!`,
        icon: 'fa-check-circle',
        priority: 'urgent',
        actionUrl: 'organizer-dashboard.html',
        actionLabel: 'Create Event'
      });
    } else {
      return await this.create({
        recipientUsername: username,
        type: 'manager_rejected',
        title: '❌ Manager Account Rejected',
        message: 'Your manager account request has been rejected. Please contact support for more information.',
        icon: 'fa-times-circle',
        priority: 'urgent',
        actionUrl: 'index.html',
        actionLabel: 'Go Home'
      });
    }
  }

  /**
   * System announcement to all users
   */
  static async broadcastAnnouncement(title, message, priority = 'normal') {
    const User = require('./server').User;
    const users = await User.find({});

    const notifications = users.map(user => 
      this.create({
        recipientUsername: user.username,
        type: 'system_announcement',
        title: `📢 ${title}`,
        message,
        icon: 'fa-bullhorn',
        priority,
        actionUrl: 'index.html',
        actionLabel: 'Learn More'
      })
    );

    return await Promise.all(notifications);
  }

  /**
   * Get user's notifications (paginated)
   */
  static async getUserNotifications(username, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({
      recipientUsername: username,
      isArchived: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

    const total = await Notification.countDocuments({
      recipientUsername: username,
      isArchived: false
    });

    const unreadCount = await Notification.getUnreadCount(username);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      },
      unreadCount
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (notification) {
      await notification.markAsRead();
    }
    return notification;
  }

  /**
   * Mark all as read
   */
  static async markAllAsRead(username) {
    return await Notification.markAllAsRead(username);
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId) {
    return await Notification.findByIdAndDelete(notificationId);
  }

  /**
   * Archive notification
   */
  static async archiveNotification(notificationId) {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isArchived: true },
      { new: true }
    );
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(username) {
    return await Notification.getUnreadCount(username);
  }

  /**
   * Clean old notifications (run as cron job)
   */
  static async cleanOldNotifications(daysOld = 60) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true
    });

    console.log(`🧹 Cleaned ${result.deletedCount} old notifications`);
    return result;
  }
}

module.exports = NotificationService;
