const Order = require('../model/donhang');
const SanPham = require('../model/sanpham');

// Tạo đơn hàng hoàn chỉnh (thông tin khách hàng + chi tiết sản phẩm)
const createDonHangHoanChinh = async (req, res) => {
  try {
    // console.log('=== DEBUG: Request body ===');
    // console.log(JSON.stringify(req.body, null, 2));
    
    const { ten_khach, sdt, dia_chi, ghi_chu_don_hang, san_phams } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!san_phams || san_phams.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng phải có ít nhất 1 sản phẩm'
      });
    }

    // Kiểm tra và chuẩn bị dữ liệu sản phẩm
    const sanPhamData = [];
    
    for (let item of san_phams) {
      // console.log('=== DEBUG: Processing item ===');
      // console.log('item:', item);
      
      // Kiểm tra sản phẩm có tồn tại không
      const sanPham = await SanPham.findById(item.san_pham_id);
      if (!sanPham) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm với ID: ${item.san_pham_id}`
        });
      }
      
      // Lấy số lượng từ chi_tiet_san_pham nếu có
      const soLuong = item.chi_tiet_san_pham?.so_luong || item.so_luong;
      const tenSanPham = item.chi_tiet_san_pham?.ten_san_pham || sanPham.ten;
      const gia = item.chi_tiet_san_pham?.gia || sanPham.gia;
      
      // Kiểm tra tồn kho
      if (sanPham.soLuong < soLuong) {
        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${sanPham.ten}" không đủ số lượng trong kho`
        });
      }
      
      // Chuẩn bị dữ liệu sản phẩm
      const sanPhamItem = {
        san_pham_id: item.san_pham_id,
        ten_san_pham: tenSanPham,
        so_luong: soLuong,
        gia_tai_thoi_diem: gia,
        thanh_tien: soLuong * gia,
        ghi_chu: item.ghi_chu || '',
        muc_ngot: item.chi_tiet_san_pham?.muc_ngot || 'vua',
        muc_da: item.chi_tiet_san_pham?.muc_da || 'vua'
      };
      
      sanPhamData.push(sanPhamItem);
      
      // Cập nhật số lượng tồn kho
      await SanPham.findByIdAndUpdate(
        item.san_pham_id,
        { $inc: { soLuong: -soLuong } }
      );
    }
    
    // console.log('=== DEBUG: Creating order with data ===');
    // console.log('sanPhamData:', JSON.stringify(sanPhamData, null, 2));
    
    // Tạo đơn hàng với tất cả thông tin
    const donHang = new Order({
      ten_khach,
      sdt,
      dia_chi,
      ghi_chu_don_hang: ghi_chu_don_hang || '',
      san_phams: sanPhamData
    });
    
    const savedDonHang = await donHang.save();
    // console.log('=== DEBUG: Order saved successfully ===');
    // console.log('savedDonHang:', savedDonHang);
    
    res.status(201).json({
      success: true,
      message: 'Tạo đơn hàng thành công',
      data: savedDonHang
    });
    
  } catch (error) {
    console.error('=== DEBUG: Error creating order ===');
    console.error('error:', error);
    res.status(400).json({
      success: false,
      message: 'Lỗi khi tạo đơn hàng hoàn chỉnh',
      error: error.message
    });
  }
};

// Lấy tất cả đơn hàng
const getAllOrders = async (req, res) => {
  try {
    const { trang_thai } = req.query;
    let filter = {};
    
    if (trang_thai) {
      filter.trang_thai = trang_thai;
    }

    const orders = await Order.find(filter)
      .populate('san_phams.san_pham_id', 'ten gia hinh_anh')
      .sort({ ngay_dat: -1 });
      
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

// Lấy đơn hàng theo ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate('san_phams.san_pham_id', 'ten gia hinh_anh mo_ta');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy đơn hàng thành công',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy đơn hàng',
      error: error.message
    });
  }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { trang_thai } = req.body;

    if (!['cho_xac_nhan', 'dang_xu_ly', 'hoan_thanh', 'da_huy'].includes(trang_thai)) {
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

// Xác nhận đơn hàng (chuyển từ 'cho_xac_nhan' thành 'dang_xu_ly')
const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.trang_thai !== 'cho_xac_nhan') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xác nhận đơn hàng ở trạng thái chờ xác nhận'
      });
    }

    order.trang_thai = 'dang_xu_ly';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Xác nhận đơn hàng thành công',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi xác nhận đơn hàng',
      error: error.message
    });
  }
};

// Hoàn thành đơn hàng (chuyển thành 'hoan_thanh')
const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    if (order.trang_thai !== 'dang_xu_ly') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể hoàn thành đơn hàng đang xử lý'
      });
    }

    order.trang_thai = 'hoan_thanh';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Hoàn thành đơn hàng thành công',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi hoàn thành đơn hàng',
      error: error.message
    });
  }
};

// Hủy đơn hàng (cập nhật trạng thái thành 'da_huy' và hoàn trả kho)
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Chỉ có thể hủy đơn hàng chưa hoàn thành
    if (order.trang_thai === 'hoan_thanh') {
      return res.status(400).json({
        success: false,
        message: 'Không thể hủy đơn hàng đã hoàn thành'
      });
    }

    if (order.trang_thai === 'da_huy') {
      return res.status(400).json({
        success: false,
        message: 'Đơn hàng đã được hủy'
      });
    }

    // Cập nhật trạng thái thành đã hủy
    order.trang_thai = 'da_huy';
    await order.save();

    // Hoàn trả số lượng sản phẩm về kho
    for (let sanPham of order.san_phams) {
      await SanPham.findByIdAndUpdate(
        sanPham.san_pham_id,
        { $inc: { soLuong: sanPham.so_luong } }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Hủy đơn hàng thành công',
      data: order
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi hủy đơn hàng',
      error: error.message
    });
  }
};

// Xóa đơn hàng
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    // Chỉ cho phép xóa đơn hàng đã hủy
    if (order.trang_thai !== 'da_huy') {
      return res.status(400).json({
        success: false,
        message: 'Chỉ có thể xóa đơn hàng đã hủy'
      });
    }

    await Order.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Xóa đơn hàng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa đơn hàng',
      error: error.message
    });
  }
};

module.exports = {
  createDonHangHoanChinh,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  confirmOrder,
  completeOrder,
  cancelOrder,
  deleteOrder
};
