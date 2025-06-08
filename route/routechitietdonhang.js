const express = require('express');
const router = express.Router();
const {
  createChiTietDonHang,
  getChiTietByDonHangId,
  getAllChiTietDonHang,
  updateChiTietDonHang,
  deleteChiTietDonHang,
  getDonHangDayDu,
  createDonHangHoanChinh
} = require('../controller/controllerchitietdonhang');

// Route cho chi tiết đơn hàng
router.post('/', createChiTietDonHang);                           // Thêm chi tiết đơn hàng
router.get('/', getAllChiTietDonHang);                           // Lấy tất cả chi tiết đơn hàng
router.get('/donhang/:don_hang_id', getChiTietByDonHangId);      // Lấy chi tiết theo đơn hàng ID
router.get('/full/:don_hang_id', getDonHangDayDu);              // Lấy đơn hàng đầy đủ
router.post('/full', createDonHangHoanChinh);                   // Tạo đơn hàng hoàn chỉnh
router.put('/:id', updateChiTietDonHang);                       // Cập nhật chi tiết đơn hàng
router.delete('/:id', deleteChiTietDonHang);                    // Xóa chi tiết đơn hàng

module.exports = router;
