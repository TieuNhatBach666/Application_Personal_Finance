-- Sửa lỗi stored procedure nhận quá nhiều tham số
USE PersonalFinanceDB;
GO

PRINT '🔧 SỬA LỖI STORED PROCEDURE ARGUMENTS';
PRINT '=====================================';

-- 1. Kiểm tra procedure hiện tại
PRINT '1. Kiểm tra procedure hiện tại:';
SELECT 
    p.name as ProcedureName,
    par.name as ParameterName,
    t.name as DataType,
    par.max_length,
    par.is_output
FROM sys.procedures p
INNER JOIN sys.parameters par ON p.object_id = par.object_id
INNER JOIN sys.types t ON par.user_type_id = t.user_type_id
WHERE p.name = 'sp_UpdateBudgetSpentAmount'
ORDER BY par.parameter_id;

PRINT '';

-- 2. Drop và tạo lại procedure với đúng signature
PRINT '2. Tạo lại procedure với đúng signature:';

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
BEGIN
    DROP PROCEDURE sp_UpdateBudgetSpentAmount;
    PRINT '   ✅ Đã xóa procedure cũ';
END

-- Tạo procedure mới với đúng 2 tham số
CREATE PROCEDURE sp_UpdateBudgetSpentAmount
    @userId UNIQUEIDENTIFIER,
    @categoryId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @currentDate DATE = GETDATE();
    DECLARE @startDate DATE;
    DECLARE @endDate DATE;
    
    PRINT 'Executing sp_UpdateBudgetSpentAmount for userId: ' + CAST(@userId AS NVARCHAR(36)) + ', categoryId: ' + CAST(@categoryId AS NVARCHAR(36));
    
    -- Update all budgets for this user and category
    DECLARE budget_cursor CURSOR FOR
    SELECT BudgetID, Period, CreatedAt, BudgetName
    FROM Budgets 
    WHERE UserID = @userId 
      AND (CategoryID = @categoryId OR CategoryID IS NULL) -- Support both category-specific and general budgets
      AND IsActive = 1;
    
    DECLARE @budgetId UNIQUEIDENTIFIER;
    DECLARE @period NVARCHAR(20);
    DECLARE @createdAt DATETIME2;
    DECLARE @budgetName NVARCHAR(255);
    
    OPEN budget_cursor;
    FETCH NEXT FROM budget_cursor INTO @budgetId, @period, @createdAt, @budgetName;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        PRINT 'Processing budget: ' + @budgetName + ' (Period: ' + @period + ')';
        
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
        
        PRINT 'Date range: ' + CAST(@startDate AS NVARCHAR(10)) + ' to ' + CAST(@endDate AS NVARCHAR(10));
        
        -- Calculate total spent amount for this budget period
        DECLARE @totalSpent DECIMAL(18,2) = 0;
        
        SELECT @totalSpent = ISNULL(SUM(t.Amount), 0)
        FROM Transactions t
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
        
        PRINT 'Total spent calculated: ' + CAST(@totalSpent AS NVARCHAR(20));
        
        -- Update the budget spent amount
        UPDATE Budgets 
        SET SpentAmount = @totalSpent,
            UpdatedAt = GETUTCDATE()
        WHERE BudgetID = @budgetId;
        
        PRINT '✅ Updated budget ' + @budgetName + ' with spent amount: ' + CAST(@totalSpent AS NVARCHAR(20));
        
        FETCH NEXT FROM budget_cursor INTO @budgetId, @period, @createdAt, @budgetName;
    END
    
    CLOSE budget_cursor;
    DEALLOCATE budget_cursor;
    
    PRINT 'sp_UpdateBudgetSpentAmount completed successfully';
END;
GO

PRINT '✅ Procedure đã được tạo lại với đúng signature!';

-- 3. Test procedure với 1 budget
PRINT '';
PRINT '3. Test procedure:';

DECLARE @testUserId UNIQUEIDENTIFIER;
DECLARE @testCategoryId UNIQUEIDENTIFIER;

-- Lấy 1 user và category để test
SELECT TOP 1 @testUserId = UserID FROM Budgets WHERE IsActive = 1;
SELECT TOP 1 @testCategoryId = CategoryID FROM Budgets WHERE UserID = @testUserId AND CategoryID IS NOT NULL AND IsActive = 1;

IF @testUserId IS NOT NULL AND @testCategoryId IS NOT NULL
BEGIN
    PRINT 'Testing với userId: ' + CAST(@testUserId AS NVARCHAR(36)) + ', categoryId: ' + CAST(@testCategoryId AS NVARCHAR(36));
    EXEC sp_UpdateBudgetSpentAmount @testUserId, @testCategoryId;
    PRINT '✅ Test thành công!';
END
ELSE
BEGIN
    PRINT '⚠️ Không có dữ liệu để test';
END

-- 4. Cập nhật tất cả budgets
PRINT '';
PRINT '4. Cập nhật tất cả budgets:';

DECLARE @userId UNIQUEIDENTIFIER;
DECLARE @categoryId UNIQUEIDENTIFIER;
DECLARE @budgetName NVARCHAR(255);

DECLARE budget_update_cursor CURSOR FOR
SELECT DISTINCT b.UserID, b.CategoryID, b.BudgetName
FROM Budgets b
WHERE b.IsActive = 1 AND b.CategoryID IS NOT NULL; -- Chỉ category-specific budgets

OPEN budget_update_cursor;
FETCH NEXT FROM budget_update_cursor INTO @userId, @categoryId, @budgetName;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '📊 Cập nhật ngân sách: ' + @budgetName;
    EXEC sp_UpdateBudgetSpentAmount @userId, @categoryId;
    FETCH NEXT FROM budget_update_cursor INTO @userId, @categoryId, @budgetName;
END

CLOSE budget_update_cursor;
DEALLOCATE budget_update_cursor;

PRINT '';
PRINT '✅ Hoàn thành cập nhật tất cả ngân sách!';

-- 5. Hiển thị kết quả
PRINT '';
PRINT '📊 KẾT QUẢ SAU KHI CẬP NHẬT:';
SELECT 
    b.BudgetName as [Tên Ngân Sách],
    c.CategoryName as [Danh Mục],
    FORMAT(b.BudgetAmount, 'N0') + ' ₫' as [Ngân Sách],
    FORMAT(b.SpentAmount, 'N0') + ' ₫' as [Đã Chi],
    FORMAT(b.BudgetAmount - b.SpentAmount, 'N0') + ' ₫' as [Còn Lại],
    CAST(ROUND((b.SpentAmount * 100.0 / NULLIF(b.BudgetAmount, 0)), 1) AS DECIMAL(5,1)) as [Tỷ Lệ %],
    CASE 
        WHEN b.SpentAmount >= b.BudgetAmount THEN '🔴 Vượt ngân sách'
        WHEN b.SpentAmount >= (b.BudgetAmount * ISNULL(b.WarningThreshold, 80) / 100.0) THEN '🟡 Gần vượt'
        ELSE '🟢 An toàn'
    END as [Trạng Thái]
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.IsActive = 1
ORDER BY b.CreatedAt DESC;

PRINT '';
PRINT '🎉 Procedure đã được sửa và ngân sách đã cập nhật thành công!';
