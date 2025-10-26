// Check All Users Script
// Run this with: node check-users.js

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
    enum: ["pending", "approved", "rejected"]
  },
  approvedBy: { type: String },
  approvedAt: { type: Date }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function checkUsers() {
  try {
    const allUsers = await User.find({}).select('-passwordHash');
    
    console.log("\n═══════════════════════════════════════");
    console.log("  ALL USERS IN DATABASE");
    console.log("═══════════════════════════════════════\n");

    if (allUsers.length === 0) {
      console.log("⚠️  No users found in database!\n");
      process.exit(0);
    }

    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.fullName || 'N/A'}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Status: ${user.accountStatus || 'N/A'}`);
      console.log(`   Created: ${user.createdAt?.toLocaleDateString() || 'N/A'}`);
      console.log('');
    });

    // Find admin
    const admin = allUsers.find(u => u.role === 'admin');
    if (admin) {
      console.log("═══════════════════════════════════════");
      console.log("  ✅ ADMIN ACCOUNT FOUND!");
      console.log("═══════════════════════════════════════");
      console.log(`  Username: ${admin.username}`);
      console.log(`  Password: admin123 (if not changed)`);
      console.log("═══════════════════════════════════════\n");
    } else {
      console.log("═══════════════════════════════════════");
      console.log("  ⚠️  NO ADMIN ACCOUNT FOUND!");
      console.log("═══════════════════════════════════════");
      console.log("  Run: node create-admin.js");
      console.log("═══════════════════════════════════════\n");
    }

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

// Run the script
checkUsers();
