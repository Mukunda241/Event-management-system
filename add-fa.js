const fs = require('fs');
const path = require('path');

const files = [
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

const fontAwesomeLink = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">';

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('font-awesome') || content.includes('fontawesome')) {
            console.log(`✓ ${file} - already has Font Awesome`);
        } else {
            // Find the first <link> tag and add Font Awesome before it
            const linkMatch = content.match(/(<link rel="stylesheet")/);
            if (linkMatch) {
                content = content.replace(linkMatch[0], fontAwesomeLink + '\n    ' + linkMatch[0]);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✓ ${file} - Font Awesome added`);
            } else {
                console.log(`× ${file} - Could not find <link> tag`);
            }
        }
    } else {
        console.log(`× ${file} - not found`);
    }
});

console.log('\nDone!');
