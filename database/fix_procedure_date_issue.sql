-- Sửa stored procedure để tính đúng ngày hôm nay
USE PersonalFinanceDB;
GO

-- Xóa procedure cũ
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
    DROP PROCEDURE sp_UpdateBudgetSpentAmount;
GO

-- Tạo procedure mới với logic date chính xác
CREATE PROCEDURE sp_UpdateBudgetSpentAmount
    @userId UNIQUEIDENTIFIER,
    @categoryId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    PRINT 'sp_UpdateBudgetSpentAmount called with userId: ' + CAST(@userId AS NVARCHAR(36)) + ', categoryId: ' + CAST(@categoryId AS NVARCHAR(36));
    
    DECLARE @updatedCount INT = 0;
    DECLARE @today DATE = CAST(GETDATE() AS DATE);
    DECLARE @currentMonth DATE = DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1);
    DECLARE @endOfMonth DATE = EOMONTH(GETDATE());
    
    PRINT 'Today: ' + CAST(@today AS NVARCHAR(20));
    PRINT 'Current month start: ' + CAST(@currentMonth AS NVARCHAR(20));
    PRINT 'End of month: ' + CAST(@endOfMonth AS NVARCHAR(20));
    
    -- Daily budgets (chỉ giao dịch hôm nay)
    UPDATE b
    SET b.SpentAmount = (
        SELECT ISNULL(SUM(t.Amount), 0)
        FROM Transactions t
        WHERE t.UserID = @userId
          AND t.CategoryID = @categoryId
          AND t.Type = 'Expense'
          AND CAST(t.TransactionDate AS DATE) = @today
    ),
    b.UpdatedAt = GETUTCDATE()
    FROM Budgets b
    WHERE b.UserID = @userId
      AND b.CategoryID = @categoryId
      AND b.Period = 'daily'
      AND b.IsActive = 1;
    
    DECLARE @dailyUpdated INT = @@ROWCOUNT;
    SET @updatedCount = @updatedCount + @dailyUpdated;
    PRINT 'Updated ' + CAST(@dailyUpdated AS NVARCHAR(10)) + ' daily budgets';
    
    -- Monthly budgets (giao dịch tháng này)
    UPDATE b
    SET b.SpentAmount = (
        SELECT ISNULL(SUM(t.Amount), 0)
        FROM Transactions t
        WHERE t.UserID = @userId
          AND t.CategoryID = @categoryId
          AND t.Type = 'Expense'
          AND t.TransactionDate >= @currentMonth
          AND t.TransactionDate <= @endOfMonth
    ),
    b.UpdatedAt = GETUTCDATE()
    FROM Budgets b
    WHERE b.UserID = @userId
      AND b.CategoryID = @categoryId
      AND b.Period = 'monthly'
      AND b.IsActive = 1;
    
    DECLARE @monthlyUpdated INT = @@ROWCOUNT;
    SET @updatedCount = @updatedCount + @monthlyUpdated;
    PRINT 'Updated ' + CAST(@monthlyUpdated AS NVARCHAR(10)) + ' monthly budgets';
    
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
    
    DECLARE @quarterlyUpdated INT = @@ROWCOUNT;
    SET @updatedCount = @updatedCount + @quarterlyUpdated;
    PRINT 'Updated ' + CAST(@quarterlyUpdated AS NVARCHAR(10)) + ' quarterly budgets';
    
    -- Yearly budgets
    DECLARE @yearStart DATE = DATEFROMPARTS(YEAR(GETDATE()), 1, 1);
    DECLARE @yearEnd DATE = DATEFROMPARTS(YEAR(GETDATE()), 12, 31);
    
    UPDATE b
    SET b.SpentAmount = (
        SELECT ISNULL(SUM(t.Amount), 0)
        FROM Transactions t
        WHERE t.UserID = @userId
          AND t.CategoryID = @categoryId
          AND t.Type = 'Expense'
          AND t.TransactionDate >= @yearStart
          AND t.TransactionDate <= @yearEnd
    ),
    b.UpdatedAt = GETUTCDATE()
    FROM Budgets b
    WHERE b.UserID = @userId
      AND b.CategoryID = @categoryId
      AND b.Period = 'yearly'
      AND b.IsActive = 1;
    
    DECLARE @yearlyUpdated INT = @@ROWCOUNT;
    SET @updatedCount = @updatedCount + @yearlyUpdated;
    PRINT 'Updated ' + CAST(@yearlyUpdated AS NVARCHAR(10)) + ' yearly budgets';
    
    PRINT 'sp_UpdateBudgetSpentAmount completed. Total updated: ' + CAST(@updatedCount AS NVARCHAR(10)) + ' budgets';
    
    RETURN @updatedCount;
END;
GO

PRINT '✅ Stored procedure sp_UpdateBudgetSpentAmount đã được tạo lại!';

-- Test procedure ngay với dữ liệu thực
PRINT '';
PRINT '🧪 TEST PROCEDURE VỚI DỮ LIỆU THỰC:';

DECLARE @testUserId UNIQUEIDENTIFIER = 'E40F69CC-3F79-486F-99BA-D51E024E3B49';
DECLARE @testCategoryId UNIQUEIDENTIFIER = 'D6EDC0A1-A10D-4B50-9969-E933391A2E1D';

PRINT 'Testing với:';
PRINT 'UserId: ' + CAST(@testUserId AS NVARCHAR(36));
PRINT 'CategoryId: ' + CAST(@testCategoryId AS NVARCHAR(36));

EXEC sp_UpdateBudgetSpentAmount @testUserId, @testCategoryId;

-- Hiển thị kết quả
PRINT '';
PRINT '📊 KẾT QUẢ SAU KHI CHẠY PROCEDURE MỚI:';
SELECT 
    BudgetName,
    Period,
    FORMAT(CAST(BudgetAmount AS BIGINT), 'N0') + ' ₫' as [Ngân sách],
    FORMAT(CAST(SpentAmount AS BIGINT), 'N0') + ' ₫' as [Đã chi],
    FORMAT(CAST((BudgetAmount - SpentAmount) AS BIGINT), 'N0') + ' ₫' as [Còn lại],
    UpdatedAt as [Cập nhật lúc],
    CASE 
        WHEN SpentAmount >= BudgetAmount THEN '🔴 Vượt ngân sách'
        WHEN SpentAmount >= (BudgetAmount * 0.8) THEN '🟡 Gần vượt'
        WHEN SpentAmount > 0 THEN '🟢 Đang sử dụng'
        ELSE '⚪ Chưa sử dụng'
    END as [Trạng thái]
FROM Budgets 
WHERE UserID = @testUserId 
  AND CategoryID = @testCategoryId
  AND IsActive = 1
ORDER BY UpdatedAt DESC;
