const fs = require('fs');
const path = require('path');

// Get all HTML files
const htmlFiles = [
    'login.html',
    'register.html',
    'index.html',
    'events.html',
    'calendar.html',
    'favorites.html',
    'leaderboard.html',
    'profile.html',
    'my-tickets.html',
    'event-template.html',
    'event-management.html',
    'my-events.html'
];

// Emoji replacements for HTML files
const htmlReplacements = [
    // Remove emojis from headings
    [/Welcome Back! 🎉/g, 'Welcome Back!'],
    [/🎉 All Events/g, 'All Events'],
    [/📅 Event Calendar/g, 'Event Calendar'],
    [/🏆 User Leaderboard/g, 'User Leaderboard'],
    [/🎫 Select Tickets/g, 'Select Tickets'],
    [/✏️ Edit Event/g, 'Edit Event'],
    
    // Remove emoji icons from divs
    [/<div class="stat-icon">🎫<\/div>/g, '<div class="stat-icon"><i class="fas fa-ticket-alt"></i></div>'],
    [/<div class="stat-icon">📅<\/div>/g, '<div class="stat-icon"><i class="fas fa-calendar"></i></div>'],
    [/<div class="stat-icon">❤️<\/div>/g, '<div class="stat-icon"><i class="fas fa-heart"></i></div>'],
    [/<div class="stat-icon">🏆<\/div>/g, '<div class="stat-icon"><i class="fas fa-trophy"></i></div>'],
    [/<div class="stat-icon">💰<\/div>/g, '<div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>'],
    
    // Feature icons
    [/<span class="feature-icon">📅<\/span>/g, '<span class="feature-icon"><i class="fas fa-calendar-alt"></i></span>'],
    [/<span class="feature-icon">🏆<\/span>/g, '<span class="feature-icon"><i class="fas fa-trophy"></i></span>'],
    [/<span class="role-icon">⚡<\/span>/g, '<span class="role-icon"><i class="fas fa-bolt"></i></span>'],
    
    // Role icons
    [/<div class="role-icon-large">🎉<\/div>/g, '<div class="role-icon-large"><i class="fas fa-user"></i></div>'],
    [/<div class="role-icon-large">⚡<\/div>/g, '<div class="role-icon-large"><i class="fas fa-users-cog"></i></div>'],
    
    // Benefit icons
    [/<div class="benefit-icon">🎫<\/div>/g, '<div class="benefit-icon"><i class="fas fa-ticket-alt"></i></div>'],
    [/<div class="benefit-icon">🏆<\/div>/g, '<div class="benefit-icon"><i class="fas fa-trophy"></i></div>'],
    
    // Text content
    [/🎉 Join thousands of event enthusiasts and organizers/g, 'Join thousands of event enthusiasts and organizers'],
    [/🎉 Registration is open! Users can now sign up for this event\./g, 'Registration is open! Users can now sign up for this event.'],
    [/✔️ Event has finished\. Marked as completed\./g, 'Event has finished. Marked as completed.'],
    [/✔️ Completed - Event finished/g, 'Completed - Event finished'],
    
    // Labels
    [/🏷️ Category/g, 'Category'],
    [/📅 Date/g, 'Date'],
    [/🗺️ Event Location/g, 'Event Location'],
    [/💰 Ticket Price/g, 'Ticket Price'],
    [/💰 Paid Event/g, 'Paid Event'],
    [/🎟️ Available Tickets/g, 'Available Tickets'],
    [/📌 No location selected yet/g, 'No location selected yet'],
    [/✖️/g, '×'],
    
    // Comments (keep but remove emojis)
    [/<!-- 🎫/g, '<!--'],
    [/<!-- 🏆/g, '<!--'],
    [/<!-- ⚡/g, '<!--'],
    [/<!-- 🗑️/g, '<!--'],
    [/<!-- 📌/g, '<!--'],
];

console.log('Removing emojis from HTML files...\n');

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`Processing ${file}...`);
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        htmlReplacements.forEach(([pattern, replacement]) => {
            const before = content;
            content = content.replace(pattern, replacement);
            if (content !== before) changed = true;
        });
        
        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`  ✓ Updated ${file}`);
        } else {
            console.log(`  - No changes in ${file}`);
        }
    } else {
        console.log(`  × File not found: ${file}`);
    }
});

console.log('\n✓ HTML emoji removal complete!');
