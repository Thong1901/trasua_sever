const mongoose = require('mongoose');

const sanPhamSchema = new mongoose.Schema({
  ten: { type: String, required: true },
  moTa: { type: String },
  gia: { type: Number, required: true },
  soLuong: { type: Number, default: 0 },
  danhMuc: { 
    type: String, 
    required: true,
    enum: [
      'Trà Sữa',
      'Trà'
    ]
  },
  trangThai: { 
    type: String, 
    enum: ['co_san', 'het_hang'], 
    default: 'co_san' 
  },
  hinhAnh: { type: String }, // URL path to image file
  hinhAnhBase64: { type: String }, // Base64 backup of image
  ngayTao: { type: Date, default: Date.now },
  ngayCapNhat: { type: Date, default: Date.now }
});

// Middleware để cập nhật ngayCapNhat khi save
sanPhamSchema.pre('save', function(next) {
  this.ngayCapNhat = new Date();
  next();
});

const SanPham = mongoose.model('SanPham', sanPhamSchema);

module.exports = SanPham;
