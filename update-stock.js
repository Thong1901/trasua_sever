const mongoose = require('mongoose');
const SanPham = require('./model/sanpham');
require('dotenv').config();

// Kết nối MongoDB
const uri = process.env.ATLAS_URI;
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function updateProductStock() {
  try {
    // Cập nhật tất cả sản phẩm có soLuong = 50
    const result = await SanPham.updateMany(
      {},
      { $set: { soLuong: 50 } }
    );
    
    console.log('Updated products:', result);
    
    // Lấy danh sách sản phẩm để kiểm tra
    const products = await SanPham.find({});
    console.log('Current products:');
    products.forEach(p => {
      console.log(`- ${p.ten}: ${p.soLuong} items`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating products:', error);
    process.exit(1);
  }
}

updateProductStock();
