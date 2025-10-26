// Approve All Pending Organizers Script
// Run this with: node approve-all.js

const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/eventmanagement")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// User Schema (must match server.js)
const userSchema = new mongoose.Schema({
  fullName: { type: String },
  username: { type: String, unique: true, required: true },
  email: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "manager", "admin"], required: true },
  accountStatus: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: function() {
      return this.role === "manager" ? "pending" : "approved";
    }
  },
  approvedBy: { type: String },
  approvedAt: { type: Date }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function approveAllPending() {
  try {
    // Find all pending managers
    const pendingManagers = await User.find({ 
      role: "manager", 
      accountStatus: "pending" 
    });

    if (pendingManagers.length === 0) {
      console.log("\n⚠️  No pending organizers found!");
      console.log("All organizers are already approved.\n");
      process.exit(0);
    }

    console.log(`\n📋 Found ${pendingManagers.length} pending organizer(s):\n`);

    // Approve each one
    for (const manager of pendingManagers) {
      console.log(`   👤 ${manager.fullName || 'N/A'} (@${manager.username})`);
      
      manager.accountStatus = "approved";
      manager.approvedBy = "admin";
      manager.approvedAt = new Date();
      await manager.save();
      
      console.log(`      ✅ APPROVED\n`);
    }

    console.log("═══════════════════════════════════════");
    console.log(`✅ Successfully approved ${pendingManagers.length} organizer(s)!`);
    console.log("═══════════════════════════════════════\n");
    console.log("Next steps:");
    console.log("1. Go to: http://localhost:5000/login.html");
    console.log("2. Press F12, go to Console, type: localStorage.clear()");
    console.log("3. Login with your organizer credentials");
    console.log("4. Start creating events!\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error approving organizers:", err);
    process.exit(1);
  }
}

// Run the script
approveAllPending();
