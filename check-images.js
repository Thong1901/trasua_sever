const mongoose = require('mongoose');
require('dotenv').config();

const SanPham = require('./model/sanpham');

async function checkImages() {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log('Connected to MongoDB');
    
    const products = await SanPham.find({}).sort({ ngayTao: -1 }).limit(5);
    console.log('Recent products:');
    products.forEach(p => {
      console.log(`ID: ${p._id}`);
      console.log(`Name: ${p.ten}`);
      console.log(`Image: ${p.hinhAnh}`);
      console.log('---');
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkImages();
