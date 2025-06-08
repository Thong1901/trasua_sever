const express = require('express');
const router = express.Router();
const {
  createSanPham,
  getAllSanPham,
  getSanPhamById,
  updateSanPham,
  deleteSanPham,
  searchSanPham
} = require('../controller/controllersanpham');

// Route cho sản phẩm
router.post('/', createSanPham);                    // Tạo sản phẩm mới
router.get('/', getAllSanPham);                     // Lấy tất cả sản phẩm
router.get('/search', searchSanPham);               // Tìm kiếm sản phẩm
router.get('/:id', getSanPhamById);                 // Lấy sản phẩm theo ID
router.put('/:id', updateSanPham);                  // Cập nhật sản phẩm
router.delete('/:id', deleteSanPham);               // Xóa sản phẩm

module.exports = router;