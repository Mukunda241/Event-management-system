const mongoose = require('mongoose');

const mongoURI = "mongodb+srv://mukundasamudrala_db_user:Mukunda9393@cluster0.zsaejaw.mongodb.net/event_management_system?retryWrites=true&w=majority&appName=Cluster0";

console.log('🔍 Connecting to MongoDB Atlas...\n');

mongoose.connect(mongoURI)
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📊 Database Name:', mongoose.connection.db.databaseName);
    console.log('');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Collections in database:', collections.map(c => c.name).join(', '));
    console.log('');
    
    // Check users collection
    if (collections.find(c => c.name === 'users')) {
      const usersCount = await mongoose.connection.db.collection('users').countDocuments();
      console.log('👥 Total users:', usersCount);
      
      if (usersCount > 0) {
        const sampleUsers = await mongoose.connection.db.collection('users').find({}).limit(5).toArray();
        console.log('\n📝 Sample users:');
        sampleUsers.forEach((user, idx) => {
          console.log(`  ${idx + 1}. Username: ${user.username}, Role: ${user.role}, Status: ${user.accountStatus}`);
        });
      }
    } else {
      console.log('⚠️  No "users" collection found!');
    }
    
    console.log('');
    
    // Check events collection
    if (collections.find(c => c.name === 'events')) {
      const eventsCount = await mongoose.connection.db.collection('events').countDocuments();
      console.log('🎉 Total events:', eventsCount);
      
      if (eventsCount > 0) {
        const sampleEvents = await mongoose.connection.db.collection('events').find({}).limit(5).toArray();
        console.log('\n📝 Sample events:');
        sampleEvents.forEach((event, idx) => {
          console.log(`  ${idx + 1}. Title: ${event.title}, Status: ${event.status}, Organizer: ${event.organizer}`);
        });
      }
    } else {
      console.log('⚠️  No "events" collection found!');
    }
    
    await mongoose.connection.close();
    console.log('\n✅ Connection closed');
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
