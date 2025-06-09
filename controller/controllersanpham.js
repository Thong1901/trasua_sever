const SanPham = require('../model/sanpham');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper function to convert image to base64
const convertImageToBase64 = (filePath) => {
  try {
    const imageBuffer = fs.readFileSync(filePath);
    const mimeType = path.extname(filePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
    return `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
};

// Helper function to check if file exists
const checkFileExists = (filePath) => {
  const fullPath = path.join(__dirname, '..', filePath);
  return fs.existsSync(fullPath);
};

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

    // Convert image to base64 for backup
    const base64Image = convertImageToBase64(req.file.path);

    // Return the file path and base64
    const imagePath = `/uploads/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Upload hình ảnh thành công',
      data: {
        imagePath: imagePath,
        base64: base64Image,
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
    const { ten, moTa, gia, soLuong, danhMuc, trangThai, hinhAnh, hinhAnhBase64 } = req.body;
    
    const sanPham = new SanPham({
      ten,
      moTa,
      gia,
      soLuong,
      danhMuc,
      trangThai,
      hinhAnh,
      hinhAnhBase64
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
    
    // Check if image files exist and provide fallback
    const sanPhamsWithImageCheck = sanPhams.map(sanPham => {
      const sanPhamObj = sanPham.toObject();
      
      // If image path exists but file is missing, use base64 fallback
      if (sanPhamObj.hinhAnh && !checkFileExists(sanPhamObj.hinhAnh) && sanPhamObj.hinhAnhBase64) {
        sanPhamObj.hinhAnh = sanPhamObj.hinhAnhBase64;
        sanPhamObj.imageSource = 'base64';
      } else if (sanPhamObj.hinhAnh) {
        sanPhamObj.imageSource = 'file';
      }
      
      return sanPhamObj;
    });
    
    res.status(200).json({
      success: true,
      message: 'Lấy danh sách sản phẩm thành công',
      data: sanPhamsWithImageCheck
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

    const sanPhamObj = sanPham.toObject();
    
    // If image path exists but file is missing, use base64 fallback
    if (sanPhamObj.hinhAnh && !checkFileExists(sanPhamObj.hinhAnh) && sanPhamObj.hinhAnhBase64) {
      sanPhamObj.hinhAnh = sanPhamObj.hinhAnhBase64;
      sanPhamObj.imageSource = 'base64';
    } else if (sanPhamObj.hinhAnh) {
      sanPhamObj.imageSource = 'file';
    }

    res.status(200).json({
      success: true,
      message: 'Lấy sản phẩm thành công',
      data: sanPhamObj
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
  upload,
  convertImageToBase64,
  checkFileExists
};