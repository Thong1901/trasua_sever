const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import model
const SanPham = require('./model/sanpham');

// Helper function to convert image to base64
const convertImageToBase64 = (filePath) => {
  try {
    const fullPath = path.join(__dirname, filePath.startsWith('/') ? filePath.substring(1) : filePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    const imageBuffer = fs.readFileSync(fullPath);
    const extension = path.extname(filePath).toLowerCase();
    const mimeType = extension === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

const backupExistingImages = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n🔍 Finding products with images...');
    const products = await SanPham.find({ 
      hinhAnh: { $exists: true, $ne: '' },
      hinhAnhBase64: { $exists: false } 
    });

    console.log(`Found ${products.length} products with images to backup`);

    let successCount = 0;
    let failCount = 0;

    for (const product of products) {
      console.log(`\n📷 Processing: ${product.ten}`);
      console.log(`   Image path: ${product.hinhAnh}`);
      
      const base64 = convertImageToBase64(product.hinhAnh);
      
      if (base64) {
        try {
          product.hinhAnhBase64 = base64;
          await product.save();
          console.log('   ✅ Base64 backup saved');
          successCount++;
        } catch (saveError) {
          console.log('   ❌ Failed to save base64:', saveError.message);
          failCount++;
        }
      } else {
        console.log('   ⚠️  Image file not found, skipping');
        failCount++;
      }
    }

    console.log(`\n📊 Backup Summary:`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📝 Total: ${products.length}`);

  } catch (error) {
    console.error('❌ Error during backup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔐 Disconnected from database');
    process.exit(0);
  }
};

// Run the backup
console.log('🚀 Starting image backup process...');
backupExistingImages();
