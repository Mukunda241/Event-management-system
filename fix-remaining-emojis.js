const fs = require('fs');
const path = require('path');

const files = [
    'events.js',
    'script.js',
    'event-template.js',
    'favorites.js',
    'event-management.html',
    'event-management.js',
    'register.js',
    'register.html'
];

const replacements = [
    // Toast messages - favorites
    [/showToast\(`⭐ /g, 'showToast(`'],
    [/showToast\(`💔 /g, 'showToast(`'],
    [/showToast\(`❤️ /g, 'showToast(`'],
    
    // Toast messages - pinned
    [/showToast\(`📌 /g, 'showToast(`'],
    [/showToast\(`📍 /g, 'showToast(`'],
    
    // Toast messages - success/info
    [/showToast\('✅ /g, "showToast('"],
    [/showToast\("✅ /g, 'showToast("'],
    
    // Button text in events.js
    [/'💔 Remove'/g, "'Remove'"],
    [/'⭐ Favorite'/g, "'Favorite'"],
    [/'📍 Pinned'/g, "'Pinned'"],
    [/'📌 Pin'/g, "'Pin'"],
    
    // Status icons in JavaScript
    [/icon: '✅'/g, "icon: ''"],
    [/icon: '🔒'/g, "icon: ''"],
    [/icon: '✓'/g, "icon: ''"],
    
    // Register.js messages
    [/✅ <strong>Registration Successful!/g, '<strong>Registration Successful!'],
    [/✅ Registration successful!/g, 'Registration successful!'],
    
    // Event management
    [/✅ Edit mode cancelled/g, 'Edit mode cancelled'],
    
    // Checkmarks in lists
    [/<li>✓ /g, '<li>✔ '],
    [/<div class="role-checkmark">✓<\/div>/g, '<div class="role-checkmark">✔</div>'],
];

console.log('Fixing remaining emojis in user-facing messages...\n');

files.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`Processing ${file}...`);
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;
        
        replacements.forEach(([pattern, replacement]) => {
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

console.log('\n✓ Emoji removal complete!');
