// Force Update Admin Role
// Run this with: node force-fix-admin.js

const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/eventmanagement")
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String },
  username: { type: String, unique: true, required: true },
  email: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "manager", "admin"], required: true },
  accountStatus: { type: String, enum: ["pending", "approved", "rejected"] },
  approvedBy: { type: String },
  approvedAt: { type: Date }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function forceFixAdmin() {
  try {
    console.log("\n🔍 Finding admin account...");
    
    const admin = await User.findOne({ username: "admin" });
    
    if (!admin) {
      console.log("❌ No admin account found!");
      process.exit(1);
    }
    
    console.log("\n📋 Current admin account:");
    console.log("   Username:", admin.username);
    console.log("   Role:", admin.role);
    console.log("   Status:", admin.accountStatus);
    
    console.log("\n🔧 Updating role to 'admin'...");
    
    // Force update using updateOne
    await User.updateOne(
      { username: "admin" },
      { 
        $set: { 
          role: "admin",
          accountStatus: "approved"
        }
      }
    );
    
    // Verify the update
    const updatedAdmin = await User.findOne({ username: "admin" });
    
    console.log("\n✅ Admin account updated!");
    console.log("\n═══════════════════════════════════════");
    console.log("  Updated Admin Account");
    console.log("═══════════════════════════════════════");
    console.log("  Username:", updatedAdmin.username);
    console.log("  Role:", updatedAdmin.role);
    console.log("  Status:", updatedAdmin.accountStatus);
    console.log("═══════════════════════════════════════\n");
    
    if (updatedAdmin.role === "admin") {
      console.log("✅ SUCCESS! Role is now 'admin'");
    } else {
      console.log("❌ FAILED! Role is still:", updatedAdmin.role);
    }
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

forceFixAdmin();
