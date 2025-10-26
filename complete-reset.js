const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/eventmanagement")
  .then(() => console.log("✅ Connected"))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  fullName: String,
  username: { type: String, unique: true, required: true },
  email: String,
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "manager", "admin"], required: true },
  accountStatus: String,
  approvedBy: String,
  approvedAt: Date
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

async function checkAll() {
  try {
    const users = await User.find({});
    
    console.log("\n═══════════════════════════════════════");
    console.log("  ALL USERS IN DATABASE");
    console.log("═══════════════════════════════════════\n");
    
    users.forEach((u, i) => {
      console.log(`${i + 1}. Username: "${u.username}"`);
      console.log(`   Role: "${u.role}"`);
      console.log(`   ID: ${u._id}`);
      console.log('');
    });
    
    // Now delete ALL users and recreate ONLY admin
    console.log("🗑️  Deleting ALL users...");
    await User.deleteMany({});
    
    console.log("✅ All users deleted");
    console.log("\n🔨 Creating fresh admin account...");
    
    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash("admin123", 10);
    
    const admin = new User({
      fullName: "Admin User",
      username: "admin",
      email: "admin@eventmanager.com",
      passwordHash: passwordHash,
      role: "admin",
      accountStatus: "approved"
    });
    
    await admin.save();
    
    // Verify
    const verify = await User.findOne({ username: "admin" });
    console.log("\n✅ Admin created:");
    console.log("   Username:", verify.username);
    console.log("   Role:", verify.role);
    console.log("   Status:", verify.accountStatus);
    
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

checkAll();
