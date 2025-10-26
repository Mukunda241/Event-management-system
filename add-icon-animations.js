const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'index.html',
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

const iconAnimationLink = '    <link rel="stylesheet" href="icon-animations.css">';

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if already has icon-animations.css
        if (!content.includes('icon-animations.css')) {
            // Add after the last CSS link or before </head>
            if (content.includes('</head>')) {
                content = content.replace('</head>', `${iconAnimationLink}\n</head>`);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✓ ${file} - Added icon-animations.css`);
            } else {
                console.log(`✗ ${file} - No </head> tag found`);
            }
        } else {
            console.log(`✓ ${file} - Already has icon-animations.css`);
        }
    } else {
        console.log(`✗ ${file} - File not found`);
    }
});

console.log('\n🎨 Icon animation styles added to all pages!');
