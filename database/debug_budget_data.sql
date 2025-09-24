-- Debug dữ liệu budget và transaction để tìm vấn đề
USE PersonalFinanceDB;
GO

PRINT '🔍 DEBUG DỮ LIỆU BUDGET VÀ TRANSACTION';
PRINT '======================================';

-- 1. Kiểm tra budgets hiện có
PRINT '1. BUDGETS HIỆN CÓ:';
SELECT 
    b.BudgetID,
    b.BudgetName,
    b.UserID,
    b.CategoryID,
    c.CategoryName,
    b.BudgetAmount,
    b.SpentAmount,
    b.Period,
    b.IsActive
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.IsActive = 1
ORDER BY b.CreatedAt DESC;

PRINT '';

-- 2. Kiểm tra transactions hiện có
PRINT '2. TRANSACTIONS CHI TIÊU HIỆN CÓ:';
SELECT 
    t.TransactionID,
    t.UserID,
    t.CategoryID,
    c.CategoryName,
    t.Amount,
    t.TransactionDate,
    t.Description,
    t.Type
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
WHERE t.Type = 'Expense'
ORDER BY t.TransactionDate DESC;

PRINT '';

-- 3. Kiểm tra liên kết giữa Budget và Transaction
PRINT '3. PHÂN TÍCH LIÊN KẾT BUDGET-TRANSACTION:';
SELECT 
    b.BudgetName,
    b.UserID as BudgetUserID,
    b.CategoryID as BudgetCategoryID,
    c1.CategoryName as BudgetCategory,
    b.Period,
    b.SpentAmount as CurrentSpentAmount,
    COUNT(t.TransactionID) as RelatedTransactions,
    SUM(t.Amount) as TotalExpenseAmount
FROM Budgets b
LEFT JOIN Categories c1 ON b.CategoryID = c1.CategoryID
LEFT JOIN Transactions t ON (
    t.UserID = b.UserID 
    AND t.CategoryID = b.CategoryID 
    AND t.Type = 'Expense'
    AND t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
    AND t.TransactionDate <= EOMONTH(GETDATE())
)
WHERE b.IsActive = 1
GROUP BY b.BudgetID, b.BudgetName, b.UserID, b.CategoryID, c1.CategoryName, b.Period, b.SpentAmount
ORDER BY b.BudgetName;

PRINT '';

-- 4. Kiểm tra stored procedure
PRINT '4. STORED PROCEDURE STATUS:';
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
    PRINT '✅ sp_UpdateBudgetSpentAmount tồn tại'
ELSE
    PRINT '❌ sp_UpdateBudgetSpentAmount KHÔNG tồn tại';

-- 5. Test manual calculation
PRINT '';
PRINT '5. TÍNH TOÁN MANUAL CHO TỪNG BUDGET:';

DECLARE @budgetId UNIQUEIDENTIFIER;
DECLARE @budgetName NVARCHAR(255);
DECLARE @userId UNIQUEIDENTIFIER;
DECLARE @categoryId UNIQUEIDENTIFIER;
DECLARE @currentSpent DECIMAL(18,2);

DECLARE test_cursor CURSOR FOR
SELECT BudgetID, BudgetName, UserID, CategoryID, SpentAmount
FROM Budgets 
WHERE IsActive = 1 AND CategoryID IS NOT NULL;

OPEN test_cursor;
FETCH NEXT FROM test_cursor INTO @budgetId, @budgetName, @userId, @categoryId, @currentSpent;

WHILE @@FETCH_STATUS = 0
BEGIN
    DECLARE @calculatedSpent DECIMAL(18,2);
    
    SELECT @calculatedSpent = ISNULL(SUM(Amount), 0)
    FROM Transactions
    WHERE UserID = @userId
      AND CategoryID = @categoryId
      AND Type = 'Expense'
      AND TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
      AND TransactionDate <= EOMONTH(GETDATE());
    
    PRINT 'Budget: ' + @budgetName + 
          ' | Current: ' + CAST(@currentSpent AS NVARCHAR(20)) + 
          ' | Should be: ' + CAST(@calculatedSpent AS NVARCHAR(20)) +
          ' | Match: ' + CASE WHEN @currentSpent = @calculatedSpent THEN 'YES' ELSE 'NO' END;
    
    FETCH NEXT FROM test_cursor INTO @budgetId, @budgetName, @userId, @categoryId, @currentSpent;
END

CLOSE test_cursor;
DEALLOCATE test_cursor;

PRINT '';
PRINT '📋 PHÂN TÍCH:';
PRINT '   - Nếu không có budgets → Cần tạo budget trước';
PRINT '   - Nếu không có transactions → Cần tạo giao dịch chi tiêu';
PRINT '   - Nếu UserID/CategoryID không khớp → Vấn đề liên kết dữ liệu';
PRINT '   - Nếu dates không trong tháng này → Transactions ngoài phạm vi tính toán';
