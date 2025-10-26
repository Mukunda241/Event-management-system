// Delete and Recreate Admin Script
// Run this with: node fix-admin.js

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

async function fixAdmin() {
  try {
    // Delete existing admin if exists
    console.log("\n🔍 Checking for existing admin account...");
    const existingAdmin = await User.findOne({ username: "admin" });
    
    if (existingAdmin) {
      console.log("⚠️  Found existing admin with role:", existingAdmin.role);
      console.log("🗑️  Deleting old admin account...");
      await User.deleteOne({ username: "admin" });
      console.log("✅ Old admin account deleted!");
    }

    // Create fresh admin account
    console.log("\n🔨 Creating new admin account...");
    
    const adminData = {
      fullName: "Admin User",
      username: "admin",
      email: "admin@eventmanager.com",
      password: "admin123"
    };

    const passwordHash = await bcrypt.hash(adminData.password, 10);

    const admin = new User({
      fullName: adminData.fullName,
      username: adminData.username,
      email: adminData.email,
      passwordHash: passwordHash,
      role: "admin",  // EXPLICITLY SET TO ADMIN
      accountStatus: "approved"
    });

    await admin.save();

    // Verify it was created correctly
    const verifyAdmin = await User.findOne({ username: "admin" });
    
    console.log("\n✅ Admin account recreated successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("  Admin Login Credentials");
    console.log("═══════════════════════════════════════");
    console.log("  Username: " + adminData.username);
    console.log("  Password: " + adminData.password);
    console.log("  Email:    " + adminData.email);
    console.log("  Role:     " + verifyAdmin.role + " ✅");
    console.log("  Status:   " + verifyAdmin.accountStatus);
    console.log("═══════════════════════════════════════\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

// Run the script
fixAdmin();
