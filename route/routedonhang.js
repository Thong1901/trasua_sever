const express = require('express');
const router = express.Router();
const {
  createDonHangHoanChinh,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  deleteOrder
} = require('../controller/controllerdonhang_new');

// Route cho đơn hàng
router.post('/full', createDonHangHoanChinh);        // Tạo đơn hàng hoàn chỉnh
router.get('/', getAllOrders);                       // Lấy tất cả đơn hàng
router.get('/:id', getOrderById);                    // Lấy đơn hàng theo ID
router.patch('/:id/status', updateOrderStatus);     // Cập nhật trạng thái đơn hàng
router.patch('/:id/cancel', cancelOrder);           // Hủy đơn hàng (hoàn trả kho)
router.delete('/:id', deleteOrder);                 // Xóa đơn hàng (chỉ với đơn đã hủy)

module.exports = router;