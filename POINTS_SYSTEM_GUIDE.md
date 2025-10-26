# 🏆 Points Management System - Complete Guide

## 📊 Overview

The EventPulse Points System is a gamification feature that rewards users for their engagement and activity on the platform. Users earn points for various actions, and their rankings are displayed on the leaderboard.

---

## 🎯 Points Earning Rules

### **User Activities & Points**

| Action | Points Earned | Description |
|--------|---------------|-------------|
| **Register Account** | +50 | Welcome bonus for new users |
| **Complete Profile** | +25 | Add profile picture & bio |
| **Create Event** | +100 | Organizers earn points for creating events |
| **Attend Event** | +50 | Booking a ticket to an event |
| **Event Gets 5★ Rating** | +20 | When your event receives 5-star rating |
| **Event Gets 4★ Rating** | +10 | When your event receives 4-star rating |
| **Refer a Friend** | +75 | When referred user registers |
| **Daily Login** | +5 | Login once per day |
| **Share Event** | +15 | Share event on social media |
| **Write Review** | +10 | Leave a review for attended event |
| **Favorite 10 Events** | +30 | Milestone achievement |
| **Host 5 Events** | +200 | Organizer milestone |
| **100 Attendees** | +150 | Event reaches 100 bookings |

---

## 🗄️ Database Schema

### **User Schema Updates**

```javascript
{
  username: String,
  fullName: String,
  email: String,
  passwordHash: String,
  role: String,
  
  // 🆕 POINTS SYSTEM FIELDS
  points: { 
    type: Number, 
    default: 50 // Welcome bonus
  },
  pointsHistory: [{
    action: String,        // What action earned the points
    points: Number,        // Points earned/deducted
    eventId: String,       // Related event (if applicable)
    timestamp: Date,       // When it happened
    description: String    // Human-readable description
  }],
  lastLogin: Date,         // Track daily login bonus
  totalEventsCreated: { type: Number, default: 0 },
  totalEventsAttended: { type: Number, default: 0 },
  achievements: [String]   // Array of unlocked achievements
}
```

---

## 🔌 API Endpoints

### **1. Get User Points**
```
GET /users/:username/points
```
**Response:**
```json
{
  "username": "john_doe",
  "points": 245,
  "rank": 5,
  "totalUsers": 150,
  "history": [
    {
      "action": "event_created",
      "points": 100,
      "description": "Created 'Tech Conference 2025'",
      "timestamp": "2025-01-20T10:30:00Z"
    }
  ]
}
```

---

### **2. Add Points**
```
POST /users/:username/points/add
```
**Request Body:**
```json
{
  "action": "event_attended",
  "points": 50,
  "eventId": "event123",
  "description": "Attended Music Festival"
}
```

---

### **3. Get Leaderboard**
```
GET /leaderboard?limit=100&sortBy=points
```
**Response:**
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "username": "alice_smith",
      "fullName": "Alice Smith",
      "points": 1250,
      "eventsCreated": 8,
      "eventsAttended": 15,
      "badges": ["Top Creator", "Super Attendee"]
    }
  ],
  "totalUsers": 150
}
```

---

### **4. Get User Rank**
```
GET /users/:username/rank
```
**Response:**
```json
{
  "username": "john_doe",
  "rank": 12,
  "points": 485,
  "percentile": 92
}
```

---

## 🎨 Frontend Integration

### **1. Display User Points (index.html)**
```javascript
// Load user points dynamically
async function loadUserPoints() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return;
  
  try {
    const response = await fetch(`http://localhost:5000/users/${user.username}/points`);
    const data = await response.json();
    
    document.getElementById('points-count').textContent = data.points;
  } catch (error) {
    console.error('Failed to load points:', error);
  }
}
```

---

### **2. Real-time Leaderboard**
```javascript
// Load leaderboard from database
async function loadLeaderboard() {
  try {
    const response = await fetch('http://localhost:5000/leaderboard?limit=50');
    const data = await response.json();
    
    displayLeaderboard(data.leaderboard);
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
  }
}
```

---

### **3. Points Notification**
```javascript
// Show points earned notification
function showPointsNotification(points, action) {
  const notification = document.createElement('div');
  notification.className = 'points-notification';
  notification.innerHTML = `
    <span class="points-icon">🏆</span>
    <div>
      <strong>+${points} Points!</strong>
      <p>${action}</p>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
}
```

---

## 🔥 Points Earning Integration

### **Example 1: Award Points on Event Creation**
```javascript
// In event-management.js (when creating event)
app.post("/events", async (req, res) => {
  // Create event...
  const newEvent = await event.save();
  
  // Award points to organizer
  await fetch(`http://localhost:5000/users/${organizer}/points/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'event_created',
      points: 100,
      eventId: newEvent._id,
      description: `Created event: ${newEvent.name}`
    })
  });
});
```

---

### **Example 2: Award Points on Ticket Booking**
```javascript
// In my-tickets.js (when booking ticket)
async function bookTicket(eventId) {
  // Book ticket...
  
  // Award points
  await fetch(`http://localhost:5000/users/${username}/points/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'event_attended',
      points: 50,
      eventId: eventId,
      description: 'Booked event ticket'
    })
  });
  
  showPointsNotification(50, 'Event ticket booked!');
}
```

---

## 🏅 Badges & Achievements

### **Achievement Tiers**
```javascript
const ACHIEVEMENTS = {
  'rookie': { points: 100, icon: '🥉', name: 'Rookie' },
  'rising_star': { points: 500, icon: '🌟', name: 'Rising Star' },
  'pro': { points: 1000, icon: '💎', name: 'Pro' },
  'legend': { points: 2500, icon: '👑', name: 'Legend' },
  'event_master': { eventsCreated: 10, icon: '🎭', name: 'Event Master' },
  'super_attendee': { eventsAttended: 20, icon: '🎫', name: 'Super Attendee' }
};
```

---

## 📊 Leaderboard Display

### **Ranking Categories**
1. **Overall Points** - Total points earned
2. **Top Creators** - Most events created
3. **Top Attendees** - Most events attended
4. **This Month** - Points earned this month
5. **This Week** - Points earned this week

---

## 🔒 Security Considerations

### **Points Integrity**
- Points can only be added via server-side API
- Frontend cannot manipulate points directly
- All point transactions are logged in `pointsHistory`
- Admin dashboard shows suspicious activity

---

## 🎯 Implementation Checklist

### **Backend Tasks**
- [ ] Add `points` field to User schema
- [ ] Add `pointsHistory` array to User schema
- [ ] Create `GET /users/:username/points` endpoint
- [ ] Create `POST /users/:username/points/add` endpoint
- [ ] Create `GET /leaderboard` endpoint
- [ ] Integrate points on event creation
- [ ] Integrate points on ticket booking
- [ ] Integrate points on registration
- [ ] Add daily login bonus logic

### **Frontend Tasks**
- [ ] Update `index.html` to fetch points dynamically
- [ ] Update `leaderboard.js` to use database API
- [ ] Add points notification component
- [ ] Display user rank on profile
- [ ] Show points history on profile
- [ ] Add achievements/badges display
- [ ] Update event-management.js to award points
- [ ] Update my-tickets.js to award points

### **Testing**
- [ ] Test points earning on registration
- [ ] Test points earning on event creation
- [ ] Test points earning on ticket booking
- [ ] Test leaderboard ranking accuracy
- [ ] Test points history display
- [ ] Test duplicate point prevention

---

## 🚀 Quick Start

### **1. Update User Schema**
Add points fields to `server.js` User schema

### **2. Create Points Endpoints**
Implement the 3 main endpoints in `server.js`

### **3. Update Frontend**
Replace hardcoded points with dynamic API calls

### **4. Test Everything**
Register new user → Create event → Check points → View leaderboard

---

## 📈 Future Enhancements

- **Point Multipliers** - Double points during special events
- **Streak Bonuses** - Login for 7 days straight = 2x points
- **Challenges** - Complete specific tasks for bonus points
- **Point Trading** - Transfer points to other users
- **Premium Features** - Unlock features with points
- **Seasonal Leaderboards** - Reset rankings quarterly

---

## 🆘 Troubleshooting

### **Points not updating?**
- Check MongoDB connection
- Verify API endpoint is called
- Check browser console for errors
- Ensure user is logged in

### **Leaderboard showing old data?**
- Clear browser cache
- Check if using correct API endpoint
- Verify database contains point data

---

**Last Updated:** January 2025  
**Status:** Ready for Implementation ✅
