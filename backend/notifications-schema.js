/**
 * Notification Schema for MongoDB
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientUsername: { 
    type: String, 
    required: true,
    index: true // For faster queries
  },
  
  type: { 
    type: String, 
    required: true,
    enum: [
      'event_created',      // New event was created
      'event_updated',      // Event details changed
      'event_cancelled',    // Event was cancelled
      'event_reminder',     // Event starts soon
      'registration_success', // Successfully registered
      'registration_cancelled', // Registration cancelled
      'favorite_event_update', // Update to favorited event
      'points_earned',      // Earned points
      'achievement_unlocked', // New achievement
      'manager_approved',   // Manager account approved
      'manager_rejected',   // Manager account rejected
      'new_attendee',       // Someone registered for your event
      'system_announcement' // System-wide announcement
    ]
  },
  
  title: { 
    type: String, 
    required: true 
  },
  
  message: { 
    type: String, 
    required: true 
  },
  
  icon: { 
    type: String, 
    default: 'fa-bell' // Font Awesome icon class
  },
  
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Related data
  relatedEvent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event' 
  },
  
  relatedEventName: { 
    type: String 
  },
  
  relatedUser: { 
    type: String // Username
  },
  
  // Action link
  actionUrl: { 
    type: String // URL to navigate when clicked
  },
  
  actionLabel: { 
    type: String // Button text (e.g., "View Event")
  },
  
  // Status
  isRead: { 
    type: Boolean, 
    default: false,
    index: true
  },
  
  isArchived: { 
    type: Boolean, 
    default: false 
  },
  
  // Metadata
  metadata: { 
    type: mongoose.Schema.Types.Mixed // Additional data
  },
  
  expiresAt: { 
    type: Date // Auto-delete old notifications
  }
}, { 
  timestamps: true // Adds createdAt and updatedAt
});

// Indexes for performance
notificationSchema.index({ recipientUsername: 1, isRead: 1 });
notificationSchema.index({ recipientUsername: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Virtual for time ago
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) return this.createdAt.toLocaleDateString();
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
});

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.isRead = true;
  return await this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  return await notification.save();
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(username) {
  return await this.countDocuments({ 
    recipientUsername: username, 
    isRead: false,
    isArchived: false
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(username) {
  return await this.updateMany(
    { recipientUsername: username, isRead: false },
    { isRead: true }
  );
};

module.exports = mongoose.model('Notification', notificationSchema);
