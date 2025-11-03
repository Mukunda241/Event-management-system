const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const mongoURI = "mongodb+srv://mukundasamudrala_db_user:Mukunda9393@cluster0.zsaejaw.mongodb.net/event_management_system?retryWrites=true&w=majority&appName=Cluster0";

// Admin credentials
const adminCredentials = {
  username: 'admin',
  password: 'Admin@123',
  fullName: 'System Administrator',
  email: 'admin@eventpulse.com',
  role: 'admin',
  accountStatus: 'approved'
};

console.log('🔧 Creating admin account...\n');

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await mongoose.connection.db.collection('users').findOne({ 
      username: adminCredentials.username 
    });
    
    if (existingAdmin) {
      console.log('⚠️  Admin account already exists!');
      console.log('   Username:', existingAdmin.username);
      await mongoose.connection.close();
      return;
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminCredentials.password, salt);
    
    // Create admin user
    const adminUser = {
      username: adminCredentials.username,
      passwordHash: passwordHash,
      fullName: adminCredentials.fullName,
      email: adminCredentials.email,
      role: adminCredentials.role,
      accountStatus: adminCredentials.accountStatus,
      points: 100,
      favorites: [],
      pinnedEvents: [],
      pointsHistory: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await mongoose.connection.db.collection('users').insertOne(adminUser);
    
    console.log('✅ Admin account created successfully!\n');
    console.log('📋 Admin Credentials:');
    console.log('   Username: ' + adminCredentials.username);
    console.log('   Password: ' + adminCredentials.password);
    console.log('   Email: ' + adminCredentials.email);
    console.log('   Role: ' + adminCredentials.role);
    console.log('\n🔐 Use these credentials to login as admin');
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
