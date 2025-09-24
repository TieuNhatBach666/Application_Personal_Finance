-- Tạo stored procedure hỗ trợ tất cả periods
USE PersonalFinanceDB;
GO

-- Xóa procedure cũ
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
    DROP PROCEDURE sp_UpdateBudgetSpentAmount;
GO

-- Tạo procedure mới hỗ trợ tất cả periods
CREATE PROCEDURE sp_UpdateBudgetSpentAmount
    @userId UNIQUEIDENTIFIER,
    @categoryId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @currentDate DATE = GETDATE();
    DECLARE @startDate DATE;
    DECLARE @endDate DATE;
    DECLARE @period NVARCHAR(20);
    DECLARE @budgetId UNIQUEIDENTIFIER;
    DECLARE @totalSpent DECIMAL(18,2);
    
    -- Cursor để duyệt qua tất cả budgets của user và category này
    DECLARE budget_cursor CURSOR FOR
    SELECT BudgetID, Period
    FROM Budgets 
    WHERE UserID = @userId 
      AND CategoryID = @categoryId
      AND IsActive = 1;
    
    OPEN budget_cursor;
    FETCH NEXT FROM budget_cursor INTO @budgetId, @period;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Tính date range dựa trên period
        IF @period = 'daily'
        BEGIN
            SET @startDate = @currentDate;
            SET @endDate = @currentDate;
        END
        ELSE IF @period = 'monthly'
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
        ELSE
        BEGIN
            -- Default to monthly if unknown period
            SET @startDate = DATEFROMPARTS(YEAR(@currentDate), MONTH(@currentDate), 1);
            SET @endDate = EOMONTH(@currentDate);
        END
        
        -- Tính tổng chi tiêu trong khoảng thời gian
        SELECT @totalSpent = ISNULL(SUM(Amount), 0)
        FROM Transactions
        WHERE UserID = @userId
          AND CategoryID = @categoryId
          AND Type = 'Expense'
          AND TransactionDate >= @startDate
          AND TransactionDate <= @endDate;
        
        -- Cập nhật budget
        UPDATE Budgets
        SET SpentAmount = @totalSpent,
            UpdatedAt = GETUTCDATE()
        WHERE BudgetID = @budgetId;
        
        -- Log (optional)
        PRINT 'Updated budget ' + CAST(@budgetId AS NVARCHAR(36)) + 
              ' (' + @period + ') with spent amount: ' + CAST(@totalSpent AS NVARCHAR(20));
        
        FETCH NEXT FROM budget_cursor INTO @budgetId, @period;
    END
    
    CLOSE budget_cursor;
    DEALLOCATE budget_cursor;
    
    RETURN @@ROWCOUNT;
END;
GO

PRINT 'Universal stored procedure sp_UpdateBudgetSpentAmount đã được tạo thành công!';
