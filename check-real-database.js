const mongoose = require("mongoose");

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

async function checkRealDatabase() {
  try {
    // Connect to the REAL database (with underscore!)
    await mongoose.connect("mongodb://127.0.0.1:27017/event_management");
    console.log("✅ Connected to REAL database: event_management\n");

    const users = await User.find({});
    
    console.log("═══════════════════════════════════════");
    console.log(`  ALL USERS IN event_management DATABASE`);
    console.log("═══════════════════════════════════════\n");

    users.forEach((user, index) => {
      console.log(`${index + 1}. Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Name: ${user.fullName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Status: ${user.accountStatus || 'N/A'}`);
      console.log("");
    });

    console.log(`Total users: ${users.length}\n`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Error:", err.message);
    mongoose.connection.close();
  }
}

checkRealDatabase();
