const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: String,
  username: { type: String, required: true, unique: true },
  email: String,
  passwordHash: { type: String, required: true },
  role: { type: String, required: true, enum: ["user", "manager", "admin"] },
  accountStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved"
  },
  approvedBy: String,
  approvedAt: Date
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function createAdminInRealDatabase() {
  try {
    // Connect to REAL database (with underscore!)
    await mongoose.connect("mongodb://127.0.0.1:27017/event_management");
    console.log("✅ Connected to REAL database: event_management\n");

    // Check if admin exists
    const existing = await User.findOne({ username: "admin" });
    if (existing) {
      console.log("🗑️  Deleting existing admin account...");
      await User.deleteOne({ username: "admin" });
      console.log("✅ Deleted\n");
    }

    // Create admin account
    const passwordHash = await bcrypt.hash("admin123", 10);
    const admin = new User({
      fullName: "Admin User",
      username: "admin",
      email: "admin@eventmanager.com",
      passwordHash,
      role: "admin",
      accountStatus: "approved"
    });

    await admin.save();
    
    console.log("═══════════════════════════════════════");
    console.log("  ✅ ADMIN CREATED IN REAL DATABASE!");
    console.log("═══════════════════════════════════════");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Role: admin");
    console.log("Database: event_management");
    console.log("═══════════════════════════════════════\n");
    
    // Verify
    const verify = await User.findOne({ username: "admin" });
    console.log("🔍 VERIFICATION:");
    console.log("   Username:", verify.username);
    console.log("   Role:", verify.role);
    console.log("   Status:", verify.accountStatus);
    console.log("");
    
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    mongoose.connection.close();
  }
}

createAdminInRealDatabase();
