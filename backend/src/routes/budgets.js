const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getPool, SCHEMA_INFO } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Lấy tất cả ngân sách của user
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    // Vô hiệu hóa cache để force refresh
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    const pool = getPool();
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .query(`
            SELECT 
                b.BudgetID as id,
                b.CategoryID as categoryId,
                b.BudgetName as name,
                b.BudgetAmount as totalAmount,
                ISNULL((
                    SELECT SUM(t.Amount) 
                    FROM Transactions t 
                    WHERE t.CategoryID = b.CategoryID 
                        AND t.UserID = b.UserID
                        AND t.Type = 'Expense'
                        AND t.TransactionDate >= b.StartDate 
                        AND t.TransactionDate <= b.EndDate
                ), 0) as spentAmount,
                b.Period as period,
                b.StartDate as startDate,
                b.EndDate as endDate,
                b.WarningThreshold as warningThreshold,
                c.Color as color,
                b.IsActive as isActive,
                c.CategoryName as categoryName,
                c.Icon as categoryIcon,
                b.CreatedAt as createdAt,
                b.UpdatedAt as updatedAt
            FROM Budgets b
            INNER JOIN Categories c ON b.CategoryID = c.CategoryID
            WHERE b.UserID = @userId AND b.IsActive = 1
            ORDER BY b.CreatedAt DESC
        `);
    
    res.json({
        success: true,
        data: result.recordset
    });
}));

// Lấy ngân sách theo ID
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
        .input('budgetId', id)
        .input('userId', req.user.id)
        .query(`
            SELECT 
                b.BudgetID as id,
                b.CategoryID as categoryId,
                b.BudgetName as name,
                b.BudgetAmount as totalAmount,
                ISNULL((
                    SELECT SUM(t.Amount) 
                    FROM Transactions t 
                    WHERE t.CategoryID = b.CategoryID 
                        AND t.UserID = b.UserID
                        AND t.Type = 'Expense'
                        AND t.TransactionDate >= b.StartDate 
                        AND t.TransactionDate <= b.EndDate
                ), 0) as spentAmount,
                b.Period as period,
                b.StartDate as startDate,
                b.EndDate as endDate,
                b.WarningThreshold as warningThreshold,
                c.Color as color,
                b.IsActive as isActive,
                b.CreatedAt as createdAt,
                b.UpdatedAt as updatedAt,
                c.CategoryName as categoryName,
                c.Icon as categoryIcon
            FROM Budgets b
            LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
            WHERE b.BudgetID = @budgetId AND b.UserID = @userId AND b.IsActive = 1
        `);
    
    if (result.recordset.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Ngân sách không tồn tại'
        });
    }
    
    res.json({
        success: true,
        data: result.recordset[0]
    });
}));

// Tạo ngân sách mới
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { name, categoryId, totalAmount, period, warningThreshold, color } = req.body;
    
    // Xác thực dữ liệu
    if (!name || !totalAmount || !period) {
        return res.status(400).json({
            success: false,
            message: 'Tên, số tiền và chu kỳ là bắt buộc'
        });
    }
    
    if (totalAmount <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Số tiền ngân sách phải lớn hơn 0'
        });
    }
    
    if (!['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(period)) {
        return res.status(400).json({
            success: false,
            message: 'Chu kỳ không hợp lệ'
        });
    }
    
    const pool = getPool();
    const budgetId = uuidv4();
    
    // Tính toán khoảng thời gian dựa trên chu kỳ
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
        case 'daily':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'weekly':
            const dayOfWeek = now.getDay();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - dayOfWeek);
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            startDate = startOfWeek;
            endDate = endOfWeek;
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            // Get last day of current month correctly
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            endDate = new Date(now.getFullYear(), now.getMonth(), lastDayOfMonth);
            break;
        case 'quarterly':
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            const lastDayOfQuarter = new Date(now.getFullYear(), quarter * 3 + 3, 0).getDate();
            endDate = new Date(now.getFullYear(), quarter * 3 + 2, lastDayOfQuarter);
            break;
        case 'yearly':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            break;
    }
    
    await pool.request()
        .input('budgetId', budgetId)
        .input('userId', req.user.id)
        .input('categoryId', categoryId || null)
        .input('name', name)
        .input('totalAmount', totalAmount)
        .input('period', period)
        .input('startDate', startDate.toISOString().split('T')[0])
        .input('endDate', endDate.toISOString().split('T')[0])
        .input('warningThreshold', warningThreshold || 80)
        .query(`
            INSERT INTO Budgets (
                BudgetID, UserID, CategoryID, BudgetName, BudgetAmount, 
                Period, StartDate, EndDate, WarningThreshold
            ) VALUES (
                @budgetId, @userId, @categoryId, @name, @totalAmount,
                @period, @startDate, @endDate, @warningThreshold
            )
        `);
    
    // Lấy ngân sách vừa tạo
    const result = await pool.request()
        .input('budgetId', budgetId)
        .input('userId', req.user.id)
        .query(`
            SELECT 
                b.BudgetID as id,
                b.CategoryID as categoryId,
                b.BudgetName as name,
                b.BudgetAmount as totalAmount,
                ISNULL((
                    SELECT SUM(t.Amount) 
                    FROM Transactions t 
                    WHERE t.CategoryID = b.CategoryID 
                        AND t.UserID = b.UserID
                        AND t.Type = 'Expense'
                        AND t.TransactionDate >= b.StartDate 
                        AND t.TransactionDate <= b.EndDate
                ), 0) as spentAmount,
                b.Period as period,
                b.StartDate as startDate,
                b.EndDate as endDate,
                b.WarningThreshold as warningThreshold,
                c.Color as color,
                b.IsActive as isActive,
                c.CategoryName as categoryName,
                c.Icon as categoryIcon,
                b.CreatedAt as createdAt,
                b.UpdatedAt as updatedAt
            FROM Budgets b
            LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
            WHERE b.BudgetID = @budgetId AND b.UserID = @userId
        `);
    
    const createdBudget = result.recordset[0];
    
    res.status(201).json({
        success: true,
        message: 'Ngân sách đã được tạo thành công',
        data: createdBudget
    });
}));

// Cập nhật ngân sách
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, categoryId, totalAmount, period, warningThreshold, color } = req.body;
    
    const pool = getPool();
    
    // Kiểm tra xem ngân sách có tồn tại và thuộc về user không
    const existingBudget = await pool.request()
        .input('budgetId', id)
        .input('userId', req.user.id)
        .query(`
            SELECT BudgetID FROM Budgets 
            WHERE BudgetID = @budgetId AND UserID = @userId AND IsActive = 1
        `);
    
    if (existingBudget.recordset.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Ngân sách không tồn tại'
        });
    }
    
    await pool.request()
        .input('budgetId', id)
        .input('name', name)
        .input('categoryId', categoryId || null)
        .input('totalAmount', totalAmount)
        .input('period', period)
        .input('warningThreshold', warningThreshold || 80)
        .query(`
            UPDATE Budgets SET
                BudgetName = @name,
                CategoryID = @categoryId,
                BudgetAmount = @totalAmount,
                Period = @period,
                WarningThreshold = @warningThreshold,
                UpdatedAt = GETUTCDATE()
            WHERE BudgetID = @budgetId
        `);
    
    // Lấy ngân sách đã cập nhật
    const result = await pool.request()
        .input('budgetId', id)
        .input('userId', req.user.id)
        .query(`
            SELECT 
                b.BudgetID as id,
                b.CategoryID as categoryId,
                b.BudgetName as name,
                b.BudgetAmount as totalAmount,
                ISNULL((
                    SELECT SUM(t.Amount) 
                    FROM Transactions t 
                    WHERE t.CategoryID = b.CategoryID 
                        AND t.UserID = b.UserID
                        AND t.Type = 'Expense'
                        AND t.TransactionDate >= b.StartDate 
                        AND t.TransactionDate <= b.EndDate
                ), 0) as spentAmount,
                b.Period as period,
                b.StartDate as startDate,
                b.EndDate as endDate,
                b.WarningThreshold as warningThreshold,
                c.Color as color,
                b.IsActive as isActive,
                c.CategoryName as categoryName,
                c.Icon as categoryIcon,
                b.CreatedAt as createdAt,
                b.UpdatedAt as updatedAt
            FROM Budgets b
            LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
            WHERE b.BudgetID = @budgetId AND b.UserID = @userId
        `);
    
    const updatedBudget = result.recordset[0];
    
    res.json({
        success: true,
        message: 'Ngân sách đã được cập nhật thành công',
        data: updatedBudget
    });
}));

// Xóa ngân sách
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pool = getPool();
    
    // Kiểm tra xem ngân sách có tồn tại và thuộc về user không
    const existingBudget = await pool.request()
        .input('budgetId', id)
        .input('userId', req.user.id)
        .query(`
            SELECT BudgetID FROM Budgets 
            WHERE BudgetID = @budgetId AND UserID = @userId AND IsActive = 1
        `);
    
    if (existingBudget.recordset.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Ngân sách không tồn tại'
        });
    }
    
    // Xóa mềm
    await pool.request()
        .input('budgetId', id)
        .query(`
            UPDATE Budgets SET 
                IsActive = 0,
                UpdatedAt = GETUTCDATE()
            WHERE BudgetID = @budgetId
        `);
    
    res.json({
        success: true,
        message: 'Ngân sách đã được xóa thành công'
    });
}));

// Cập nhật số tiền đã chi (được gọi khi thêm/cập nhật giao dịch)
router.patch('/:id/spent', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { spentAmount } = req.body;
    
    const pool = getPool();
    
    // Cập nhật thủ công cho ngân sách cụ thể này
    await pool.request()
        .input('budgetId', id)
        .input('spentAmount', spentAmount)
        .query(`
            UPDATE Budgets 
            SET SpentAmount = @spentAmount, UpdatedAt = GETUTCDATE()
            WHERE BudgetID = @budgetId
        `);
    
    res.json({
        success: true,
        message: 'Số tiền đã chi đã được cập nhật'
    });
}));

// Lấy tóm tắt ngân sách
router.get('/summary/current', authenticateToken, asyncHandler(async (req, res) => {
    // Vô hiệu hóa cache để force refresh
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    const pool = getPool();
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .query(`
            WITH BudgetSpent AS (
                SELECT 
                    b.BudgetID,
                    b.BudgetAmount,
                    b.WarningThreshold,
                    ISNULL(SUM(t.Amount), 0) as SpentAmount
                FROM Budgets b
                LEFT JOIN Transactions t ON b.CategoryID = t.CategoryID 
                    AND b.UserID = t.UserID
                    AND t.Type = 'Expense'
                    AND t.TransactionDate >= b.StartDate 
                    AND t.TransactionDate <= b.EndDate
                WHERE b.UserID = @userId AND b.IsActive = 1
                GROUP BY b.BudgetID, b.BudgetAmount, b.WarningThreshold
            )
            SELECT
                COUNT(*) as totalBudgets,
                ISNULL(SUM(BudgetAmount), 0) as totalBudgetAmount,
                ISNULL(SUM(SpentAmount), 0) as totalSpentAmount,
                ISNULL(AVG(
                    CASE WHEN BudgetAmount > 0 THEN 
                        CAST(SpentAmount as FLOAT) / CAST(BudgetAmount as FLOAT) * 100 
                    ELSE 0 END
                ), 0) as averageUsagePercentage,
                COUNT(CASE WHEN 
                    SpentAmount >= BudgetAmount * WarningThreshold / 100.0 
                THEN 1 END) as budgetsNearLimit
            FROM BudgetSpent
        `);
    
    const summary = result.recordset[0] || {
        totalBudgets: 0,
        totalBudgetAmount: 0,
        totalSpentAmount: 0,
        averageUsagePercentage: 0,
        budgetsNearLimit: 0
    };
    
    res.json({
        success: true,
        data: summary
    });
}));

module.exports = router;
