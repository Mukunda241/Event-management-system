# 📬 Notification System - Quick Reference

## 🚀 Getting Started

### 1. Test the System
```
http://localhost:5000/notification-test.html
```
- Enter your username
- Click any button to create notifications
- Watch the bell icon update!

### 2. See It in Action
Open any page with the header (e.g., index.html):
```
http://localhost:5000/index.html
```
- Login with your account
- Look at top-right corner for notification bell 🔔
- Click bell to see your notifications

---

## 📍 Where is the Notification Bell?

The bell appears in **every page** that includes these files:
```html
<link rel="stylesheet" href="notifications.css">
<script src="notifications.js"></script>
```

**Already added to:** `index.html` ✅

**To add to other pages:**
```html
<head>
    <!-- Add these lines -->
    <link rel="stylesheet" href="notifications.css">
    <script src="notifications.js"></script>
</head>
```

---

## 🎯 How to Create Notifications

### Method 1: Using the Service (Backend)
```javascript
const NotificationService = require('./notification-service');

await NotificationService.create({
  recipientUsername: 'john_doe',
  type: 'event_created',
  title: '🎉 New Event!',
  message: 'Summer Festival is now open',
  icon: 'fa-calendar-plus',
  priority: 'high',
  actionUrl: 'event.html?id=123',
  actionLabel: 'View Event'
});
```

### Method 2: Using the API (Frontend/Testing)
```javascript
fetch('/api/notifications/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'john_doe' })
});
```

---

## 📊 API Quick Reference

```javascript
// Get notifications
GET /api/notifications/:username?page=1&limit=20

// Get unread count
GET /api/notifications/:username/unread-count

// Mark as read
PUT /api/notifications/:notificationId/read

// Mark all as read
PUT /api/notifications/:username/read-all

// Delete
DELETE /api/notifications/:notificationId
```

---

## 🎨 Notification Types

| Code | Icon | Color | When to Use |
|------|------|-------|-------------|
| `event_created` | 🎉 | Purple | New event |
| `event_updated` | 📝 | Orange | Event changed |
| `event_cancelled` | ❌ | Red | Event cancelled |
| `event_reminder` | ⏰ | Blue | Event tomorrow |
| `registration_success` | ✅ | Green | Registered |
| `points_earned` | 🎁 | Gold | Earned points |
| `achievement_unlocked` | 🏆 | Purple | Achievement |
| `new_attendee` | 👥 | Teal | Someone registered |
| `manager_approved` | ✅ | Green | Approved |
| `system_announcement` | 📢 | Dark | Announcement |

---

## 💡 Common Use Cases

### When Event is Created:
```javascript
await NotificationService.notifyEventCreated(event, creatorUsername);
```

### When Someone Registers:
```javascript
// Notify user
await NotificationService.notifyRegistrationSuccess(username, event, ticketIds);

// Notify organizer
await NotificationService.notifyNewAttendee(event.organizer, event, userName);
```

### When User Earns Points:
```javascript
await NotificationService.notifyPointsEarned(username, 20, 'registering for event', eventName);
```

### System Announcement:
```javascript
await NotificationService.broadcastAnnouncement(
  'Maintenance Tonight',
  'System will be down 2-4 AM',
  'urgent'
);
```

---

## 🔧 Configuration

### Change Auto-Refresh Time:
File: `notifications.js` (line ~340)
```javascript
this.refreshInterval = setInterval(() => {
  this.loadUnreadCount();
}, 30000); // Change to 60000 for 1 minute
```

### Change Notification Expiry:
File: `notification-service.js` (line ~15)
```javascript
expiresInDays = 30 // Change to 60 for 2 months
```

### Change Items Per Page:
File: `notifications.js` (line ~10)
```javascript
this.limit = 20 // Change to 50 for more per page
```

---

## 🐛 Quick Fixes

### Bell Not Showing?
1. Check if CSS is loaded: `notifications.css`
2. Check if JS is loaded: `notifications.js`
3. Check browser console for errors
4. Make sure user is logged in

### Badge Not Updating?
1. Open browser console
2. Type: `notificationManager.loadUnreadCount()`
3. Check username: `notificationManager.username`

### Notifications Not Loading?
1. Check server is running: `http://localhost:5000`
2. Test API directly: `curl http://localhost:5000/api/notifications/USERNAME`
3. Check MongoDB is running

---

## ✅ Testing Checklist

- [ ] Server running (`node server.js`)
- [ ] Open test page (notification-test.html)
- [ ] Enter username
- [ ] Create test notification
- [ ] Check bell badge updates
- [ ] Click bell to open panel
- [ ] Click notification (should mark as read)
- [ ] Test "Mark all as read"
- [ ] Test "Delete notification"
- [ ] Check auto-refresh (wait 30s)
- [ ] Test on mobile view
- [ ] Test dark mode

---

## 📱 Mobile Responsive

The notification system is **fully responsive**:
- ✅ Panel adjusts to screen size
- ✅ Touch-friendly buttons
- ✅ Works on iOS/Android
- ✅ Optimized for small screens

---

## 🌙 Dark Mode

Dark mode is **automatically supported**:
- ✅ Dark panel background
- ✅ Light text colors
- ✅ Proper contrast
- ✅ Smooth transitions

---

## 🎓 Learn More

**Full Documentation:**
- `NOTIFICATIONS_GUIDE.md` - Complete technical guide
- `NOTIFICATION_SUMMARY.md` - Implementation summary

**Test It:**
- `notification-test.html` - Interactive testing dashboard

**Code:**
- `notifications-schema.js` - Database schema
- `notification-service.js` - Backend service
- `notifications.js` - Frontend manager
- `notifications.css` - Styles & animations

---

## 🎉 You're Ready!

The notification system is **fully functional** and ready to use!

**Quick Start:**
1. ✅ Server is running
2. ✅ Test page: http://localhost:5000/notification-test.html
3. ✅ Check bell on: http://localhost:5000/index.html

**What Works:**
- ✅ Real-time notifications
- ✅ Unread badge
- ✅ Mark as read
- ✅ Auto-refresh
- ✅ Dark mode
- ✅ Mobile responsive

**Status:** 🚀 **PRODUCTION READY!**
