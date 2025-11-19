# Create a simple test file
cat > file-check.js << 'EOF'
const fs = require('fs');
const path = require('path');

console.log('📍 Current directory:', process.cwd());
console.log('📁 Root contents:');
fs.readdirSync('.').forEach(f => console.log('  - ' + f));

console.log('\n🔍 Checking for public folder...');
if (fs.existsSync('public')) {
    console.log('📁 Public folder contents:');
    fs.readdirSync('public').forEach(f => console.log('  - ' + f));
} else {
    console.log('❌ No public folder found');
}

console.log('\n🔍 Checking for netlify folder...');
if (fs.existsSync('netlify')) {
    console.log('📁 Netlify folder contents:');
    fs.readdirSync('netlify').forEach(f => console.log('  - ' + f));
    
    if (fs.existsSync('netlify/functions')) {
        console.log('📁 Netlify functions contents:');
        fs.readdirSync('netlify/functions').forEach(f => console.log('  - ' + f));
    }
}
EOF