const Order = require('../model/donhang');
const ChiTietDonHang = require('../model/chitietdonhang');

// Tạo đơn hàng mới (Create)
const createOrder = async (req, res) => {
  try {
    const { ten_khach, sdt, dia_chi, trang_thai } = req.body;
    
    const order = new Order({
      ten_khach,
      sdt,
      dia_chi,
      trang_thai
    });

    const savedOrder = await order.save();
    res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: savedOrder
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng',
      error: error.message
    });
  }
};

// Lấy tất cả đơn hàng (Read)
const getAllOrders = async (req, res) => {
  try {
    const { trang_thai } = req.query;
    let filter = {};
    
    if (trang_thai) {
      filter.trang_thai = trang_thai;
    }

    const orders = await Order.find(filter).sort({ ngay_dat: -1 });
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách đơn hàng thành công',
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách đơn hàng',
      error: error.message
    });
  }
};

// Lấy đơn hàng theo ID (Read)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Lấy chi tiết đơn hàng
    const chiTietList = await ChiTietDonHang.find({ don_hang_id: id })
      .populate('san_pham_id', 'ten gia hinh_anh mo_ta');

    res.status(200).json({
      success: true,
      message: 'Lấy đơn hàng thành công',
      data: {
        don_hang: order,
        chi_tiet: chiTietList
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy đơn hàng',
      error: error.message
    });
  }
};

// Cập nhật đơn hàng (Update)
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const order = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật đơn hàng thành công',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi cập nhật đơn hàng',
      error: error.message
    });
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    if (!['dang_xu_ly', 'da_giao', 'huy'].includes(trang_thai)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ'
      });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { trang_thai },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật trạng thái đơn hàng thành công',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái đơn hàng',
      error: error.message
    });
  }
};

// Xóa đơn hàng (Delete)
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa đơn hàng thành công',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa đơn hàng',
      error: error.message
    });
  }
};

// Tìm kiếm đơn hàng theo tên khách hàng hoặc số điện thoại
const searchOrders = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    const orders = await Order.find({
      $or: [
        { ten_khach: { $regex: q, $options: 'i' } },
        { sdt: { $regex: q, $options: 'i' } }
      ]
    }).sort({ ngay_dat: -1 });

    res.status(200).json({
      success: true,
      message: 'Tìm kiếm đơn hàng thành công',
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm đơn hàng',
      error: error.message
    });
  }
};

// Lấy thống kê đơn hàng
const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$trang_thai',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalOrders = await Order.countDocuments();

    res.status(200).json({
      success: true,
      message: 'Lấy thống kê đơn hàng thành công',
      data: {
        total: totalOrders,
        byStatus: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê đơn hàng',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  searchOrders,
  getOrderStats
};