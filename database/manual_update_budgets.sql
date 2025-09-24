-- Script cập nhật manual tất cả ngân sách với dữ liệu thực tế
USE PersonalFinanceDB;
GO

PRINT '🔧 CẬP NHẬT MANUAL TẤT CẢ NGÂN SÁCH';
PRINT '===================================';

-- Tạo stored procedure nếu chưa có
IF NOT EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
BEGIN
    PRINT '📝 Tạo stored procedure sp_UpdateBudgetSpentAmount...';
    
    EXEC('
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
          AND (CategoryID = @categoryId OR CategoryID IS NULL)
          AND IsActive = 1;
        
        DECLARE @budgetId UNIQUEIDENTIFIER;
        DECLARE @period NVARCHAR(20);
        DECLARE @createdAt DATETIME2;
        
        OPEN budget_cursor;
        FETCH NEXT FROM budget_cursor INTO @budgetId, @period, @createdAt;
        
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Calculate date range based on budget period
            IF @period = ''monthly''
            BEGIN
                SET @startDate = DATEFROMPARTS(YEAR(@currentDate), MONTH(@currentDate), 1);
                SET @endDate = EOMONTH(@currentDate);
            END
            ELSE IF @period = ''quarterly''
            BEGIN
                DECLARE @quarter INT = CEILING(MONTH(@currentDate) / 3.0);
                DECLARE @quarterStartMonth INT = (@quarter - 1) * 3 + 1;
                SET @startDate = DATEFROMPARTS(YEAR(@currentDate), @quarterStartMonth, 1);
                SET @endDate = EOMONTH(DATEADD(MONTH, 2, @startDate));
            END
            ELSE IF @period = ''yearly''
            BEGIN
                SET @startDate = DATEFROMPARTS(YEAR(@currentDate), 1, 1);
                SET @endDate = DATEFROMPARTS(YEAR(@currentDate), 12, 31);
            END
            
            -- Calculate total spent amount for this budget period
            DECLARE @totalSpent DECIMAL(18,2) = 0;
            
            SELECT @totalSpent = ISNULL(SUM(t.Amount), 0)
            FROM Transactions t
            WHERE t.UserID = @userId
              AND t.Type = ''Expense''
              AND t.TransactionDate >= @startDate
              AND t.TransactionDate <= @endDate
              AND (
                  (SELECT CategoryID FROM Budgets WHERE BudgetID = @budgetId) = t.CategoryID
                  OR
                  (SELECT CategoryID FROM Budgets WHERE BudgetID = @budgetId) IS NULL
              );
            
            -- Update the budget spent amount
            UPDATE Budgets 
            SET SpentAmount = @totalSpent,
                UpdatedAt = GETUTCDATE()
            WHERE BudgetID = @budgetId;
            
            FETCH NEXT FROM budget_cursor INTO @budgetId, @period, @createdAt;
        END
        
        CLOSE budget_cursor;
        DEALLOCATE budget_cursor;
    END;
    ');
    
    PRINT '✅ Stored procedure đã được tạo!';
END
ELSE
BEGIN
    PRINT '✅ Stored procedure đã tồn tại!';
END

PRINT '';

-- Cập nhật tất cả ngân sách hiện có
PRINT '🔄 Cập nhật tất cả ngân sách hiện có...';

DECLARE @userId UNIQUEIDENTIFIER;
DECLARE @categoryId UNIQUEIDENTIFIER;
DECLARE @budgetName NVARCHAR(255);

DECLARE budget_update_cursor CURSOR FOR
SELECT DISTINCT b.UserID, b.CategoryID, b.BudgetName
FROM Budgets b
WHERE b.IsActive = 1;

OPEN budget_update_cursor;
FETCH NEXT FROM budget_update_cursor INTO @userId, @categoryId, @budgetName;

WHILE @@FETCH_STATUS = 0
BEGIN
    PRINT '   📊 Cập nhật ngân sách: ' + @budgetName;
    
    IF @categoryId IS NOT NULL
    BEGIN
        EXEC sp_UpdateBudgetSpentAmount @userId, @categoryId;
    END
    ELSE
    BEGIN
        -- For general budgets (no specific category), update with all expenses
        DECLARE @currentDate DATE = GETDATE();
        DECLARE @startDate DATE = DATEFROMPARTS(YEAR(@currentDate), MONTH(@currentDate), 1);
        DECLARE @endDate DATE = EOMONTH(@currentDate);
        
        DECLARE @totalSpent DECIMAL(18,2);
        SELECT @totalSpent = ISNULL(SUM(Amount), 0)
        FROM Transactions 
        WHERE UserID = @userId 
          AND Type = 'Expense'
          AND TransactionDate >= @startDate
          AND TransactionDate <= @endDate;
        
        UPDATE Budgets 
        SET SpentAmount = @totalSpent,
            UpdatedAt = GETUTCDATE()
        WHERE UserID = @userId AND CategoryID IS NULL AND IsActive = 1;
        
        PRINT '   💰 Cập nhật general budget với tổng chi tiêu: ' + CAST(@totalSpent AS NVARCHAR(20));
    END
    
    FETCH NEXT FROM budget_update_cursor INTO @userId, @categoryId, @budgetName;
END

CLOSE budget_update_cursor;
DEALLOCATE budget_update_cursor;

PRINT '';
PRINT '✅ Hoàn thành cập nhật tất cả ngân sách!';

-- Hiển thị kết quả
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
PRINT '🎉 Ngân sách giờ sẽ hiển thị đúng dữ liệu thực tế!';
