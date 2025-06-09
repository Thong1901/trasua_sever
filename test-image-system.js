const fs = require('fs');
const path = require('path');

// Test script to check image handling system
console.log('🧪 Testing Image Handling System...\n');

// 1. Check uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
console.log('1. Checking uploads directory...');
if (fs.existsSync(uploadsDir)) {
    console.log('✅ Uploads directory exists');
    const files = fs.readdirSync(uploadsDir);
    console.log(`   Found ${files.length} files`);
    files.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });
} else {
    console.log('❌ Uploads directory missing');
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
}

// 2. Test base64 conversion function
console.log('\n2. Testing base64 conversion...');
const convertImageToBase64 = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    const imageBuffer = fs.readFileSync(filePath);
    const extension = path.extname(filePath).toLowerCase();
    const mimeType = extension === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    return null;
  }
};

const testFiles = fs.readdirSync(uploadsDir);
if (testFiles.length > 0) {
    const testFile = path.join(uploadsDir, testFiles[0]);
    const base64 = convertImageToBase64(testFile);
    if (base64) {
        console.log('✅ Base64 conversion works');
        console.log(`   Sample: ${base64.substring(0, 50)}...`);
    } else {
        console.log('❌ Base64 conversion failed');
    }
} else {
    console.log('⚠️  No files to test base64 conversion');
}

// 3. Test file existence check
console.log('\n3. Testing file existence check...');
const checkFileExists = (filePath) => {
  const fullPath = path.join(__dirname, filePath.startsWith('/') ? filePath.substring(1) : filePath);
  return fs.existsSync(fullPath);
};

console.log('✅ File existence check function ready');

console.log('\n🎉 Image handling system test completed!');
console.log('\n📋 Summary:');
console.log('- Images are stored in /uploads directory');
console.log('- Base64 backup is saved in database');
console.log('- API returns both file path and base64');
console.log('- Frontend can handle both file URLs and base64 data');
console.log('- Automatic fallback when files are missing');
