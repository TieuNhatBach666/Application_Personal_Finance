const express = require('express');
const sql = require('mssql');
const { authenticateToken } = require('../middleware/auth');
const { getPool } = require('../config/database');

const router = express.Router();

// Test endpoint to check budget integration
router.get('/check-integration', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;
    
    console.log('🔍 Testing budget integration for user:', userId);
    
    // 1. Check if stored procedure exists
    const procCheck = await pool.request().query(`
      SELECT COUNT(*) as count FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount'
    `);
    
    const procedureExists = procCheck.recordset[0].count > 0;
    
    // 2. Get user's budgets
    const budgetsResult = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          b.BudgetID,
          b.BudgetName,
          b.CategoryID,
          c.CategoryName,
          b.BudgetAmount,
          b.SpentAmount,
          b.Period
        FROM Budgets b
        LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
        WHERE b.UserID = @userId AND b.IsActive = 1
      `);
    
    // 3. Get user's expense transactions
    const transactionsResult = await pool.request()
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT 
          t.TransactionID,
          t.CategoryID,
          c.CategoryName,
          t.Amount,
          t.TransactionDate,
          t.Description
        FROM Transactions t
        INNER JOIN Categories c ON t.CategoryID = c.CategoryID
        WHERE t.UserID = @userId AND t.Type = 'Expense'
        ORDER BY t.TransactionDate DESC
      `);
    
    // 4. Calculate expected spent amounts
    const budgets = budgetsResult.recordset;
    const transactions = transactionsResult.recordset;
    
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const analysisResults = budgets.map(budget => {
      // Filter transactions for this budget's category and time period
      const relevantTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.TransactionDate);
        const isInPeriod = transactionDate >= startOfMonth && transactionDate <= endOfMonth;
        
        if (budget.CategoryID) {
          // Category-specific budget
          return t.CategoryID === budget.CategoryID && isInPeriod;
        } else {
          // General budget - all expenses
          return isInPeriod;
        }
      });
      
      const expectedSpentAmount = relevantTransactions.reduce((sum, t) => sum + parseFloat(t.Amount), 0);
      const actualSpentAmount = parseFloat(budget.SpentAmount) || 0;
      
      return {
        budgetId: budget.BudgetID,
        budgetName: budget.BudgetName,
        categoryName: budget.CategoryName || 'Tất cả danh mục',
        budgetAmount: parseFloat(budget.BudgetAmount),
        actualSpentAmount: actualSpentAmount,
        expectedSpentAmount: expectedSpentAmount,
        isCorrect: Math.abs(actualSpentAmount - expectedSpentAmount) < 0.01,
        relevantTransactions: relevantTransactions.length,
        period: budget.Period
      };
    });
    
    res.json({
      success: true,
      data: {
        procedureExists,
        totalBudgets: budgets.length,
        totalTransactions: transactions.length,
        analysisResults,
        recommendations: analysisResults.filter(r => !r.isCorrect).map(r => ({
          budget: r.budgetName,
          issue: `SpentAmount (${r.actualSpentAmount}) không khớp với thực tế (${r.expectedSpentAmount})`,
          solution: 'Chạy manual_update_budgets.sql để sửa'
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking budget integration:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra tích hợp ngân sách',
      error: error.message
    });
  }
});

// Test endpoint to manually update a specific budget
router.post('/update-budget/:budgetId', authenticateToken, async (req, res) => {
  try {
    const { budgetId } = req.params;
    const pool = getPool();
    const userId = req.user.id;
    
    // Get budget info
    const budgetResult = await pool.request()
      .input('budgetId', sql.UniqueIdentifier, budgetId)
      .input('userId', sql.UniqueIdentifier, userId)
      .query(`
        SELECT CategoryID FROM Budgets 
        WHERE BudgetID = @budgetId AND UserID = @userId AND IsActive = 1
      `);
    
    if (budgetResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy ngân sách'
      });
    }
    
    const categoryId = budgetResult.recordset[0].CategoryID;
    
    if (categoryId) {
      // Check if stored procedure exists
      const procCheck = await pool.request().query(`
        SELECT COUNT(*) as count FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount'
      `);
      
      if (procCheck.recordset[0].count > 0) {
        await pool.request()
          .input('userId', sql.UniqueIdentifier, userId)
          .input('categoryId', sql.UniqueIdentifier, categoryId)
          .execute('sp_UpdateBudgetSpentAmount');
        
        res.json({
          success: true,
          message: 'Đã cập nhật ngân sách thành công'
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Stored procedure chưa tồn tại. Cần chạy manual_update_budgets.sql'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Ngân sách tổng quát chưa hỗ trợ cập nhật qua API này'
      });
    }
    
  } catch (error) {
    console.error('❌ Error updating budget:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật ngân sách',
      error: error.message
    });
  }
});

module.exports = router;
