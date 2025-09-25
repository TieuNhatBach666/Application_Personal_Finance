const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Lỗi mặc định
    let error = {
        success: false,
        message: 'Lỗi server nội bộ',
        statusCode: 500
    };

    // Lỗi SQL Server
    if (err.name === 'RequestError') {
        error.message = 'Lỗi truy vấn cơ sở dữ liệu';
        error.statusCode = 400;
    }

    // Lỗi kết nối
    if (err.name === 'ConnectionError') {
        error.message = 'Lỗi kết nối cơ sở dữ liệu';
        error.statusCode = 503;
    }

    // Lỗi xác thực
    if (err.name === 'ValidationError') {
        error.message = 'Dữ liệu không hợp lệ';
        error.statusCode = 400;
        error.details = err.details;
    }

    // Lỗi JWT
    if (err.name === 'JsonWebTokenError') {
        error.message = 'Token không hợp lệ';
        error.statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        error.message = 'Token đã hết hạn';
        error.statusCode = 401;
    }

    // Lỗi khóa trùng lặp (ràng buộc duy nhất)
    if (err.number === 2627 || err.number === 2601) {
        error.message = 'Dữ liệu đã tồn tại';
        error.statusCode = 409;
    }

    // Lỗi ràng buộc khóa ngoại
    if (err.number === 547) {
        error.message = 'Dữ liệu tham chiếu không hợp lệ';
        error.statusCode = 400;
    }

    // Lỗi ứng dụng tùy chỉnh
    if (err.statusCode) {
        error.statusCode = err.statusCode;
        error.message = err.message;
    }

    // Không tiết lộ chi tiết lỗi trong production
    if (process.env.NODE_ENV === 'production') {
        delete error.stack;
    } else {
        error.stack = err.stack;
    }

    res.status(error.statusCode).json(error);
};

// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint không tồn tại',
        path: req.originalUrl
    });
};

// Wrapper lỗi async
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};