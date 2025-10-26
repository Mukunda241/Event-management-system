const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'login.html',
    'register.html',
    'events.html',
    'calendar.html',
    'favorites.html',
    'leaderboard.html',
    'profile.html',
    'my-tickets.html',
    'event-template.html',
    'event-management.html',
    'my-events.html',
    'organizer-dashboard.html'
];

const fontAwesomeCDN = '    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n';

console.log('Adding Font Awesome CDN to HTML files...\n');

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if Font Awesome is already included
        if (content.includes('font-awesome') || content.includes('fontawesome')) {
            console.log(`  - ${file} already has Font Awesome`);
            return;
        }
        
        // Add Font Awesome CDN after <head> or before first <link>
        if (content.includes('<head>')) {
            content = content.replace(
                /(<head>[\s\S]*?)(\n\s*<meta)/,
                '$1\n' + fontAwesomeCDN + '$2'
            );
        } else {
            // Fallback: add before first stylesheet
            content = content.replace(
                /(\n\s*<link rel="stylesheet")/,
                '\n' + fontAwesomeCDN + '$1'
            );
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✓ Added Font Awesome to ${file}`);
    } else {
        console.log(`  × File not found: ${file}`);
    }
});

console.log('\n✓ Font Awesome CDN added to all files!');
