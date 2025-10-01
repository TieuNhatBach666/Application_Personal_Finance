const express = require('express');
const sql = require('mssql');
const { authenticateToken } = require('../middleware/auth');
const { getPool } = require('../config/database');

// Hàm hỗ trợ để cập nhật số tiền đã chi của ngân sách
const updateBudgetSpentAmount = async (userId, categoryId) => {
  try {
    console.log('🔄 Starting budget update for userId:', userId, 'categoryId:', categoryId);
    const pool = getPool();
    
    // Kiểm tra xem có budget nào cho category này không
    const budgetCheck = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .input('categoryId', sql.UniqueIdentifier, categoryId)
      .query(`
        SELECT BudgetID, BudgetName, CategoryID 
        FROM Budgets 
        WHERE UserID = @userId AND CategoryID = @categoryId AND IsActive = 1
      `);
    
    console.log('🔍 Found budgets for this category:', budgetCheck.recordset.length);
    if (budgetCheck.recordset.length === 0) {
      console.log('⚠️ No active budget found for categoryId:', categoryId);
      return;
    }
    
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

// GET /api/transactions - Lấy danh sách giao dịch của user với bộ lọc
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('📋 GET /api/transactions - User ID:', req.user.id);
    console.log('📋 Query params:', req.query);
    
    const pool = getPool();
    
    // Lấy parameters từ query string
    const { page = 1, limit = 10, search, type, categoryId, startDate, endDate } = req.query;
    
    console.log('📋 Filters applied:', { search, type, categoryId, startDate, endDate });
    
    // Tính offset cho pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Xây dựng WHERE clause và parameters động
    let whereConditions = ['t.UserID = @userId'];
    let queryParams = { userId: req.user.id };
    
    // Thêm filter theo search (tìm trong description)
    if (search && search.trim()) {
      whereConditions.push('t.Description LIKE @search');
      queryParams.search = `%${search.trim()}%`;
    }
    
    // Thêm filter theo type
    if (type && ['Income', 'Expense'].includes(type)) {
      whereConditions.push('t.Type = @type');
      queryParams.type = type;
    }
    
    // Thêm filter theo categoryId
    if (categoryId) {
      whereConditions.push('t.CategoryID = @categoryId');
      queryParams.categoryId = categoryId;
    }
    
    // Thêm filter theo date range
    if (startDate) {
      whereConditions.push('t.TransactionDate >= @startDate');
      queryParams.startDate = startDate;
    }
    
    if (endDate) {
      whereConditions.push('t.TransactionDate <= @endDate');
      queryParams.endDate = endDate;
    }
    
    const whereClause = whereConditions.join(' AND ');
    
    // Query để đếm tổng số records (cho pagination)
    const countRequest = pool.request();
    Object.keys(queryParams).forEach(key => {
      if (key === 'userId' || key === 'categoryId') {
        countRequest.input(key, sql.UniqueIdentifier, queryParams[key]);
      } else if (key === 'startDate' || key === 'endDate') {
        countRequest.input(key, sql.Date, queryParams[key]);
      } else {
        countRequest.input(key, sql.NVarChar, queryParams[key]);
      }
    });
    
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Transactions t
      INNER JOIN Categories c ON t.CategoryID = c.CategoryID
      WHERE ${whereClause}
    `;
    
    const countResult = await countRequest.query(countQuery);
    const total = countResult.recordset[0].total;
    
    // Query chính với pagination
    const mainRequest = pool.request();
    Object.keys(queryParams).forEach(key => {
      if (key === 'userId' || key === 'categoryId') {
        mainRequest.input(key, sql.UniqueIdentifier, queryParams[key]);
      } else if (key === 'startDate' || key === 'endDate') {
        mainRequest.input(key, sql.Date, queryParams[key]);
      } else {
        mainRequest.input(key, sql.NVarChar, queryParams[key]);
      }
    });
    
    const mainQuery = `
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
      WHERE ${whereClause}
      ORDER BY t.TransactionDate DESC, t.CreatedAt DESC
      OFFSET ${offset} ROWS
      FETCH NEXT ${parseInt(limit)} ROWS ONLY
    `;
    
    const result = await mainRequest.query(mainQuery);

    console.log('📊 Found', result.recordset.length, 'transactions (total:', total, ')');

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
          page: parseInt(page),
          limit: parseInt(limit),
          total: total
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

    console.log('✅ Transaction created successfully:', transactionId);

    // Tạo transaction object để trả về
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

    // Cập nhật budget spent amount nếu là expense
    if (type === 'Expense') {
      console.log('🔄 Updating budget for categoryId:', categoryId);
      await updateBudgetSpentAmount(req.user.id, categoryId);
      await checkBudgetLimitAndNotify(req.user.id, categoryId);
    }

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
    
    const { startDate, endDate } = req.query;
    
    // Build WHERE clause with date filters
    let whereConditions = ['UserID = @userId'];
    
    if (startDate) {
      whereConditions.push('TransactionDate >= @startDate');
    }
    
    if (endDate) {
      whereConditions.push('TransactionDate <= @endDate');
    }
    
    const whereClause = whereConditions.join(' AND ');

    const summaryQuery = `
      SELECT 
        SUM(CASE WHEN Type = 'Income' THEN Amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN Type = 'Expense' THEN Amount ELSE 0 END) as totalExpense,
        COUNT(*) as transactionCount
      FROM Transactions
      WHERE ${whereClause}
    `;

    const request = pool.request()
      .input('userId', sql.UniqueIdentifier, req.user.id);
      
    if (startDate) {
      request.input('startDate', sql.Date, startDate);
    }
    
    if (endDate) {
      request.input('endDate', sql.Date, endDate);
    }

    const result = await request.query(summaryQuery);

    const summary = result.recordset[0];
    console.log('📈 Summary calculated:', summary);

    // Handle NULL values from SQL SUM()
    const totalIncome = summary.totalIncome !== null ? parseFloat(summary.totalIncome) : 0;
    const totalExpense = summary.totalExpense !== null ? parseFloat(summary.totalExpense) : 0;

    res.json({
      success: true,
      message: 'Summary retrieved successfully',
      data: {
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        netSavings: totalIncome - totalExpense,
        transactionCount: summary.transactionCount || 0
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

// GET /api/transactions/:id - Lấy giao dịch theo ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('📋 GET /api/transactions/:id - Transaction ID:', req.params.id);
    console.log('👤 User ID:', req.user.id);
    
    const pool = getPool();
    const result = await pool.request()
      .input('transactionId', sql.UniqueIdentifier, req.params.id)
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .query(`
        SELECT 
          t.TransactionID as id,
          t.Amount as amount,
          t.Description as description,
          t.TransactionDate as transactionDate,
          t.Type as type,
          t.CategoryID as categoryId,
          c.CategoryName as categoryName,
          c.Icon as categoryIcon,
          c.Color as categoryColor,
          t.CreatedAt as createdAt,
          t.UpdatedAt as updatedAt
        FROM Transactions t
        LEFT JOIN Categories c ON t.CategoryID = c.CategoryID
        WHERE t.TransactionID = @transactionId AND t.UserID = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Giao dịch không tồn tại'
      });
    }

    const transaction = result.recordset[0];
    console.log('✅ Transaction found:', transaction.id);

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('❌ Error fetching transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin giao dịch'
    });
  }
});

// PUT /api/transactions/:id - Cập nhật giao dịch
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    console.log('✏️ PUT /api/transactions/:id - Transaction ID:', req.params.id);
    console.log('📝 Request body:', req.body);
    console.log('👤 User ID:', req.user.id);

    const { amount, description, categoryId, transactionDate, type } = req.body;

    // Validation
    if (!amount || !categoryId || !transactionDate || !type) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: amount, categoryId, transactionDate, type'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Số tiền phải lớn hơn 0'
      });
    }

    if (!['Income', 'Expense'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Loại giao dịch không hợp lệ'
      });
    }

    const pool = getPool();

    // Kiểm tra giao dịch có tồn tại và thuộc về user không
    const existingTransaction = await pool.request()
      .input('transactionId', sql.UniqueIdentifier, req.params.id)
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .query(`
        SELECT TransactionID, CategoryID FROM Transactions 
        WHERE TransactionID = @transactionId AND UserID = @userId
      `);

    if (existingTransaction.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Giao dịch không tồn tại'
      });
    }

    const oldCategoryId = existingTransaction.recordset[0].CategoryID;

    // Cập nhật giao dịch
    await pool.request()
      .input('transactionId', sql.UniqueIdentifier, req.params.id)
      .input('amount', sql.Decimal(18, 2), amount)
      .input('description', sql.NVarChar(500), description || '')
      .input('categoryId', sql.UniqueIdentifier, categoryId)
      .input('transactionDate', sql.DateTime2, new Date(transactionDate))
      .input('type', sql.NVarChar(10), type)
      .query(`
        UPDATE Transactions SET
          Amount = @amount,
          Description = @description,
          CategoryID = @categoryId,
          TransactionDate = @transactionDate,
          Type = @type,
          UpdatedAt = GETUTCDATE()
        WHERE TransactionID = @transactionId
      `);

    // Cập nhật budget spent amount cho category cũ và mới (nếu khác nhau)
    if (type === 'Expense') {
      if (oldCategoryId) {
        await updateBudgetSpentAmount(req.user.id, oldCategoryId);
      }
      if (categoryId !== oldCategoryId) {
        await updateBudgetSpentAmount(req.user.id, categoryId);
        await checkBudgetLimitAndNotify(req.user.id, categoryId);
      }
    }

    // Lấy thông tin giao dịch đã cập nhật
    const updatedResult = await pool.request()
      .input('transactionId', sql.UniqueIdentifier, req.params.id)
      .input('userId', sql.UniqueIdentifier, req.user.id)
      .query(`
        SELECT 
          t.TransactionID as id,
          t.Amount as amount,
          t.Description as description,
          t.TransactionDate as transactionDate,
          t.Type as type,
          t.CategoryID as categoryId,
          c.CategoryName as categoryName,
          c.Icon as categoryIcon,
          c.Color as categoryColor,
          t.CreatedAt as createdAt,
          t.UpdatedAt as updatedAt
        FROM Transactions t
        LEFT JOIN Categories c ON t.CategoryID = c.CategoryID
        WHERE t.TransactionID = @transactionId AND t.UserID = @userId
      `);

    const updatedTransaction = updatedResult.recordset[0];
    console.log('✅ Transaction updated successfully:', updatedTransaction.id);

    res.json({
      success: true,
      message: 'Giao dịch đã được cập nhật thành công',
      data: updatedTransaction
    });
  } catch (error) {
    console.error('❌ Error updating transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật giao dịch'
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