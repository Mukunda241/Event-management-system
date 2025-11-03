const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://mukundasamudrala_db_user:Mukunda9393@cluster0.zsaejaw.mongodb.net/event_management_system?retryWrites=true&w=majority&appName=Cluster0";

console.log('🔍 Checking user details...\n');

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    
    console.log('\n📊 All users in database:\n');
    users.forEach((user, idx) => {
      console.log(`User ${idx + 1}:`);
      console.log(`  - Username: ${user.username}`);
      console.log(`  - Full Name: ${user.fullName || 'Not set'}`);
      console.log(`  - Email: ${user.email || 'Not set'}`);
      console.log(`  - Role: ${user.role}`);
      console.log(`  - Account Status: ${user.accountStatus}`);
      console.log(`  - Has Password: ${user.passwordHash ? 'Yes' : 'No'}`);
      console.log(`  - Created At: ${user.createdAt || 'Unknown'}`);
      console.log('');
    });
    
    await mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
