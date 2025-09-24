const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getPool, SCHEMA_INFO } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Fix Vietnamese encoding issues
const fixVietnameseEncoding = (text) => {
    if (!text) return text;
    
    const vietnameseMap = {
        'ThÆ°á»Ÿng': 'Thưởng',
        'LÆ°Æ¡ng': 'Lương',
        'Ă°n uá»ng': 'Ăn uống',
        'Äi láº¡i': 'Đi lại',
        'Há»c táº­p': 'Học tập',
        'Giáº£i trÃ­': 'Giải trí',
        'Phá»¥ cáº¥p': 'Phụ cấp',
        'Thu nháº­p khác': 'Thu nhập khác',
        'Chi tiêu khác': 'Chi tiêu khác',
        'Chi tiÃªu khÃ¡c': 'Chi tiêu khác',
        'Mua sáº¯m': 'Mua sắm',
        'Há»a Äá»n': 'Hóa đơn',
        'HÃ³a Äá»n': 'Hóa đơn',
        'Nhà á»Ÿ': 'Nhà ở',
        'NhÃ  á»Ÿ': 'Nhà ở',
        'Quáº§n Ã¡o': 'Quần áo',
        'Y tá»': 'Y tế',
        'Äáº§u tÆ°': 'Đầu tư',
        'Giáº£i trÃ­': 'Giải trí'
    };
    
    let fixed = text;
    for (const [key, value] of Object.entries(vietnameseMap)) {
        fixed = fixed.replace(new RegExp(key, 'g'), value);
    }
    
    return fixed;
};

// Get all categories for user
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const pool = getPool();
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .query(`
            SELECT 
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID} as id,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME} as name,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE} as type,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ICON} as icon,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.COLOR} as color,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE} as isActive,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.CREATED_AT} as createdAt
            FROM ${SCHEMA_INFO.TABLES.CATEGORIES}
            WHERE ${SCHEMA_INFO.COLUMNS.CATEGORIES.USER_ID} = @userId
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE} = 1
            ORDER BY ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE}, ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME}
        `);
    
    res.json({
        success: true,
        data: result.recordset
    });
}));

// Get categories by type
router.get('/type/:type', authenticateToken, asyncHandler(async (req, res) => {
    const { type } = req.params;
    
    if (!['Income', 'Expense'].includes(type)) {
        return res.status(400).json({
            success: false,
            message: 'Loại danh mục phải là Income hoặc Expense'
        });
    }
    
    const pool = getPool();
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .input('type', type)
        .query(`
            SELECT 
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID} as id,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME} as name,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE} as type,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ICON} as icon,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.COLOR} as color,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE} as isActive,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.CREATED_AT} as createdAt
            FROM ${SCHEMA_INFO.TABLES.CATEGORIES}
            WHERE ${SCHEMA_INFO.COLUMNS.CATEGORIES.USER_ID} = @userId
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE} = @type
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE} = 1
            ORDER BY ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME}
        `);
    
    res.json({
        success: true,
        data: result.recordset
    });
}));

// Create new category
router.post('/', authenticateToken, validate('createCategory'), asyncHandler(async (req, res) => {
    const { name, type, icon, color } = req.validatedData;
    
    const pool = getPool();
    
    // Check if category name already exists for this user and type
    const existingCategory = await pool.request()
        .input('userId', req.user.id)
        .input('name', name)
        .input('type', type)
        .query(`
            SELECT ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID}
            FROM ${SCHEMA_INFO.TABLES.CATEGORIES}
            WHERE ${SCHEMA_INFO.COLUMNS.CATEGORIES.USER_ID} = @userId
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME} = @name
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE} = @type
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE} = 1
        `);
    
    if (existingCategory.recordset.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'Danh mục với tên này đã tồn tại'
        });
    }
    
    // Create new category
    const categoryId = uuidv4();
    await pool.request()
        .input('categoryId', categoryId)
        .input('userId', req.user.id)
        .input('name', name)
        .input('type', type)
        .input('icon', icon || 'default')
        .input('color', color || '#3498db')
        .query(`
            INSERT INTO ${SCHEMA_INFO.TABLES.CATEGORIES} (
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.USER_ID},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ICON},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.COLOR},
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE}
            ) VALUES (
                @categoryId, @userId, @name, @type, @icon, @color, 1
            )
        `);
    
    // Get the created category
    const result = await pool.request()
        .input('categoryId', categoryId)
        .query(`
            SELECT 
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID} as id,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME} as name,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE} as type,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ICON} as icon,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.COLOR} as color,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE} as isActive,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.CREATED_AT} as createdAt
            FROM ${SCHEMA_INFO.TABLES.CATEGORIES}
            WHERE ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID} = @categoryId
        `);
    
    res.status(201).json({
        success: true,
        message: 'Danh mục đã được tạo thành công',
        data: result.recordset[0]
    });
}));

// Update category
router.put('/:id', authenticateToken, validate('createCategory'), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, type, icon, color } = req.validatedData;
    
    const pool = getPool();
    
    // Check if category exists and belongs to user
    const existingCategory = await pool.request()
        .input('categoryId', id)
        .input('userId', req.user.id)
        .query(`
            SELECT ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID}
            FROM ${SCHEMA_INFO.TABLES.CATEGORIES}
            WHERE ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID} = @categoryId
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.USER_ID} = @userId
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE} = 1
        `);
    
    if (existingCategory.recordset.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Danh mục không tồn tại'
        });
    }
    
    // Check if new name conflicts with existing categories
    const nameConflict = await pool.request()
        .input('categoryId', id)
        .input('userId', req.user.id)
        .input('name', name)
        .input('type', type)
        .query(`
            SELECT ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID}
            FROM ${SCHEMA_INFO.TABLES.CATEGORIES}
            WHERE ${SCHEMA_INFO.COLUMNS.CATEGORIES.USER_ID} = @userId
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME} = @name
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE} = @type
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID} != @categoryId
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE} = 1
        `);
    
    if (nameConflict.recordset.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'Danh mục với tên này đã tồn tại'
        });
    }
    
    // Update category
    await pool.request()
        .input('categoryId', id)
        .input('name', name)
        .input('type', type)
        .input('icon', icon || 'default')
        .input('color', color || '#3498db')
        .query(`
            UPDATE ${SCHEMA_INFO.TABLES.CATEGORIES}
            SET 
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME} = @name,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE} = @type,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ICON} = @icon,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.COLOR} = @color,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.UPDATED_AT} = GETUTCDATE()
            WHERE ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID} = @categoryId
        `);
    
    // Get updated category
    const result = await pool.request()
        .input('categoryId', id)
        .query(`
            SELECT 
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID} as id,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.NAME} as name,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.TYPE} as type,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.ICON} as icon,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.COLOR} as color,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE} as isActive,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.UPDATED_AT} as updatedAt
            FROM ${SCHEMA_INFO.TABLES.CATEGORIES}
            WHERE ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID} = @categoryId
        `);
    
    res.json({
        success: true,
        message: 'Danh mục đã được cập nhật thành công',
        data: result.recordset[0]
    });
}));

// Delete category
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const pool = getPool();
    
    // Check if category exists and belongs to user
    const existingCategory = await pool.request()
        .input('categoryId', id)
        .input('userId', req.user.id)
        .query(`
            SELECT ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID}
            FROM ${SCHEMA_INFO.TABLES.CATEGORIES}
            WHERE ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID} = @categoryId
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.USER_ID} = @userId
            AND ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE} = 1
        `);
    
    if (existingCategory.recordset.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Danh mục không tồn tại'
        });
    }
    
    // Check if category is being used in transactions
    const transactionCount = await pool.request()
        .input('categoryId', id)
        .query(`
            SELECT COUNT(*) as count
            FROM ${SCHEMA_INFO.TABLES.TRANSACTIONS}
            WHERE ${SCHEMA_INFO.COLUMNS.TRANSACTIONS.CATEGORY_ID} = @categoryId
        `);
    
    if (transactionCount.recordset[0].count > 0) {
        return res.status(400).json({
            success: false,
            message: 'Không thể xóa danh mục đang được sử dụng trong giao dịch'
        });
    }
    
    // Soft delete category
    await pool.request()
        .input('categoryId', id)
        .query(`
            UPDATE ${SCHEMA_INFO.TABLES.CATEGORIES}
            SET 
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.IS_ACTIVE} = 0,
                ${SCHEMA_INFO.COLUMNS.CATEGORIES.UPDATED_AT} = GETUTCDATE()
            WHERE ${SCHEMA_INFO.COLUMNS.CATEGORIES.ID} = @categoryId
        `);
    
    res.json({
        success: true,
        message: 'Danh mục đã được xóa thành công'
    });
}));

module.exports = router;