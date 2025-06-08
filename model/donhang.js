const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  khach_hang_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ThongTinKhachHang' 
  },
  ten_khach: { type: String, required: true },
  sdt: { type: String, required: true },
  dia_chi: { type: String, required: true },
  ngay_dat: { type: Date, default: Date.now },
  trang_thai: { 
    type: String, 
    enum: ['cho_xac_nhan', 'dang_xu_ly', 'hoan_thanh', 'da_huy'], 
    default: 'cho_xac_nhan' 
  },
  tong_tien: { type: Number, default: 0 },
  ghi_chu_don_hang: { type: String },
  ngay_cap_nhat: { type: Date, default: Date.now },
  
  // Chi tiết sản phẩm được lưu trực tiếp trong đơn hàng
  san_phams: [{
    san_pham_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'SanPham', 
      required: true 
    },
    ten_san_pham: { type: String, required: true },
    so_luong: { type: Number, required: true, min: 1 },
    gia_tai_thoi_diem: { type: Number, required: true },
    thanh_tien: { type: Number, required: true },
    ghi_chu: { type: String },
    // Thông tin tùy chỉnh sản phẩm
    muc_ngot: { 
      type: String, 
      enum: ['ngot', 'vua', 'it_ngot'], 
      default: 'vua' 
    },
    muc_da: { 
      type: String, 
      enum: ['nhieu', 'vua', 'it', 'khong'], 
      default: 'vua' 
    }
  }]
});

// Middleware để cập nhật ngayCapNhat và tính tổng tiền khi save
orderSchema.pre('save', function(next) {
  this.ngay_cap_nhat = new Date();
  
  // Tính tổng tiền từ các sản phẩm
  this.tong_tien = this.san_phams.reduce((total, item) => {
    // Tính thành tiền cho từng sản phẩm
    item.thanh_tien = item.so_luong * item.gia_tai_thoi_diem;
    return total + item.thanh_tien;
  }, 0);
  
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;