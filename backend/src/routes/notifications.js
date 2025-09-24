const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getPool, SCHEMA_INFO } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Get all notifications for user
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const { type, isRead, limit = 50 } = req.query;
    const pool = getPool();
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .input('type', type || null)
        .input('isRead', isRead !== undefined ? (isRead === 'true' ? 1 : 0) : null)
        .input('limit', parseInt(limit))
        .execute('sp_GetUserNotifications');
    
    const notifications = result.recordset.map(notification => ({
        id: notification.NotificationID,
        type: notification.Type,
        title: notification.Title,
        message: notification.Message,
        priority: notification.Priority,
        isRead: notification.IsRead,
        actionable: notification.IsActionable,
        data: notification.ActionData ? JSON.parse(notification.ActionData) : null,
        timestamp: notification.CreatedAt,
        readAt: notification.ReadAt
    }));
    
    res.json({
        success: true,
        data: notifications
    });
}));

// Get unread notification count (simple endpoint)
router.get('/unread-count', authenticateToken, asyncHandler(async (req, res) => {
    const pool = getPool();

    const result = await pool.request()
        .input('userId', req.user.id)
        .query(`
            SELECT COUNT(*) as unreadCount
            FROM Notifications
            WHERE UserID = @userId AND IsRead = 0
        `);

    res.json({
        success: true,
        data: {
            unreadCount: result.recordset[0]?.unreadCount || 0
        }
    });
}));

// Get notification counts
router.get('/counts', authenticateToken, asyncHandler(async (req, res) => {
    const pool = getPool();

    const result = await pool.request()
        .input('userId', req.user.id)
        .query(`
            SELECT
                COUNT(*) as total,
                COUNT(CASE WHEN IsRead = 0 THEN 1 END) as unread,
                COUNT(CASE WHEN Type = 'warning' AND IsRead = 0 THEN 1 END) as warnings,
                COUNT(CASE WHEN Type = 'suggestion' AND IsRead = 0 THEN 1 END) as suggestions,
                COUNT(CASE WHEN Type = 'achievement' AND IsRead = 0 THEN 1 END) as achievements,
                COUNT(CASE WHEN Type = 'reminder' AND IsRead = 0 THEN 1 END) as reminders,
                COUNT(CASE WHEN Type = 'analysis' AND IsRead = 0 THEN 1 END) as analysis
            FROM Notifications
            WHERE UserID = @userId
        `);
    
    res.json({
        success: true,
        data: result.recordset[0]
    });
}));

// Create notification
router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { type, title, message, priority = 'medium', actionable = false, data = null } = req.body;
    
    // Validation
    if (!type || !title || !message) {
        return res.status(400).json({
            success: false,
            message: 'Type, title và message là bắt buộc'
        });
    }
    
    if (!['warning', 'suggestion', 'achievement', 'reminder', 'analysis'].includes(type)) {
        return res.status(400).json({
            success: false,
            message: 'Type không hợp lệ'
        });
    }
    
    if (!['high', 'medium', 'low'].includes(priority)) {
        return res.status(400).json({
            success: false,
            message: 'Priority không hợp lệ'
        });
    }
    
    const pool = getPool();
    const notificationId = uuidv4();
    
    await pool.request()
        .input('notificationId', notificationId)
        .input('userId', req.user.id)
        .input('type', type)
        .input('title', title)
        .input('message', message)
        .input('priority', priority)
        .input('isActionable', actionable ? 1 : 0)
        .input('actionData', data ? JSON.stringify(data) : null)
        .query(`
            INSERT INTO Notifications (
                NotificationID, UserID, Type, Title, Message, 
                Priority, IsActionable, ActionData
            ) VALUES (
                @notificationId, @userId, @type, @title, @message,
                @priority, @isActionable, @actionData
            )
        `);
    
    // Get the created notification
    const result = await pool.request()
        .input('notificationId', notificationId)
        .query(`
            SELECT 
                NotificationID as id,
                Type as type,
                Title as title,
                Message as message,
                Priority as priority,
                IsRead as isRead,
                IsActionable as actionable,
                ActionData as data,
                CreatedAt as timestamp
            FROM Notifications
            WHERE NotificationID = @notificationId
        `);
    
    const notification = result.recordset[0];
    if (notification.data) {
        notification.data = JSON.parse(notification.data);
    }
    
    res.status(201).json({
        success: true,
        message: 'Thông báo đã được tạo thành công',
        data: notification
    });
}));

// Mark notification as read
router.patch('/:id/read', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pool = getPool();
    
    // Check if notification exists and belongs to user
    const existingNotification = await pool.request()
        .input('notificationId', id)
        .input('userId', req.user.id)
        .query(`
            SELECT NotificationID FROM Notifications 
            WHERE NotificationID = @notificationId AND UserID = @userId
        `);
    
    if (existingNotification.recordset.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Thông báo không tồn tại'
        });
    }
    
    await pool.request()
        .input('notificationId', id)
        .query(`
            UPDATE Notifications SET 
                IsRead = 1,
                ReadAt = GETUTCDATE()
            WHERE NotificationID = @notificationId
        `);
    
    res.json({
        success: true,
        message: 'Thông báo đã được đánh dấu là đã đọc'
    });
}));

// Mark all notifications as read
router.patch('/read-all', authenticateToken, asyncHandler(async (req, res) => {
    const pool = getPool();
    
    const result = await pool.request()
        .input('userId', req.user.id)
        .query(`
            UPDATE Notifications SET 
                IsRead = 1,
                ReadAt = GETUTCDATE()
            WHERE UserID = @userId AND IsRead = 0;
            
            SELECT @@ROWCOUNT as updatedCount;
        `);
    
    res.json({
        success: true,
        message: `${result.recordset[0].updatedCount} thông báo đã được đánh dấu là đã đọc`
    });
}));

// Delete notification
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const pool = getPool();
    
    // Check if notification exists and belongs to user
    const existingNotification = await pool.request()
        .input('notificationId', id)
        .input('userId', req.user.id)
        .query(`
            SELECT NotificationID FROM Notifications 
            WHERE NotificationID = @notificationId AND UserID = @userId
        `);
    
    if (existingNotification.recordset.length === 0) {
        return res.status(404).json({
            success: false,
            message: 'Thông báo không tồn tại'
        });
    }
    
    await pool.request()
        .input('notificationId', id)
        .query(`DELETE FROM Notifications WHERE NotificationID = @notificationId`);
    
    res.json({
        success: true,
        message: 'Thông báo đã được xóa thành công'
    });
}));

// Generate smart notifications based on user data
router.post('/generate', authenticateToken, asyncHandler(async (req, res) => {
    const pool = getPool();
    const userId = req.user.id;
    const notifications = [];
    
    try {
        // 1. Check budget warnings
        const budgetWarnings = await pool.request()
            .input('userId', userId)
            .query(`
                SELECT 
                    b.BudgetName,
                    b.BudgetAmount,
                    b.SpentAmount,
                    b.WarningThreshold,
                    CAST(b.SpentAmount as FLOAT) / CAST(b.BudgetAmount as FLOAT) * 100 as percentage
                FROM Budgets b
                WHERE b.UserID = @userId 
                    AND b.IsActive = 1
                    AND GETDATE() BETWEEN b.StartDate AND b.EndDate
                    AND CAST(b.SpentAmount as FLOAT) / CAST(b.BudgetAmount as FLOAT) * 100 >= b.WarningThreshold
            `);
        
        for (const budget of budgetWarnings.recordset) {
            const notificationId = uuidv4();
            const percentage = Math.round(budget.percentage);
            const priority = percentage >= 100 ? 'high' : 'medium';
            const title = percentage >= 100 ? 'Vượt ngân sách!' : 'Cảnh báo ngân sách';
            const message = percentage >= 100 
                ? `Bạn đã vượt ${percentage}% ngân sách "${budget.BudgetName}". Hãy cân nhắc việc điều chỉnh chi tiêu.`
                : `Bạn đã sử dụng ${percentage}% ngân sách "${budget.BudgetName}". Hãy chú ý chi tiêu trong thời gian còn lại.`;
            
            await pool.request()
                .input('notificationId', notificationId)
                .input('userId', userId)
                .input('type', 'warning')
                .input('title', title)
                .input('message', message)
                .input('priority', priority)
                .input('isActionable', 1)
                .input('actionData', JSON.stringify({
                    budgetName: budget.BudgetName,
                    percentage: percentage,
                    spentAmount: budget.SpentAmount,
                    totalAmount: budget.BudgetAmount
                }))
                .query(`
                    INSERT INTO Notifications (
                        NotificationID, UserID, Type, Title, Message, 
                        Priority, IsActionable, ActionData
                    ) VALUES (
                        @notificationId, @userId, @type, @title, @message,
                        @priority, @isActionable, @actionData
                    )
                `);
            
            notifications.push({ type: 'warning', title, message });
        }
        
        // 2. Check for spending trends
        const spendingTrends = await pool.request()
            .input('userId', userId)
            .query(`
                WITH CurrentMonth AS (
                    SELECT 
                        c.CategoryName as CategoryName,
                        SUM(t.Amount) as CurrentAmount
                    FROM Transactions t
                    INNER JOIN Categories c ON t.CategoryID = c.CategoryID
                    WHERE t.UserID = @userId 
                        AND t.Type = 'Expense'
                        AND MONTH(t.TransactionDate) = MONTH(GETDATE())
                        AND YEAR(t.TransactionDate) = YEAR(GETDATE())
                    GROUP BY c.CategoryID, c.CategoryName
                ),
                PreviousMonth AS (
                    SELECT 
                        c.CategoryName as CategoryName,
                        SUM(t.Amount) as PreviousAmount
                    FROM Transactions t
                    INNER JOIN Categories c ON t.CategoryID = c.CategoryID
                    WHERE t.UserID = @userId 
                        AND t.Type = 'Expense'
                        AND MONTH(t.TransactionDate) = MONTH(DATEADD(MONTH, -1, GETDATE()))
                        AND YEAR(t.TransactionDate) = YEAR(DATEADD(MONTH, -1, GETDATE()))
                    GROUP BY c.CategoryID, c.CategoryName
                )
                SELECT 
                    cm.CategoryName,
                    cm.CurrentAmount,
                    ISNULL(pm.PreviousAmount, 0) as PreviousAmount,
                    CASE 
                        WHEN ISNULL(pm.PreviousAmount, 0) = 0 THEN 100
                        ELSE (cm.CurrentAmount - ISNULL(pm.PreviousAmount, 0)) / ISNULL(pm.PreviousAmount, 1) * 100
                    END as PercentageChange
                FROM CurrentMonth cm
                LEFT JOIN PreviousMonth pm ON cm.CategoryName = pm.CategoryName
                WHERE cm.CurrentAmount > 0
                    AND (
                        (ISNULL(pm.PreviousAmount, 0) = 0 AND cm.CurrentAmount > 0) OR
                        (ISNULL(pm.PreviousAmount, 0) > 0 AND ABS((cm.CurrentAmount - ISNULL(pm.PreviousAmount, 0)) / ISNULL(pm.PreviousAmount, 1) * 100) >= 20)
                    )
            `);
        
        for (const trend of spendingTrends.recordset) {
            const notificationId = uuidv4();
            const change = Math.round(trend.PercentageChange);
            const isIncrease = change > 0;
            const title = isIncrease ? 'Tăng chi tiêu đáng kể' : 'Giảm chi tiêu tích cực';
            const message = isIncrease 
                ? `Chi tiêu "${trend.CategoryName}" tăng ${Math.abs(change)}% so với tháng trước. Hãy xem xét điều chỉnh.`
                : `Tuyệt vời! Chi tiêu "${trend.CategoryName}" giảm ${Math.abs(change)}% so với tháng trước.`;
            
            await pool.request()
                .input('notificationId', notificationId)
                .input('userId', userId)
                .input('type', isIncrease ? 'suggestion' : 'achievement')
                .input('title', title)
                .input('message', message)
                .input('priority', isIncrease ? 'medium' : 'low')
                .input('isActionable', isIncrease ? 1 : 0)
                .input('actionData', JSON.stringify({
                    category: trend.CategoryName,
                    currentAmount: trend.CurrentAmount,
                    previousAmount: trend.PreviousAmount,
                    percentageChange: change
                }))
                .query(`
                    INSERT INTO Notifications (
                        NotificationID, UserID, Type, Title, Message, 
                        Priority, IsActionable, ActionData
                    ) VALUES (
                        @notificationId, @userId, @type, @title, @message,
                        @priority, @isActionable, @actionData
                    )
                `);
            
            notifications.push({ type: isIncrease ? 'suggestion' : 'achievement', title, message });
        }
        
        res.json({
            success: true,
            message: `Đã tạo ${notifications.length} thông báo thông minh`,
            data: notifications
        });
        
    } catch (error) {
        console.error('Error generating notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo thông báo thông minh'
        });
    }
}));

module.exports = router;
