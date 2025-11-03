const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
// Use PORT from environment (required by most hosts) or default to 5000 for local dev
const PORT = process.env.PORT || 5000;

// Global error handlers to capture uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason, p) => {
  console.error('🔥 Unhandled Rejection at:', p, 'reason:', reason);
});

// CORS configuration - allows frontend to communicate with backend
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Disable caching for development
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});
// Log when process exits (helps diagnose silent exits)
process.on('exit', (code) => {
  console.log('🛑 Process exiting with code', code);
});

// Simple root route for API health check
app.get("/", (req, res) => {
  res.json({ 
    message: "Event Management System API is running!",
    version: "1.0.0",
    status: "healthy"
  });
});

// Note: Static file serving removed - frontend is now deployed separately
// Frontend is served from a different deployment (Static Site on Render)

// MongoDB connection, schema definitions
// Allow overriding MongoDB connection string with MONGODB_URI env var for production hosts
mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/event_management")
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch(err => console.error("❌ MongoDB connction error:", err));

const userSchema = new mongoose.Schema({
  fullName: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "manager", "admin"], required: true },
  accountStatus: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: function() {
      // Auto-approve regular users, managers need approval
      return this.role === "manager" ? "pending" : "approved";
    }
  },
  approvedBy: { type: String }, // Username of admin who approved
  approvedAt: { type: Date },
  // User preferences
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  pinnedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  // 🏆 POINTS SYSTEM
  points: { 
    type: Number, 
    default: 50 // Welcome bonus for new users
  },
  pointsHistory: [{
    action: { type: String, required: true },        // Action that earned points
    points: { type: Number, required: true },        // Points earned/deducted
    eventId: { type: String },                       // Related event (if applicable)
    eventName: { type: String },                     // Event name for display
    timestamp: { type: Date, default: Date.now },    // When it happened
    description: { type: String }                    // Human-readable description
  }],
  lastLogin: { type: Date },                         // Track daily login bonus
  totalEventsCreated: { type: Number, default: 0 }, // Track organizer stats
  totalEventsAttended: { type: Number, default: 0 },// Track attendee stats
  achievements: [{ type: String }]                   // Unlocked achievements
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  venue: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'General' },
  organizer: { type: String, required: true },
  capacity: { type: Number, required: true, default: 100 },
  status: { 
    type: String, 
    enum: ['Draft', 'Active', 'Closed', 'Completed', 'Cancelled'], 
    default: 'Active' 
  },
  lat: { type: Number }, // Latitude for map marker
  lng: { type: Number }, // Longitude for map marker
  // 🎤 Speaker/Chief Guest Information
  speakers: [{
    name: { type: String, required: true },
    designation: { type: String }, // e.g., "CEO at TechCorp"
    bio: { type: String }, // Short biography
    photo: { type: String }, // Base64 encoded image or URL
    role: { type: String, enum: ['Chief Guest', 'Keynote Speaker', 'Panelist', 'Workshop Instructor', 'Speaker'], default: 'Speaker' },
    socialLinks: {
      linkedin: { type: String },
      twitter: { type: String },
      website: { type: String }
    },
    sessionTopic: { type: String }, // What they'll talk about
    sessionTime: { type: String } // Time slot if applicable
  }],
  // 🎫 Ticket System Fields
  isPaid: { type: Boolean, default: false }, // Free or Paid event
  ticketPrice: { type: Number, default: 0 }, // Price per ticket (0 for free)
  currency: { type: String, default: 'INR' }, // Currency
  registeredUsers: [{ 
    username: String, 
    fullName: String,
    email: String,
    registeredAt: { type: Date, default: Date.now },
    quantity: { type: Number, default: 1 }, // Number of tickets
    tickets: [String], // Array of ticket IDs (e.g., ["TKT-001", "TKT-002"])
    totalAmount: { type: Number, default: 0 }, // Total paid
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }
  }]
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);

// API routes unchanged
app.get("/events", async (req, res) => {
  try {
    // Filter parameters
    const filter = {};
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { venue: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Check if pagination is requested
    const usePagination = req.query.page || req.query.limit;
    
    if (usePagination) {
      // Pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12; // 12 events per page
      const skip = (page - 1) * limit;
      
      // Get total count for pagination
      const total = await Event.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);
      
      // Get events with pagination
      const events = await Event.find(filter)
        .sort({ date: 1 }) // Sort by date ascending
        .skip(skip)
        .limit(limit);
      
      res.json({
        events,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages
        }
      });
    } else {
      // No pagination - return ALL events
      const events = await Event.find(filter)
        .sort({ date: 1 }); // Sort by date ascending
      
      res.json({
        events,
        pagination: {
          page: 1,
          limit: events.length,
          total: events.length,
          totalPages: 1,
          hasMore: false
        }
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/register", async (req, res) => {
  const { fullName, username, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, username, email, passwordHash, role });
    
    // 🏆 Add welcome bonus to points history
    newUser.pointsHistory.push({
      action: 'registration',
      points: 50,
      description: 'Welcome bonus - Account created!',
      timestamp: new Date()
    });
    
    await newUser.save();
    res.json({ 
      message: "Registration successful",
      welcomeBonus: 50
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Username not found" });
    }
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password" });
    }
    
    // Check if manager account is approved
    if (user.role === "manager" && user.accountStatus !== "approved") {
      if (user.accountStatus === "pending") {
        return res.status(403).json({ 
          error: "Account pending approval", 
          status: "pending",
          message: "Your organizer account is waiting for admin approval. Please check back later."
        });
      }
      if (user.accountStatus === "rejected") {
        return res.status(403).json({ 
          error: "Account rejected", 
          status: "rejected",
          message: "Your organizer account application was rejected. Please contact support."
        });
      }
    }
    
    const responseData = {
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
      accountStatus: user.accountStatus
    };
    
    console.log("✅ Login successful:", username, "| Role:", user.role);
    
    return res.json(responseData);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Role middleware and protected route
function requireRole(role) {
  return async (req, res, next) => {
    const username = req.body.username || req.body.organizer;
    if (!username) return res.status(401).json({ error: "Unauthorized: username missing" });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: "Unauthorized: user not found" });
    if (user.role !== role) return res.status(403).json({ error: "Forbidden: insufficient privileges" });
    next();
  };
}

app.post("/events", requireRole("manager"), async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    
    // 🏆 Award points to organizer for creating event
    const organizer = await User.findOne({ username: newEvent.organizer });
    if (organizer) {
      organizer.points += 100;
      organizer.totalEventsCreated += 1;
      
      organizer.pointsHistory.push({
        action: 'event_created',
        points: 100,
        eventId: newEvent._id.toString(),
        eventName: newEvent.name,
        description: `Created event: ${newEvent.name}`,
        timestamp: new Date()
      });
      
      // Check for achievement
      if (organizer.totalEventsCreated >= 10 && !organizer.achievements.includes('event_master')) {
        organizer.achievements.push('event_master');
      }
      
      await organizer.save();
    }
    
    res.json({ 
      message: "Event added successfully", 
      event: newEvent,
      pointsEarned: 100
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update event (PUT)
app.put("/events/:id", async (req, res) => {
  try {
    // Get the existing event first to preserve the organizer
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    // If organizer is not in the request body, use the existing one
    if (!req.body.organizer) {
      req.body.organizer = existingEvent.organizer;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.json({ message: "✅ Event updated successfully!", event: updatedEvent });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete event (DELETE)
app.delete("/events/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ message: "🗑️ Event deleted successfully!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register user for an event
app.post("/events/:id/register", async (req, res) => {
  try {
    const { username, fullName, email, quantity, tickets, totalAmount, paymentStatus } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Check if event is Active
    if (event.status !== 'Active') {
      return res.status(400).json({ error: "Registration is not open for this event" });
    }
    
    // Check if already registered
    const alreadyRegistered = event.registeredUsers.some(user => user.username === username);
    if (alreadyRegistered) {
      return res.status(400).json({ error: "You are already registered for this event" });
    }
    
    // Calculate total booked tickets (sum of all quantities)
    const totalBookedTickets = event.registeredUsers.reduce((sum, user) => sum + (user.quantity || 1), 0);
    const requestedQuantity = quantity || 1;
    
    // Check if enough capacity for requested quantity
    if (totalBookedTickets + requestedQuantity > event.capacity) {
      const remainingSeats = event.capacity - totalBookedTickets;
      if (remainingSeats > 0) {
        return res.status(400).json({ 
          error: `Not enough seats available. Only ${remainingSeats} seat(s) remaining.`,
          remainingSeats: remainingSeats
        });
      } else {
        return res.status(400).json({ error: "Event is full. Registration closed." });
      }
    }
    
    // Add user to registered list with ticket details
    event.registeredUsers.push({ 
      username, 
      fullName, 
      email, 
      registeredAt: new Date(),
      quantity: requestedQuantity,
      tickets: tickets || [],
      totalAmount: totalAmount || 0,
      paymentStatus: paymentStatus || 'completed'
    });
    
    // Recalculate total booked tickets after adding new booking
    const finalTotalBookedTickets = event.registeredUsers.reduce((sum, user) => sum + (user.quantity || 1), 0);
    
    // Auto-close if capacity reached
    if (finalTotalBookedTickets >= event.capacity) {
      event.status = 'Closed';
    }
    
    await event.save();
    
    // 🏆 Award points to user for attending event
    const user = await User.findOne({ username });
    if (user) {
      user.points += 50;
      user.totalEventsAttended += 1;
      
      user.pointsHistory.push({
        action: 'ticket_booked',
        points: 50,
        eventId: event._id.toString(),
        eventName: event.name,
        description: `Booked ticket for: ${event.name}`,
        timestamp: new Date()
      });
      
      // Check for achievement
      if (user.totalEventsAttended >= 20 && !user.achievements.includes('super_attendee')) {
        user.achievements.push('super_attendee');
      }
      
      await user.save();
    }
    
    res.json({ 
      message: "✅ Successfully registered for the event!",
      registeredCount: finalTotalBookedTickets,
      capacity: event.capacity,
      status: event.status,
      pointsEarned: 50
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Unregister user from an event
app.delete("/events/:id/register", async (req, res) => {
  try {
    const { username } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Remove user from registered list
    const initialLength = event.registeredUsers.length;
    event.registeredUsers = event.registeredUsers.filter(user => user.username !== username);
    
    if (event.registeredUsers.length === initialLength) {
      return res.status(400).json({ error: "You are not registered for this event" });
    }
    
    // Calculate total booked tickets after unregistration
    const totalBookedTickets = event.registeredUsers.reduce((sum, user) => sum + (user.quantity || 1), 0);
    
    // Reopen registration if it was closed due to capacity
    if (event.status === 'Closed' && totalBookedTickets < event.capacity) {
      event.status = 'Active';
    }
    
    await event.save();
    res.json({ 
      message: "✅ Successfully unregistered from the event",
      registeredCount: totalBookedTickets,
      capacity: event.capacity,
      status: event.status
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Get all pending organizers (admin only)
app.get("/admin/pending-organizers", async (req, res) => {
  try {
    const pendingOrganizers = await User.find({ 
      role: "manager", 
      accountStatus: "pending" 
    }).select('-passwordHash');
    
    res.json(pendingOrganizers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all organizers (admin only)
app.get("/admin/organizers", async (req, res) => {
  try {
    const organizers = await User.find({ 
      role: "manager"
    }).select('-passwordHash').sort({ createdAt: -1 });
    
    res.json(organizers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve organizer (admin only)
app.post("/admin/approve-organizer/:username", async (req, res) => {
  try {
    const { adminUsername } = req.body;
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (user.role !== "manager") {
      return res.status(400).json({ error: "User is not an organizer" });
    }
    
    user.accountStatus = "approved";
    user.approvedBy = adminUsername;
    user.approvedAt = new Date();
    await user.save();
    
    res.json({ 
      message: "Organizer approved successfully",
      user: {
        username: user.username,
        fullName: user.fullName,
        accountStatus: user.accountStatus
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reject organizer (admin only)
app.post("/admin/reject-organizer/:username", async (req, res) => {
  try {
    const { adminUsername } = req.body;
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (user.role !== "manager") {
      return res.status(400).json({ error: "User is not an organizer" });
    }
    
    user.accountStatus = "rejected";
    user.approvedBy = adminUsername;
    user.approvedAt = new Date();
    await user.save();
    
    res.json({ 
      message: "Organizer rejected",
      user: {
        username: user.username,
        fullName: user.fullName,
        accountStatus: user.accountStatus
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// 🎫 TICKET MANAGEMENT ENDPOINTS
// ============================================================

// Get all tickets for a specific user
app.get("/tickets/:username", async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find all events where this user is registered
    const events = await Event.find({
      "registeredUsers.username": username
    });
    
    // Extract tickets from all events
    const tickets = [];
    events.forEach(event => {
      const userRegistration = event.registeredUsers.find(
        reg => reg.username === username
      );
      
      if (userRegistration) {
        tickets.push({
          _id: userRegistration._id,
          eventId: event._id,
          eventName: event.name,
          eventDate: event.date,
          eventTime: event.time,
          eventVenue: event.venue,
          eventStatus: event.status,
          username: userRegistration.username,
          fullName: userRegistration.fullName,
          email: userRegistration.email,
          quantity: userRegistration.quantity || 1,
          tickets: userRegistration.tickets || [],
          totalAmount: userRegistration.totalAmount || 0,
          isPaid: event.isPaid,
          ticketPrice: event.ticketPrice,
          paymentStatus: userRegistration.paymentStatus || 'completed',
          bookedAt: userRegistration.registeredAt,
          category: event.category
        });
      }
    });
    
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel a specific ticket (remove user from event registration)
app.delete("/tickets/:eventId/:username", async (req, res) => {
  try {
    const { eventId, username } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Find the user's registration
    const registrationIndex = event.registeredUsers.findIndex(
      reg => reg.username === username
    );
    
    if (registrationIndex === -1) {
      return res.status(404).json({ error: "Ticket not found for this user" });
    }
    
    // Remove the user's registration
    const removedTicket = event.registeredUsers[registrationIndex];
    event.registeredUsers.splice(registrationIndex, 1);
    
    // Calculate total booked tickets after removal
    const totalBookedTickets = event.registeredUsers.reduce((sum, user) => sum + (user.quantity || 1), 0);
    
    // If event was closed due to capacity, reopen it
    if (event.status === 'Closed' && totalBookedTickets < event.capacity) {
      event.status = 'Active';
    }
    
    await event.save();
    
    // 🏆 Deduct points from user for cancelling ticket
    const user = await User.findOne({ username });
    if (user) {
      // Only deduct if user has enough events attended
      if (user.totalEventsAttended > 0) {
        user.totalEventsAttended -= 1;
      }
      
      // Deduct points (but don't go below 0)
      user.points = Math.max(0, user.points - 50);
      
      // Add cancellation to history
      user.pointsHistory.push({
        action: 'ticket_cancelled',
        points: -50,
        eventId: event._id.toString(),
        eventName: event.name,
        description: `Cancelled ticket for: ${event.name}`,
        timestamp: new Date()
      });
      
      // Remove 'super_attendee' achievement if they drop below 20
      if (user.totalEventsAttended < 20 && user.achievements.includes('super_attendee')) {
        user.achievements = user.achievements.filter(a => a !== 'super_attendee');
      }
      
      await user.save();
    }
    
    res.json({ 
      message: "🗑️ Ticket cancelled successfully!",
      removedTicket: {
        eventName: event.name,
        username: removedTicket.username,
        quantity: removedTicket.quantity
      },
      currentCapacity: event.registeredUsers.length,
      totalCapacity: event.capacity,
      eventStatus: event.status,
      pointsDeducted: -50,
      newPoints: user ? user.points : null
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update ticket information (e.g., payment status, quantity)
app.put("/tickets/:eventId/:username", async (req, res) => {
  try {
    const { eventId, username } = req.params;
    const updates = req.body; // { quantity, paymentStatus, etc. }
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Find the user's registration
    const registration = event.registeredUsers.find(
      reg => reg.username === username
    );
    
    if (!registration) {
      return res.status(404).json({ error: "Ticket not found for this user" });
    }
    
    // Update allowed fields
    if (updates.quantity !== undefined) registration.quantity = updates.quantity;
    if (updates.paymentStatus !== undefined) registration.paymentStatus = updates.paymentStatus;
    if (updates.totalAmount !== undefined) registration.totalAmount = updates.totalAmount;
    if (updates.tickets !== undefined) registration.tickets = updates.tickets;
    
    await event.save();
    
    res.json({ 
      message: "✅ Ticket updated successfully!",
      ticket: registration
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// ❤️ FAVORITES ENDPOINTS
// ============================================================

// Get user's favorite events
app.get("/users/:username/favorites", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).populate('favorites');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user.favorites || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add event to favorites
app.post("/users/:username/favorites/:eventId", async (req, res) => {
  try {
    const { username, eventId } = req.params;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Check if already favorited
    if (user.favorites.includes(eventId)) {
      return res.status(400).json({ error: "Event already in favorites" });
    }
    
    user.favorites.push(eventId);
    await user.save();
    
    res.json({ 
      message: "❤️ Event added to favorites!",
      favorites: user.favorites
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove event from favorites
app.delete("/users/:username/favorites/:eventId", async (req, res) => {
  try {
    const { username, eventId } = req.params;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    user.favorites = user.favorites.filter(id => id.toString() !== eventId);
    await user.save();
    
    res.json({ 
      message: "💔 Event removed from favorites",
      favorites: user.favorites
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// � ORGANIZER MANAGEMENT ENDPOINTS
// ============================================================

// Get all events created by a specific organizer with booking statistics
app.get("/organizers/:username/events", async (req, res) => {
  try {
    const { username } = req.params;
    
    // Verify user exists and is a manager
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "Organizer not found" });
    }
    
    if (user.role !== "manager") {
      return res.status(403).json({ error: "User is not an event organizer" });
    }
    
    // Find all events created by this organizer
    const events = await Event.find({ organizer: username }).sort({ createdAt: -1 });
    
    // Calculate statistics for each event
    const eventsWithStats = events.map(event => {
      const totalBookings = event.registeredUsers.length;
      const totalTickets = event.registeredUsers.reduce((sum, reg) => sum + (reg.quantity || 1), 0);
      const totalRevenue = event.registeredUsers.reduce((sum, reg) => sum + (reg.totalAmount || 0), 0);
      const availableSeats = event.capacity - totalTickets;
      const capacityPercentage = ((totalTickets / event.capacity) * 100).toFixed(1);
      
      // Get recent registrations (last 5)
      const recentRegistrations = event.registeredUsers
        .sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt))
        .slice(0, 5)
        .map(reg => ({
          username: reg.username,
          fullName: reg.fullName,
          quantity: reg.quantity,
          registeredAt: reg.registeredAt,
          totalAmount: reg.totalAmount
        }));
      
      return {
        _id: event._id,
        name: event.name,
        date: event.date,
        time: event.time,
        venue: event.venue,
        category: event.category,
        status: event.status,
        capacity: event.capacity,
        isPaid: event.isPaid,
        ticketPrice: event.ticketPrice,
        currency: event.currency,
        createdAt: event.createdAt,
        // Booking Statistics
        statistics: {
          totalBookings,
          totalTickets,
          totalRevenue,
          availableSeats,
          capacityPercentage: parseFloat(capacityPercentage),
          isFull: totalTickets >= event.capacity
        },
        recentRegistrations
      };
    });
    
    // Overall statistics across all events
    const overallStats = {
      totalEvents: events.length,
      activeEvents: events.filter(e => e.status === 'Active').length,
      completedEvents: events.filter(e => e.status === 'Completed').length,
      draftEvents: events.filter(e => e.status === 'Draft').length,
      totalBookingsAllEvents: eventsWithStats.reduce((sum, e) => sum + e.statistics.totalBookings, 0),
      totalRevenueAllEvents: eventsWithStats.reduce((sum, e) => sum + e.statistics.totalRevenue, 0)
    };
    
    res.json({
      organizer: {
        username: user.username,
        fullName: user.fullName,
        email: user.email
      },
      overallStatistics: overallStats,
      events: eventsWithStats
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get detailed bookings for a specific event (organizer only)
app.get("/events/:id/bookings", async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Return all registered users with full details
    const bookings = event.registeredUsers.map(reg => ({
      _id: reg._id,
      username: reg.username,
      fullName: reg.fullName,
      email: reg.email,
      quantity: reg.quantity || 1,
      tickets: reg.tickets || [],
      totalAmount: reg.totalAmount || 0,
      paymentStatus: reg.paymentStatus || 'completed',
      registeredAt: reg.registeredAt
    }));
    
    // Sort by registration date (most recent first)
    bookings.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
    
    // Calculate booking statistics
    const totalTickets = bookings.reduce((sum, b) => sum + b.quantity, 0);
    const stats = {
      totalBookings: bookings.length,
      totalTickets: totalTickets,
      totalRevenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
      pendingPayments: bookings.filter(b => b.paymentStatus === 'pending').length,
      completedPayments: bookings.filter(b => b.paymentStatus === 'completed').length,
      availableSeats: event.capacity - totalTickets,
      capacityUsed: ((totalTickets / event.capacity) * 100).toFixed(1)
    };
    
    res.json({
      eventInfo: {
        _id: event._id,
        name: event.name,
        date: event.date,
        time: event.time,
        venue: event.venue,
        organizer: event.organizer,
        capacity: event.capacity,
        status: event.status,
        isPaid: event.isPaid,
        ticketPrice: event.ticketPrice,
        currency: event.currency
      },
      statistics: stats,
      bookings: bookings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// �📍 PINNED EVENTS ENDPOINTS
// ============================================================

// Get user's pinned events
app.get("/users/:username/pinned", async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).populate('pinnedEvents');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(user.pinnedEvents || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add event to pinned
app.post("/users/:username/pinned/:eventId", async (req, res) => {
  try {
    const { username, eventId } = req.params;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    
    // Check if already pinned
    if (user.pinnedEvents.includes(eventId)) {
      return res.status(400).json({ error: "Event already pinned" });
    }
    
    user.pinnedEvents.push(eventId);
    await user.save();
    
    res.json({ 
      message: "📍 Event pinned!",
      pinnedEvents: user.pinnedEvents
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove event from pinned
app.delete("/users/:username/pinned/:eventId", async (req, res) => {
  try {
    const { username, eventId } = req.params;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    user.pinnedEvents = user.pinnedEvents.filter(id => id.toString() !== eventId);
    await user.save();
    
    res.json({ 
      message: "📍 Event unpinned",
      pinnedEvents: user.pinnedEvents
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================
// 🏆 POINTS MANAGEMENT SYSTEM
// ============================================================

// Get user points and rank
app.get("/users/:username/points", async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Calculate user's rank
    const totalUsers = await User.countDocuments();
    const usersAbove = await User.countDocuments({ points: { $gt: user.points } });
    const rank = usersAbove + 1;
    const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);
    
    res.json({
      username: user.username,
      fullName: user.fullName,
      points: user.points,
      rank: rank,
      totalUsers: totalUsers,
      percentile: percentile,
      history: user.pointsHistory.slice(-20).reverse(), // Last 20 activities
      totalEventsCreated: user.totalEventsCreated,
      totalEventsAttended: user.totalEventsAttended,
      achievements: user.achievements
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add points to user
app.post("/users/:username/points/add", async (req, res) => {
  try {
    const { username } = req.params;
    const { action, points, eventId, eventName, description } = req.body;
    
    if (!action || !points) {
      return res.status(400).json({ error: "Action and points are required" });
    }
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Add points
    user.points += points;
    
    // Add to history
    user.pointsHistory.push({
      action: action,
      points: points,
      eventId: eventId || null,
      eventName: eventName || null,
      description: description || action,
      timestamp: new Date()
    });
    
    // Update stats based on action
    if (action === 'event_created') {
      user.totalEventsCreated += 1;
    } else if (action === 'event_attended' || action === 'ticket_booked') {
      user.totalEventsAttended += 1;
    }
    
    // Check for new achievements
    const newAchievements = [];
    
    if (user.points >= 100 && !user.achievements.includes('rookie')) {
      newAchievements.push('rookie');
    }
    if (user.points >= 500 && !user.achievements.includes('rising_star')) {
      newAchievements.push('rising_star');
    }
    if (user.points >= 1000 && !user.achievements.includes('pro')) {
      newAchievements.push('pro');
    }
    if (user.points >= 2500 && !user.achievements.includes('legend')) {
      newAchievements.push('legend');
    }
    if (user.totalEventsCreated >= 10 && !user.achievements.includes('event_master')) {
      newAchievements.push('event_master');
    }
    if (user.totalEventsAttended >= 20 && !user.achievements.includes('super_attendee')) {
      newAchievements.push('super_attendee');
    }
    
    if (newAchievements.length > 0) {
      user.achievements.push(...newAchievements);
    }
    
    await user.save();
    
    res.json({
      message: `✅ +${points} points added!`,
      points: user.points,
      newAchievements: newAchievements,
      history: user.pointsHistory.slice(-5).reverse()
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const sortBy = req.query.sortBy || 'points'; // points, eventsCreated, eventsAttended
    
    let sortOption = {};
    if (sortBy === 'eventsCreated') {
      sortOption = { totalEventsCreated: -1, points: -1 };
    } else if (sortBy === 'eventsAttended') {
      sortOption = { totalEventsAttended: -1, points: -1 };
    } else {
      sortOption = { points: -1 };
    }
    
    const users = await User.find()
      .select('username fullName points totalEventsCreated totalEventsAttended achievements role')
      .sort(sortOption)
      .limit(limit);
    
    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      fullName: user.fullName || user.username,
      points: user.points,
      eventsCreated: user.totalEventsCreated,
      eventsAttended: user.totalEventsAttended,
      achievements: user.achievements,
      role: user.role
    }));
    
    const totalUsers = await User.countDocuments();
    
    res.json({
      leaderboard: leaderboard,
      totalUsers: totalUsers,
      sortBy: sortBy
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user rank
app.get("/users/:username/rank", async (req, res) => {
  try {
    const { username } = req.params;
    const sortBy = req.query.sortBy || 'points'; // points, eventsCreated, eventsAttended
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const totalUsers = await User.countDocuments();
    
    // Calculate rank based on sortBy parameter
    let usersAbove = 0;
    let userValue = 0;
    
    if (sortBy === 'eventsCreated') {
      usersAbove = await User.countDocuments({ 
        $or: [
          { totalEventsCreated: { $gt: user.totalEventsCreated } },
          { totalEventsCreated: user.totalEventsCreated, points: { $gt: user.points } }
        ]
      });
      userValue = user.totalEventsCreated;
    } else if (sortBy === 'eventsAttended') {
      usersAbove = await User.countDocuments({ 
        $or: [
          { totalEventsAttended: { $gt: user.totalEventsAttended } },
          { totalEventsAttended: user.totalEventsAttended, points: { $gt: user.points } }
        ]
      });
      userValue = user.totalEventsAttended;
    } else {
      usersAbove = await User.countDocuments({ points: { $gt: user.points } });
      userValue = user.points;
    }
    
    const rank = usersAbove + 1;
    const percentile = Math.round(((totalUsers - rank) / totalUsers) * 100);
    
    res.json({
      username: user.username,
      rank: rank,
      points: user.points,
      eventsCreated: user.totalEventsCreated,
      eventsAttended: user.totalEventsAttended,
      sortBy: sortBy,
      sortValue: userValue,
      totalUsers: totalUsers,
      percentile: percentile
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Daily login bonus
app.post("/users/:username/daily-login", async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if already logged in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastLogin = user.lastLogin ? new Date(user.lastLogin) : null;
    
    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0);
      if (lastLogin.getTime() === today.getTime()) {
        return res.json({
          message: "Already claimed today's login bonus",
          alreadyClaimed: true,
          points: user.points
        });
      }
    }
    
    // Award daily login bonus
    user.points += 5;
    user.lastLogin = new Date();
    
    user.pointsHistory.push({
      action: 'daily_login',
      points: 5,
      description: 'Daily login bonus',
      timestamp: new Date()
    });
    
    await user.save();
    
    res.json({
      message: "✅ +5 points for daily login!",
      alreadyClaimed: false,
      points: user.points,
      bonus: 5
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== NOTIFICATIONS API ====================
console.log('🔎 Requiring notification modules...');
const Notification = require('./notifications-schema');
const NotificationService = require('./notification-service');
console.log('🔎 notifications-schema loaded');
console.log('🔎 notification-service loaded');

// Get user notifications (with pagination)
app.get("/api/notifications/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await NotificationService.getUserNotifications(username, page, limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get unread count
app.get("/api/notifications/:username/unread-count", async (req, res) => {
  try {
    const { username } = req.params;
    const count = await NotificationService.getUnreadCount(username);
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark notification as read
app.put("/api/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await NotificationService.markAsRead(notificationId);
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark all as read
app.put("/api/notifications/:username/read-all", async (req, res) => {
  try {
    const { username } = req.params;
    await NotificationService.markAllAsRead(username);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete notification
app.delete("/api/notifications/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    await NotificationService.deleteNotification(notificationId);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Archive notification
app.put("/api/notifications/:notificationId/archive", async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await NotificationService.archiveNotification(notificationId);
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create test notification (for testing)
app.post("/api/notifications/test", async (req, res) => {
  try {
    const { username } = req.body;
    const notification = await NotificationService.create({
      recipientUsername: username,
      type: 'system_announcement',
      title: '🧪 Test Notification',
      message: 'This is a test notification to verify the system is working correctly.',
      icon: 'fa-flask',
      priority: 'normal',
      actionUrl: 'index.html',
      actionLabel: 'Go Home'
    });
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export User model for notification service
module.exports.User = User;

// Final fallback for all unknown routes (optional, can be just a 404)
// This will send home.html for anything not matched above
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "home.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// Temporary keep-alive to prevent unexpected process exit while debugging.
// Remove this once the root cause of the silent exit is found.
setInterval(() => {
  // heartbeat
}, 1000 * 60 * 60);
