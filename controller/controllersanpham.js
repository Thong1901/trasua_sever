const SanPham = require('../model/sanpham');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer cho upload file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file hình ảnh!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// Upload image endpoint
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Không có file được upload'
      });
    }

    // Return the file path
    const imagePath = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Upload hình ảnh thành công',
      data: {
        imagePath: imagePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi upload hình ảnh',
      error: error.message
    });
  }
};

// Tạo sản phẩm mới (Create)
const createSanPham = async (req, res) => {
  try {
    const { ten, moTa, gia, soLuong, danhMuc, trangThai, hinhAnh } = req.body;
    
    const sanPham = new SanPham({
      ten,
      moTa,
      gia,
      soLuong,
      danhMuc,
      trangThai,
      hinhAnh
    });

    const savedSanPham = await sanPham.save();
    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: savedSanPham
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi tạo sản phẩm',
      error: error.message
    });
  }
};

// Lấy tất cả sản phẩm (Read)
const getAllSanPham = async (req, res) => {
  try {
    const { danhMuc, trangThai } = req.query;
    let filter = {};
    
    // Lọc theo danh mục
    if (danhMuc && danhMuc !== 'all') {
      filter.danhMuc = danhMuc;
    }
    
    // Lọc theo trạng thái
    if (trangThai && trangThai !== 'all') {
      filter.trangThai = trangThai;
    }
    
    const sanPhams = await SanPham.find(filter).sort({ ngayCapNhat: -1 });
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: sanPhams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: error.message
    });
  }
};

// Lấy sản phẩm theo ID (Read)
const getSanPhamById = async (req, res) => {
  try {
    const { id } = req.params;
    const sanPham = await SanPham.findById(id);
    
    if (!sanPham) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lấy sản phẩm thành công',
      data: sanPham
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sản phẩm',
      error: error.message
    });
  }
};

// Cập nhật sản phẩm (Update)
const updateSanPham = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const sanPham = await SanPham.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!sanPham) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: sanPham
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message
    });
  }
};

// Xóa sản phẩm (Delete)
const deleteSanPham = async (req, res) => {
  try {
    const { id } = req.params;
    const sanPham = await SanPham.findByIdAndDelete(id);

    if (!sanPham) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm thành công',
      data: sanPham
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm',
      error: error.message
    });
  }
};

// Tìm kiếm sản phẩm theo tên và mô tả
const searchSanPham = async (req, res) => {
  try {
    const { q, danhMuc, trangThai } = req.query;
    
    let filter = {};
    
    // Tìm kiếm theo từ khóa
    if (q) {
      filter.$or = [
        { ten: { $regex: q, $options: 'i' } },
        { moTa: { $regex: q, $options: 'i' } }
      ];
    }
    
    // Lọc theo danh mục
    if (danhMuc && danhMuc !== 'all') {
      filter.danhMuc = danhMuc;
    }
    
    // Lọc theo trạng thái
    if (trangThai && trangThai !== 'all') {
      filter.trangThai = trangThai;
    }

    const sanPhams = await SanPham.find(filter).sort({ ngayCapNhat: -1 });

    res.status(200).json({
      success: true,
      message: 'Tìm kiếm sản phẩm thành công',
      data: sanPhams
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm sản phẩm',
      error: error.message
    });
  }
};

module.exports = {
  createSanPham,
  getAllSanPham,
  getSanPhamById,
  updateSanPham,
  deleteSanPham,
  searchSanPham,
  uploadImage,
  upload
};