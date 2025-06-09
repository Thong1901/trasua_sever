const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

console.log('Checking uploads directory...');
console.log('Directory path:', uploadsDir);

if (fs.existsSync(uploadsDir)) {
    console.log('✅ Uploads directory exists');
    
    const files = fs.readdirSync(uploadsDir);
    console.log(`Found ${files.length} files:`);
    
    files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        console.log(`  - ${file} (${(stats.size / 1024).toFixed(2)} KB, modified: ${stats.mtime})`);
    });
} else {
    console.log('❌ Uploads directory does not exist');
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Uploads directory created');
}
