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

async function findAllAdmins() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/eventmanagement");
    console.log("✅ Connected to MongoDB\n");

    // Find ALL users with username "admin" (not just first one!)
    const admins = await User.find({ username: "admin" });
    
    console.log("═══════════════════════════════════════");
    console.log(`  FOUND ${admins.length} ACCOUNT(S) WITH USERNAME "admin"`);
    console.log("═══════════════════════════════════════\n");

    admins.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user._id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Status: ${user.accountStatus}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Updated: ${user.updatedAt}`);
      console.log("");
    });

    if (admins.length > 1) {
      console.log("⚠️  WARNING: MULTIPLE 'admin' ACCOUNTS FOUND!");
      console.log("⚠️  This is why login returns the wrong role!");
      console.log("\n🔧 SOLUTION: Delete ALL and create ONE admin\n");
    }

    // Now find which one findOne() returns (same as login does)
    const foundUser = await User.findOne({ username: "admin" });
    console.log("═══════════════════════════════════════");
    console.log("  WHICH ONE DOES findOne() RETURN?");
    console.log("  (This is what login endpoint uses)");
    console.log("═══════════════════════════════════════");
    console.log(`ID: ${foundUser._id}`);
    console.log(`Role: ${foundUser.role}`);
    console.log(`Email: ${foundUser.email}`);
    console.log(`Created: ${foundUser.createdAt}`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    mongoose.connection.close();
  }
}

findAllAdmins();
