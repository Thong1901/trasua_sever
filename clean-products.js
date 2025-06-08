const mongoose = require('mongoose');
const SanPham = require('./model/sanpham');
require('dotenv').config();

async function cleanProductFields() {
  try {
    // Kết nối MongoDB
    const uri = process.env.ATLAS_URI;
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    
    // Sử dụng MongoDB native collection để xóa field
    const db = mongoose.connection.db;
    const collection = db.collection('sanphams');
    
    const result = await collection.updateMany(
      {},
      { $unset: { so_luong_ton: "" } }
    );
    
    console.log('Removed so_luong_ton field from documents:', result);
    
    // Lấy danh sách sản phẩm để kiểm tra
    const products = await SanPham.find({});
    console.log('Current products after cleanup:');
    products.forEach(p => {
      console.log(`- ${p.ten}: ${p.soLuong} items`);
      console.log(`  Has so_luong_ton:`, p.toObject().hasOwnProperty('so_luong_ton'));
    });
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning products:', error);
    process.exit(1);
  }
}

cleanProductFields();
