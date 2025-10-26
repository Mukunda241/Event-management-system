const fs = require('fs');
const path = require('path');

const files = [
    'event-template.js',
    'my-tickets.js',
    'event-management.js',
    'script.js'
];

const replacements = [
    // Console logs and toast messages
    [/console\.(log|error)\("❌/g, 'console.$1("'],
    [/console\.(log|error)\("✅/g, 'console.$1("'],
    [/console\.(log|error)\("🔍/g, 'console.$1("'],
    [/console\.(log|error)\("🗑️/g, 'console.$1("'],
    [/console\.(log|error)\('❌/g, "console.$1('"],
    [/showToast\("❌/g, 'showToast("'],
    [/showToast\("✅/g, 'showToast("'],
    [/showToast\("🎉/g, 'showToast("'],
    [/showToast\("❤️/g, 'showToast("'],
    [/showToast\("💔/g, 'showToast("'],
    [/showToast\("📌/g, 'showToast("'],
    [/showToast\("📋/g, 'showToast("'],
    [/showToast\("📥/g, 'showToast("'],
    [/showToast\("👋/g, 'showToast("'],
    [/showToast\("🔄/g, 'showToast("'],
    [/showToast\('❌/g, "showToast('"],
    [/showToast\(`❌/g, "showToast(`"],
    [/showToast\(`✅/g, "showToast(`"],
    [/showToast\(`❤️/g, "showToast(`"],
    [/showToast\(`🎉/g, "showToast(`"],
    [/showToast\(`✓/g, "showToast(`"],
    // Comments
    [/\/\/ 🎫/g, '//'],
    [/\/\/ ❌/g, '//'],
    [/\/\/ ✅/g, '//'],
];

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
            console.log(`✓ Updated ${file}`);
        } else {
            console.log(`- No changes in ${file}`);
        }
    } else {
        console.log(`× File not found: ${file}`);
    }
});

console.log('\nEmoji removal complete!');
