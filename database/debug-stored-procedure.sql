-- ==========================================
-- Debug Stored Procedure sp_UpdateBudgetSpentAmount
-- ==========================================

USE PersonalFinanceDB;
GO

-- 1. Kiểm tra budget hiện tại
SELECT 
    b.BudgetID,
    b.BudgetName,
    b.CategoryID,
    c.CategoryName,
    b.StartDate,
    b.EndDate,
    b.SpentAmount as 'SpentAmount hiện tại',
    b.BudgetAmount
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.UserID = '72871371-800B-44BD-AA71-C00F97A9343F'
  AND b.IsActive = 1;

-- 2. Kiểm tra transactions trong khoảng thời gian
SELECT 
    t.TransactionID,
    t.TransactionDate,
    t.Amount,
    t.Type,
    c.CategoryName,
    b.BudgetName,
    b.StartDate as 'Budget StartDate',
    b.EndDate as 'Budget EndDate',
    CASE 
        WHEN t.TransactionDate >= b.StartDate AND t.TransactionDate <= b.EndDate THEN 'Trong khoảng'
        ELSE 'Ngoài khoảng'
    END as 'Status'
FROM Transactions t
LEFT JOIN Categories c ON t.CategoryID = c.CategoryID
LEFT JOIN Budgets b ON b.CategoryID = t.CategoryID 
    AND b.UserID = t.UserID 
    AND b.IsActive = 1
WHERE t.UserID = '72871371-800B-44BD-AA71-C00F97A9343F'
  AND t.Type = 'Expense'
ORDER BY t.TransactionDate DESC;

-- 3. Test query của stored procedure manually
DECLARE @testUserId UNIQUEIDENTIFIER = '72871371-800B-44BD-AA71-C00F97A9343F';
DECLARE @testCategoryId UNIQUEIDENTIFIER = '1D843B5A-D154-46FD-9CBE-48BAF5BC4A87';

SELECT 
    b.BudgetID,
    b.BudgetName,
    b.StartDate,
    b.EndDate,
    COALESCE(SUM(t.Amount), 0) as 'Tổng chi tiêu tính được'
FROM Budgets b
LEFT JOIN Transactions t ON t.CategoryID = b.CategoryID 
    AND t.UserID = b.UserID
    AND t.Type = 'Expense'
    AND t.TransactionDate >= b.StartDate 
    AND t.TransactionDate <= b.EndDate
WHERE b.UserID = @testUserId
  AND b.CategoryID = @testCategoryId
  AND b.IsActive = 1
GROUP BY b.BudgetID, b.BudgetName, b.StartDate, b.EndDate;

-- 4. Xem code của stored procedure
EXEC sp_helptext 'sp_UpdateBudgetSpentAmount';

GO
