// Create Admin User Script
// Run this with: node create-admin.js

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

async function createAdmin() {
  try {
    // Admin credentials
    const adminData = {
      fullName: "Admin User",
      username: "admin",
      email: "admin@eventmanager.com",
      password: "admin123", // Change this to a secure password!
      role: "admin"
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: adminData.username });
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists!");
      console.log("Username:", existingAdmin.username);
      console.log("Role:", existingAdmin.role);
      process.exit(0);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(adminData.password, 10);

    // Create admin user
    const admin = new User({
      fullName: adminData.fullName,
      username: adminData.username,
      email: adminData.email,
      passwordHash: passwordHash,
      role: "admin",
      accountStatus: "approved"
    });

    await admin.save();

    console.log("\n✅ Admin user created successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("  Admin Login Credentials");
    console.log("═══════════════════════════════════════");
    console.log("  Username: " + adminData.username);
    console.log("  Password: " + adminData.password);
    console.log("  Email:    " + adminData.email);
    console.log("═══════════════════════════════════════");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

// Run the script
createAdmin();
