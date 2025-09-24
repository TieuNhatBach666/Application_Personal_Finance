-- Tạo stored procedure để cập nhật SpentAmount trong Budget khi có giao dịch mới
USE PersonalFinanceDB;
GO

-- Drop procedure if exists
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
    DROP PROCEDURE sp_UpdateBudgetSpentAmount;
GO

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
        
        PRINT 'Updated budget ' + CAST(@budgetId AS NVARCHAR(36)) + ' with spent amount: ' + CAST(@totalSpent AS NVARCHAR(20));
        
        FETCH NEXT FROM budget_cursor INTO @budgetId, @period, @createdAt;
    END
    
    CLOSE budget_cursor;
    DEALLOCATE budget_cursor;
END;
GO

PRINT 'Stored procedure sp_UpdateBudgetSpentAmount created successfully!';
