const mongoose = require("mongoose");

// MongoDB Connection (using local MongoDB)
const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/event_management";

// Event Schema
const eventSchema = new mongoose.Schema({
  name: String,
  date: String,
  time: String,
  location: String,
  description: String,
  category: String,
  organizerName: String,
  organizerEmail: String,
  capacity: Number,
  ticketPrice: Number,
  imageUrl: String,
  tags: [String],
  status: String,
  lat: Number,
  lng: Number,
  attendees: [{ userId: String, userName: String, userEmail: String }]
});

const Event = mongoose.model("Event", eventSchema);

// Check events with coordinates
async function checkEventCoordinates() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all events
    const allEvents = await Event.find({});
    console.log(`📊 Total Events: ${allEvents.length}\n`);

    // Check which events have coordinates
    const eventsWithCoords = allEvents.filter(e => e.lat && e.lng);
    const eventsWithoutCoords = allEvents.filter(e => !e.lat || !e.lng);

    console.log('✅ Events WITH coordinates:');
    console.log('═'.repeat(60));
    if (eventsWithCoords.length === 0) {
      console.log('❌ No events have coordinates yet.\n');
    } else {
      eventsWithCoords.forEach(event => {
        console.log(`📍 ${event.name}`);
        console.log(`   Location: ${event.location}`);
        console.log(`   Coordinates: ${event.lat}, ${event.lng}`);
        console.log(`   Date: ${event.date}\n`);
      });
    }

    console.log('❌ Events WITHOUT coordinates:');
    console.log('═'.repeat(60));
    if (eventsWithoutCoords.length === 0) {
      console.log('✅ All events have coordinates!\n');
    } else {
      eventsWithoutCoords.forEach(event => {
        console.log(`📌 ${event.name}`);
        console.log(`   Location: ${event.location}`);
        console.log(`   Status: ${event.status || 'active'}\n`);
      });
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ With coordinates: ${eventsWithCoords.length}`);
    console.log(`   ❌ Without coordinates: ${eventsWithoutCoords.length}`);
    console.log(`   Total: ${allEvents.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkEventCoordinates();
