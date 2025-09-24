-- Tạo stored procedure hoạt động chắc chắn
USE PersonalFinanceDB;
GO

-- Xóa procedure cũ nếu có
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
    DROP PROCEDURE sp_UpdateBudgetSpentAmount;
GO

-- Tạo procedure mới đơn giản và chắc chắn
CREATE PROCEDURE sp_UpdateBudgetSpentAmount
    @userId UNIQUEIDENTIFIER,
    @categoryId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    PRINT 'sp_UpdateBudgetSpentAmount called with userId: ' + CAST(@userId AS NVARCHAR(36)) + ', categoryId: ' + CAST(@categoryId AS NVARCHAR(36));
    
    -- Cập nhật tất cả budgets của user này với category này
    DECLARE @updatedCount INT = 0;
    
    -- Daily budgets
    UPDATE b
    SET b.SpentAmount = (
        SELECT ISNULL(SUM(t.Amount), 0)
        FROM Transactions t
        WHERE t.UserID = @userId
          AND t.CategoryID = @categoryId
          AND t.Type = 'Expense'
          AND t.TransactionDate = CAST(GETDATE() AS DATE)
    ),
    b.UpdatedAt = GETUTCDATE()
    FROM Budgets b
    WHERE b.UserID = @userId
      AND b.CategoryID = @categoryId
      AND b.Period = 'daily'
      AND b.IsActive = 1;
    
    SET @updatedCount = @updatedCount + @@ROWCOUNT;
    
    -- Monthly budgets
    UPDATE b
    SET b.SpentAmount = (
        SELECT ISNULL(SUM(t.Amount), 0)
        FROM Transactions t
        WHERE t.UserID = @userId
          AND t.CategoryID = @categoryId
          AND t.Type = 'Expense'
          AND t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
          AND t.TransactionDate <= EOMONTH(GETDATE())
    ),
    b.UpdatedAt = GETUTCDATE()
    FROM Budgets b
    WHERE b.UserID = @userId
      AND b.CategoryID = @categoryId
      AND b.Period = 'monthly'
      AND b.IsActive = 1;
    
    SET @updatedCount = @updatedCount + @@ROWCOUNT;
    
    -- Quarterly budgets
    DECLARE @currentDate DATE = GETDATE();
    DECLARE @quarter INT = CEILING(MONTH(@currentDate) / 3.0);
    DECLARE @quarterStartMonth INT = (@quarter - 1) * 3 + 1;
    DECLARE @quarterStart DATE = DATEFROMPARTS(YEAR(@currentDate), @quarterStartMonth, 1);
    DECLARE @quarterEnd DATE = EOMONTH(DATEADD(MONTH, 2, @quarterStart));
    
    UPDATE b
    SET b.SpentAmount = (
        SELECT ISNULL(SUM(t.Amount), 0)
        FROM Transactions t
        WHERE t.UserID = @userId
          AND t.CategoryID = @categoryId
          AND t.Type = 'Expense'
          AND t.TransactionDate >= @quarterStart
          AND t.TransactionDate <= @quarterEnd
    ),
    b.UpdatedAt = GETUTCDATE()
    FROM Budgets b
    WHERE b.UserID = @userId
      AND b.CategoryID = @categoryId
      AND b.Period = 'quarterly'
      AND b.IsActive = 1;
    
    SET @updatedCount = @updatedCount + @@ROWCOUNT;
    
    -- Yearly budgets
    UPDATE b
    SET b.SpentAmount = (
        SELECT ISNULL(SUM(t.Amount), 0)
        FROM Transactions t
        WHERE t.UserID = @userId
          AND t.CategoryID = @categoryId
          AND t.Type = 'Expense'
          AND t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1)
          AND t.TransactionDate <= DATEFROMPARTS(YEAR(GETDATE()), 12, 31)
    ),
    b.UpdatedAt = GETUTCDATE()
    FROM Budgets b
    WHERE b.UserID = @userId
      AND b.CategoryID = @categoryId
      AND b.Period = 'yearly'
      AND b.IsActive = 1;
    
    SET @updatedCount = @updatedCount + @@ROWCOUNT;
    
    PRINT 'sp_UpdateBudgetSpentAmount updated ' + CAST(@updatedCount AS NVARCHAR(10)) + ' budgets';
    
    RETURN @updatedCount;
END;
GO

PRINT '✅ Stored procedure sp_UpdateBudgetSpentAmount đã được tạo thành công!';

-- Test procedure ngay
PRINT '';
PRINT '🧪 TEST PROCEDURE:';

DECLARE @testUserId UNIQUEIDENTIFIER;
DECLARE @testCategoryId UNIQUEIDENTIFIER;

-- Lấy user và category từ budget gần đây nhất
SELECT TOP 1 @testUserId = UserID, @testCategoryId = CategoryID
FROM Budgets 
WHERE IsActive = 1 AND CategoryID IS NOT NULL
ORDER BY CreatedAt DESC;

IF @testUserId IS NOT NULL AND @testCategoryId IS NOT NULL
BEGIN
    PRINT 'Testing với userId: ' + CAST(@testUserId AS NVARCHAR(36));
    PRINT 'Testing với categoryId: ' + CAST(@testCategoryId AS NVARCHAR(36));
    
    EXEC sp_UpdateBudgetSpentAmount @testUserId, @testCategoryId;
    
    PRINT '✅ Test procedure hoàn thành!';
END
ELSE
BEGIN
    PRINT '⚠️ Không có dữ liệu để test procedure';
END
