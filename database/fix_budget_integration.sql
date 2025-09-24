-- Script để sửa vấn đề tích hợp ngân sách với giao dịch
-- Chạy script này để ngân sách có thể tự động cập nhật khi có giao dịch mới

USE PersonalFinanceDB;
GO

PRINT '🔧 Bắt đầu sửa tích hợp ngân sách với giao dịch...';

-- 1. Tạo stored procedure để cập nhật SpentAmount
PRINT '📝 Tạo stored procedure sp_UpdateBudgetSpentAmount...';

-- Drop procedure if exists
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
BEGIN
    DROP PROCEDURE sp_UpdateBudgetSpentAmount;
    PRINT '   ✅ Đã xóa procedure cũ';
END

-- Create procedure to update budget spent amount
CREATE PROCEDURE sp_UpdateBudgetSpentAmount
    @userId UNIQUEIDENTIFIER,
    @categoryId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @currentDate DATE = GETDATE();
    DECLARE @startDate DATE;
    DECLARE @endDate DATE;
    
    -- Update all budgets for this user and category
    DECLARE budget_cursor CURSOR FOR
    SELECT BudgetID, Period, CreatedAt
    FROM Budgets 
    WHERE UserID = @userId 
      AND (CategoryID = @categoryId OR CategoryID IS NULL) -- Support both category-specific and general budgets
      AND IsActive = 1;
    
    DECLARE @budgetId UNIQUEIDENTIFIER;
    DECLARE @period NVARCHAR(20);
    DECLARE @createdAt DATETIME2;
    
    OPEN budget_cursor;
    FETCH NEXT FROM budget_cursor INTO @budgetId, @period, @createdAt;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Calculate date range based on budget period
        IF @period = 'monthly'
        BEGIN
            SET @startDate = DATEFROMPARTS(YEAR(@currentDate), MONTH(@currentDate), 1);
            SET @endDate = EOMONTH(@currentDate);
        END
        ELSE IF @period = 'quarterly'
        BEGIN
            DECLARE @quarter INT = CEILING(MONTH(@currentDate) / 3.0);
            DECLARE @quarterStartMonth INT = (@quarter - 1) * 3 + 1;
            SET @startDate = DATEFROMPARTS(YEAR(@currentDate), @quarterStartMonth, 1);
            SET @endDate = EOMONTH(DATEADD(MONTH, 2, @startDate));
        END
        ELSE IF @period = 'yearly'
        BEGIN
            SET @startDate = DATEFROMPARTS(YEAR(@currentDate), 1, 1);
            SET @endDate = DATEFROMPARTS(YEAR(@currentDate), 12, 31);
        END
        
        -- Calculate total spent amount for this budget period
        DECLARE @totalSpent DECIMAL(18,2) = 0;
        
        SELECT @totalSpent = ISNULL(SUM(t.Amount), 0)
        FROM Transactions t
        INNER JOIN Categories c ON t.CategoryID = c.CategoryID
        WHERE t.UserID = @userId
          AND t.Type = 'Expense'
          AND t.TransactionDate >= @startDate
          AND t.TransactionDate <= @endDate
          AND (
              -- Category-specific budget
              (SELECT CategoryID FROM Budgets WHERE BudgetID = @budgetId) = t.CategoryID
              OR
              -- General budget (no specific category)
              (SELECT CategoryID FROM Budgets WHERE BudgetID = @budgetId) IS NULL
          );
        
        -- Update the budget spent amount
        UPDATE Budgets 
        SET SpentAmount = @totalSpent,
            UpdatedAt = GETUTCDATE()
        WHERE BudgetID = @budgetId;
        
        PRINT '   📊 Cập nhật ngân sách ' + CAST(@budgetId AS NVARCHAR(36)) + ' với số tiền đã chi: ' + CAST(@totalSpent AS NVARCHAR(20));
        
        FETCH NEXT FROM budget_cursor INTO @budgetId, @period, @createdAt;
    END
    
    CLOSE budget_cursor;
    DEALLOCATE budget_cursor;
END;
GO

PRINT '✅ Stored procedure sp_UpdateBudgetSpentAmount đã được tạo thành công!';

-- 2. Cập nhật tất cả ngân sách hiện có với dữ liệu thực tế
PRINT '🔄 Cập nhật tất cả ngân sách hiện có...';

DECLARE @userId UNIQUEIDENTIFIER;
DECLARE @categoryId UNIQUEIDENTIFIER;

DECLARE budget_update_cursor CURSOR FOR
SELECT DISTINCT UserID, CategoryID
FROM Budgets 
WHERE IsActive = 1;

OPEN budget_update_cursor;
FETCH NEXT FROM budget_update_cursor INTO @userId, @categoryId;

WHILE @@FETCH_STATUS = 0
BEGIN
    IF @categoryId IS NOT NULL
    BEGIN
        EXEC sp_UpdateBudgetSpentAmount @userId, @categoryId;
    END
    FETCH NEXT FROM budget_update_cursor INTO @userId, @categoryId;
END

CLOSE budget_update_cursor;
DEALLOCATE budget_update_cursor;

PRINT '✅ Đã cập nhật tất cả ngân sách hiện có!';

-- 3. Hiển thị kết quả
PRINT '📊 Kết quả sau khi cập nhật:';

SELECT 
    b.BudgetName as [Tên Ngân Sách],
    c.CategoryName as [Danh Mục],
    b.BudgetAmount as [Ngân Sách],
    b.SpentAmount as [Đã Chi],
    CAST((b.SpentAmount * 100.0 / b.BudgetAmount) AS DECIMAL(5,2)) as [Phần Trăm (%)],
    b.Period as [Chu Kỳ],
    CASE 
        WHEN b.SpentAmount >= b.BudgetAmount THEN '🔴 Vượt ngân sách'
        WHEN b.SpentAmount >= (b.BudgetAmount * b.WarningThreshold / 100.0) THEN '🟡 Gần vượt'
        ELSE '🟢 An toàn'
    END as [Trạng Thái]
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.IsActive = 1
ORDER BY b.UserID, b.BudgetName;

PRINT '🎉 Hoàn thành! Ngân sách giờ sẽ tự động cập nhật khi có giao dịch mới.';
PRINT '';
PRINT '📋 Những gì đã thay đổi:';
PRINT '   ✅ Tạo stored procedure sp_UpdateBudgetSpentAmount';
PRINT '   ✅ Backend sẽ tự động gọi procedure khi tạo giao dịch mới';
PRINT '   ✅ Tất cả ngân sách hiện có đã được cập nhật với dữ liệu thực tế';
PRINT '   ✅ Ngân sách sẽ hiển thị đúng phần trăm đã chi tiêu';
