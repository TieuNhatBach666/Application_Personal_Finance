const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getPool, SCHEMA_INFO } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Get all budgets for user
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    // Disable cache để force refresh
    res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
    });
    
    const pool = getPool();
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .execute('sp_GetUserBudgets');
    
    res.json({
        success: true,
        data: result.recordset
    });
}));

// Get budget by ID
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
                b.SpentAmount as spentAmount,
                b.Period as period,
                b.StartDate as startDate,
                b.EndDate as endDate,
                b.WarningThreshold as warningThreshold,
                b.Color as color,
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

// Create new budget
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { name, categoryId, totalAmount, period, warningThreshold, color } = req.body;
    
    // Validation
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
    
    // Calculate date range based on period
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
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            break;
        case 'quarterly':
            const quarter = Math.floor(now.getMonth() / 3);
            startDate = new Date(now.getFullYear(), quarter * 3, 1);
            endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
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
        .input('color', color || '#3498db')
        .query(`
            INSERT INTO Budgets (
                BudgetID, UserID, CategoryID, BudgetName, BudgetAmount, 
                Period, StartDate, EndDate, WarningThreshold, Color
            ) VALUES (
                @budgetId, @userId, @categoryId, @name, @totalAmount,
                @period, @startDate, @endDate, @warningThreshold, @color
            )
        `);
    
    // Update spent amount for the new budget
    if (categoryId) {
        try {
            await pool.request()
                .input('userId', req.user.id)
                .input('categoryId', categoryId)
                .execute('sp_UpdateBudgetSpentAmount');
            console.log('✅ Budget spent amount updated for new budget');
        } catch (error) {
            console.log('⚠️ Failed to update budget spent amount:', error.message);
        }
    }
    
    // Get the created budget
    const result = await pool.request()
        .input('userId', req.user.id)
        .execute('sp_GetUserBudgets');
    
    const createdBudget = result.recordset.find(b => b.BudgetID === budgetId);
    
    res.status(201).json({
        success: true,
        message: 'Ngân sách đã được tạo thành công',
        data: createdBudget
    });
}));

// Update budget
router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, categoryId, totalAmount, period, warningThreshold, color } = req.body;
    
    const pool = getPool();
    
    // Check if budget exists and belongs to user
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
        .input('color', color || '#3498db')
        .query(`
            UPDATE Budgets SET
                BudgetName = @name,
                CategoryID = @categoryId,
                BudgetAmount = @totalAmount,
                Period = @period,
                WarningThreshold = @warningThreshold,
                Color = @color,
                UpdatedAt = GETUTCDATE()
            WHERE BudgetID = @budgetId
        `);
    
    // Get updated budget
    const result = await pool.request()
        .input('userId', req.user.id)
        .execute('sp_GetUserBudgets');
    
    const updatedBudget = result.recordset.find(b => b.BudgetID === id);
    
    res.json({
        success: true,
        message: 'Ngân sách đã được cập nhật thành công',
        data: updatedBudget
    });
}));

// Delete budget
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pool = getPool();
    
    // Check if budget exists and belongs to user
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
    
    // Soft delete
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

// Update spent amount (called when transactions are added/updated)
router.patch('/:id/spent', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { spentAmount } = req.body;
    
    const pool = getPool();
    
    // Manual update for this specific budget
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

// Get budget summary
router.get('/summary/current', authenticateToken, asyncHandler(async (req, res) => {
    // Disable cache để force refresh
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
                COUNT(*) as totalBudgets,
                SUM(BudgetAmount) as totalBudgetAmount,
                SUM(SpentAmount) as totalSpentAmount,
                AVG(CASE WHEN BudgetAmount > 0 THEN CAST(SpentAmount as FLOAT) / CAST(BudgetAmount as FLOAT) * 100 ELSE 0 END) as averageUsagePercentage,
                COUNT(CASE WHEN SpentAmount >= BudgetAmount * WarningThreshold / 100.0 THEN 1 END) as budgetsNearLimit
            FROM Budgets
            WHERE UserID = @userId
                AND IsActive = 1
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
