const express = require('express');
const sql = require('mssql');
const { authenticateToken } = require('../middleware/auth');
const { getPool } = require('../config/database');

// Hàm hỗ trợ để cập nhật số tiền đã chi của ngân sách
const updateBudgetSpentAmount = async (userId, categoryId) => {
  try {
    console.log('🔄 Starting budget update for userId:', userId, 'categoryId:', categoryId);
    const pool = getPool();
    
    // Kiểm tra xem stored procedure có tồn tại không
    const checkProc = await pool.request().query(`
      SELECT COUNT(*) as count FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount'
    `);
    
    if (checkProc.recordset[0].count === 0) {
      console.log('❌ Stored procedure sp_UpdateBudgetSpentAmount does not exist!');
      return;
    }
    
    console.log('✅ Stored procedure exists, executing...');
    await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('categoryId', sql.UniqueIdentifier, categoryId)
      .execute('sp_UpdateBudgetSpentAmount');
    
    console.log('✅ Budget spent amount updated successfully for category:', categoryId);
  } catch (error) {
    console.log('⚠️ Failed to update budget spent amount:', error.message);
    console.log('⚠️ Error details:', error);
  }
};

// Kiểm tra vượt ngân sách và tạo thông báo
const checkBudgetLimitAndNotify = async (userId, categoryId) => {
  try {
    console.log('🔔 Checking budget limit for notification...');
    const pool = getPool();
    
    // Lấy thông tin budget cho category này
    const budgetResult = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('categoryId', sql.UniqueIdentifier, categoryId)
      .query(`
        SELECT 
          b.BudgetID,
          b.BudgetName,
          b.BudgetAmount,
          b.SpentAmount,
          b.WarningThreshold,
          c.CategoryName
        FROM Budgets b
        INNER JOIN Categories c ON b.CategoryID = c.CategoryID
        WHERE b.UserID = @userId AND b.CategoryID = @categoryId AND b.IsActive = 1
      `);
    
    if (budgetResult.recordset.length === 0) {
      console.log('📝 No active budget found for this category');
      return;
    }
    
    const budget = budgetResult.recordset[0];
    const percentage = (budget.SpentAmount / budget.BudgetAmount) * 100;
    const warningThreshold = budget.WarningThreshold || 80;
    
    console.log('📊 Budget check:', {
      budgetName: budget.BudgetName,
      spentAmount: budget.SpentAmount,
      budgetAmount: budget.BudgetAmount,
      percentage: percentage.toFixed(1),
      warningThreshold
    });
    
    let notificationTitle = '';
    let notificationMessage = '';
    let notificationType = 'info';
    
    if (percentage >= 150) {
      // Vượt ngân sách nghiêm trọng
      notificationTitle = '🔥 NGUY HIỂM: Vượt Ngân Sách Nghiêm Trọng!';
      notificationMessage = `Ngân sách "${budget.BudgetName}" đã vượt ${percentage.toFixed(1)}%! Bạn đã chi vượt ${(budget.SpentAmount - budget.BudgetAmount).toLocaleString('vi-VN')} ₫. Cần hành động ngay lập tức!`;
      notificationType = 'error';
    } else if (percentage >= 100) {
      // Vượt ngân sách
      notificationTitle = '🚨 Vượt Ngân Sách!';
      notificationMessage = `Ngân sách "${budget.BudgetName}" đã vượt ${percentage.toFixed(1)}%. Đã chi: ${budget.SpentAmount.toLocaleString('vi-VN')} ₫ / ${budget.BudgetAmount.toLocaleString('vi-VN')} ₫. Hãy kiểm soát chi tiêu!`;
      notificationType = 'error';
    } else if (percentage >= warningThreshold) {
      // Gần vượt ngân sách
      notificationTitle = '⚠️ Cảnh Báo Ngân Sách';
      notificationMessage = `Ngân sách "${budget.BudgetName}" đã sử dụng ${percentage.toFixed(1)}%. Còn lại: ${(budget.BudgetAmount - budget.SpentAmount).toLocaleString('vi-VN')} ₫. Hãy cân nhắc chi tiêu!`;
      notificationType = 'warning';
    }
    
    // Tạo thông báo nếu cần
    if (notificationTitle) {
      await pool.request()
        .input('userId', sql.UniqueIdentifier, userId)
        .input('title', sql.NVarChar, notificationTitle)
        .input('message', sql.NVarChar, notificationMessage)
        .input('type', sql.NVarChar, notificationType)
        .input('createdAt', sql.DateTime, new Date())
        .query(`
          INSERT INTO Notifications (NotificationID, UserID, Title, Message, Type, IsRead, CreatedAt)
          VALUES (NEWID(), @userId, @title, @message, @type, 0, @createdAt)
        `);
      
      console.log('✅ Budget notification created:', notificationTitle);
    } else {
      console.log('✅ Budget is within safe limits');
    }
    
  } catch (error) {
    console.log('⚠️ Failed to check budget limit:', error.message);
  }
};  

const router = express.Router();

// GET /api/transactions - Lấy danh sách giao dịch của user
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📋 GET /api/transactions - User ID:', req.user.id);
    const pool = getPool();
    
    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .query(`
        SELECT 
          t.TransactionID,
          t.UserID,
          t.CategoryID,
          t.Amount,
          t.Type,
          t.Description,
          t.TransactionDate,
          t.Tags,
          t.CreatedAt,
          t.UpdatedAt,
          c.CategoryName as CategoryName,
          c.Icon as CategoryIcon,
          c.Color as CategoryColor
        FROM Transactions t
        INNER JOIN Categories c ON t.CategoryID = c.CategoryID
        WHERE t.UserID = @userId
        ORDER BY t.TransactionDate DESC, t.CreatedAt DESC
      `);

    console.log('📊 Found', result.recordset.length, 'transactions');

    const transactions = result.recordset.map(row => ({
      id: row.TransactionID,
      userId: row.UserID,
      categoryId: row.CategoryID,
      amount: parseFloat(row.Amount),
      type: row.Type,
      description: row.Description,
      transactionDate: row.TransactionDate.toISOString().split('T')[0],
      tags: row.Tags,
      createdAt: row.CreatedAt.toISOString(),
      updatedAt: row.UpdatedAt.toISOString(),
      category: {
        id: row.CategoryID,
        name: row.CategoryName,
        icon: row.CategoryIcon,
        color: row.CategoryColor,
        type: row.Type
      }
    }));

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: {
        transactions,
        pagination: {
          page: 1,
          limit: 50,
          total: transactions.length
        },
        summary: {
          totalIncome: 0,
          totalExpense: 0,
          netSavings: 0,
          transactionCount: transactions.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// POST /api/transactions - Tạo giao dịch mới
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('📝 POST /api/transactions - Request body:', req.body);
    console.log('👤 User ID:', req.user.id);
    
    const { categoryId, amount, type, description, transactionDate, tags } = req.body;
    
    if (!categoryId || !amount || !type || !transactionDate) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        received: { categoryId, amount, type, transactionDate }
      });
    }

    const pool = getPool();

    // Xác minh category thuộc về user và có đúng loại
    console.log('🔍 Checking category:', categoryId, 'for user:', req.user.id, 'type:', type);
    
    const categoryCheck = await pool.request()
      .input('categoryId', sql.UniqueIdentifier, categoryId)
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .input('type', sql.NVarChar(10), type)
      .query(`
        SELECT CategoryID, CategoryName, Type, Icon, Color 
        FROM Categories 
        WHERE CategoryID = @categoryId AND UserID = @userId AND Type = @type AND IsActive = 1
      `);

    console.log('📂 Category check result:', categoryCheck.recordset.length, 'categories found');

    if (categoryCheck.recordset.length === 0) {
      console.log('❌ Invalid category or category type mismatch');
      return res.status(400).json({
        success: false,
        message: 'Invalid category or category type mismatch'
      });
    }

    const category = categoryCheck.recordset[0];
    console.log('✅ Category found:', category.CategoryName);

    // Tạo giao dịch
    const transactionId = require('crypto').randomUUID();
    const now = new Date();

    console.log('💾 Creating transaction with ID:', transactionId);

    await pool.request()
      .input('id', sql.UniqueIdentifier, transactionId)
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .input('categoryId', sql.UniqueIdentifier, categoryId)
      .input('amount', sql.Decimal(18, 2), amount)
      .input('type', sql.NVarChar(10), type)
      .input('description', sql.NVarChar(500), description || null)
      .input('transactionDate', sql.Date, transactionDate)
      .input('tags', sql.NVarChar(200), tags || null)
      .input('createdAt', sql.DateTime2, now)
      .input('updatedAt', sql.DateTime2, now)
      .query(`
        INSERT INTO Transactions (
          TransactionID, UserID, CategoryID, Amount, Type, Description, 
          TransactionDate, Tags, CreatedAt, UpdatedAt
        )
        VALUES (
          @id, @userId, @categoryId, @amount, @type, @description,
          @transactionDate, @tags, @createdAt, @updatedAt
        )
      `);

    console.log('✅ Transaction created successfully');

    // Cập nhật số tiền đã chi của ngân sách nếu đây là giao dịch chi tiêu
    if (type === 'Expense') {
      console.log('💰 Updating budget spent amount for category:', categoryId);
      await updateBudgetSpentAmount(req.user.id, categoryId);
      
      // Kiểm tra và tạo thông báo vượt ngân sách
      await checkBudgetLimitAndNotify(req.user.id, categoryId);
    }

    // Trả về giao dịch đã tạo cùng thông tin category
    const newTransaction = {
      id: transactionId,
      userId: req.user.id,
      categoryId: categoryId,
      amount: parseFloat(amount),
      type: type,
      description: description,
      transactionDate: transactionDate,
      tags: tags,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      category: {
        id: category.CategoryID,
        name: category.CategoryName,
        icon: category.Icon,
        color: category.Color,
        type: category.Type
      }
    };

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: newTransaction
    });

  } catch (error) {
    console.error('❌ Error creating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// GET /api/transactions/summary - Lấy tóm tắt giao dịch
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    console.log('📊 GET /api/transactions/summary - User ID:', req.user.id);
    const pool = getPool();

    const summaryQuery = `
      SELECT 
        SUM(CASE WHEN Type = 'Income' THEN Amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN Type = 'Expense' THEN Amount ELSE 0 END) as totalExpense,
        COUNT(*) as transactionCount
      FROM Transactions
      WHERE UserID = @userId
    `;

    const result = await pool.request()
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .query(summaryQuery);

    const summary = result.recordset[0];
    console.log('📈 Summary calculated:', summary);

    res.json({
      success: true,
      message: 'Summary retrieved successfully',
      data: {
        totalIncome: parseFloat(summary.totalIncome) || 0,
        totalExpense: parseFloat(summary.totalExpense) || 0,
        netSavings: (parseFloat(summary.totalIncome) || 0) - (parseFloat(summary.totalExpense) || 0),
        transactionCount: summary.transactionCount
      }
    });

  } catch (error) {
    console.error('❌ Error fetching transaction summary:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// DELETE /api/transactions/:id - Xóa giao dịch
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('🗑️ DELETE /api/transactions/:id - Transaction ID:', req.params.id);
    console.log('👤 User ID:', req.user.id);

    const { id } = req.params;
    const pool = getPool();

    // Kiểm tra xem giao dịch có tồn tại và thuộc về user không
    const existingTransaction = await pool.request()
      .input('transactionId', sql.UniqueIdentifier, id)
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .query(`
        SELECT TransactionID, CategoryID, Amount, Type
        FROM Transactions
        WHERE TransactionID = @transactionId AND UserID = @userId
      `);

    if (existingTransaction.recordset.length === 0) {
      console.log('❌ Transaction not found or does not belong to user');
      return res.status(404).json({
        success: false,
        message: 'Giao dịch không tồn tại hoặc bạn không có quyền xóa'
      });
    }

    const transaction = existingTransaction.recordset[0];
    console.log('📄 Transaction to delete:', transaction);

    // Xóa giao dịch
    await pool.request()
      .input('transactionId', sql.UniqueIdentifier, id)
      .query(`DELETE FROM Transactions WHERE TransactionID = @transactionId`);

    // Cập nhật số tiền đã chi của ngân sách nếu là chi tiêu
    if (transaction.Type === 'Expense') {
      await updateBudgetSpentAmount(req.user.id, transaction.CategoryID);
    }

    console.log('✅ Transaction deleted successfully');
    res.json({
      success: true,
      message: 'Giao dịch đã được xóa thành công'
    });

  } catch (error) {
    console.error('❌ Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa giao dịch',
      error: error.message
    });
  }
});

module.exports = router;