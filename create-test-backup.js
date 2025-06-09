const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import model
const SanPham = require('./model/sanpham');

// Helper function to convert image to base64
const convertImageToBase64 = (filePath) => {
  try {
    const fullPath = path.join(__dirname, filePath);
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

const createTestProduct = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.ATLAS_URI);
    console.log('✅ Connected to MongoDB');

    // Find an existing image file
    const uploadsDir = path.join(__dirname, 'uploads');
    const files = fs.readdirSync(uploadsDir);
    
    if (files.length === 0) {
      console.log('❌ No image files found in uploads directory');
      return;
    }

    const imageFile = files[0];
    const imagePath = `/uploads/${imageFile}`;
    const imageBase64 = convertImageToBase64(`uploads/${imageFile}`);

    console.log(`📷 Using image: ${imageFile}`);
    console.log(`📁 Image path: ${imagePath}`);
    console.log(`💾 Base64 length: ${imageBase64 ? imageBase64.length : 0} characters`);

    // Create test product
    const testProduct = new SanPham({
      ten: 'Trà Sữa Test Backup',
      moTa: 'Sản phẩm test với hệ thống backup hình ảnh mới',
      gia: 35000,
      soLuong: 50,
      danhMuc: 'Trà Sữa Truyền Thống',
      trangThai: 'co_san',
      hinhAnh: imagePath,
      hinhAnhBase64: imageBase64
    });

    const savedProduct = await testProduct.save();
    
    console.log('\n✅ Test product created successfully!');
    console.log(`   ID: ${savedProduct._id}`);
    console.log(`   Name: ${savedProduct.ten}`);
    console.log(`   Image Path: ${savedProduct.hinhAnh}`);
    console.log(`   Base64 Backup: ${savedProduct.hinhAnhBase64 ? 'YES' : 'NO'}`);

    // Test fallback mechanism
    console.log('\n🧪 Testing fallback mechanism...');
    
    // Simulate file missing
    const testImagePath = '/uploads/missing-file.jpg';
    
    if (!fs.existsSync(path.join(__dirname, testImagePath.substring(1)))) {
      console.log('✅ File missing scenario confirmed');
      
      if (savedProduct.hinhAnhBase64) {
        console.log('✅ Base64 backup available for fallback');
        console.log(`   Fallback image size: ${(savedProduct.hinhAnhBase64.length / 1024).toFixed(2)} KB`);
      } else {
        console.log('❌ No base64 backup available');
      }
    }

  } catch (error) {
    console.error('❌ Error creating test product:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔐 Disconnected from database');
    process.exit(0);
  }
};

// Run the test
console.log('🚀 Creating test product with backup system...');
createTestProduct();
