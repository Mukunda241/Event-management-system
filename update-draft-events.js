// Script to update all Draft events to Active status
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/event_management")
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Define Event schema (same as in server.js)
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
  lat: { type: Number },
  lng: { type: Number },
  isPaid: { type: Boolean, default: false },
  ticketPrice: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  registeredUsers: [{ 
    username: String, 
    fullName: String,
    email: String,
    registeredAt: { type: Date, default: Date.now },
    quantity: { type: Number, default: 1 },
    tickets: [String],
    totalAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }
  }]
}, { timestamps: true });

const Event = mongoose.model("Event", eventSchema);

// Update all Draft events to Active
async function updateDraftEvents() {
  try {
    console.log("🔄 Searching for Draft events...");
    
    const result = await Event.updateMany(
      { status: 'Draft' },
      { $set: { status: 'Active' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} Draft event(s) to Active status`);
    
    // List all events with their status
    const allEvents = await Event.find({}, 'name status organizer date');
    console.log("\n📋 Current events in database:");
    allEvents.forEach(event => {
      console.log(`  - ${event.name} (${event.status}) by ${event.organizer} on ${event.date}`);
    });
    
    console.log("\n✅ Update complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating events:", error);
    process.exit(1);
  }
}

// Run the update
updateDraftEvents();
