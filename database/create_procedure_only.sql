-- Tạo stored procedure riêng biệt
USE PersonalFinanceDB;
GO

-- Xóa procedure cũ nếu có
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
    DROP PROCEDURE sp_UpdateBudgetSpentAmount;
GO

-- Tạo procedure mới
CREATE PROCEDURE sp_UpdateBudgetSpentAmount
    @userId UNIQUEIDENTIFIER,
    @categoryId UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Tính ngày tháng hiện tại
    DECLARE @currentDate DATE = GETDATE();
    DECLARE @startOfMonth DATE = DATEFROMPARTS(YEAR(@currentDate), MONTH(@currentDate), 1);
    DECLARE @endOfMonth DATE = EOMONTH(@currentDate);
    
    -- Cập nhật tất cả budgets của user này cho category này
    UPDATE b
    SET b.SpentAmount = (
        SELECT ISNULL(SUM(t.Amount), 0)
        FROM Transactions t
        WHERE t.UserID = @userId
          AND t.Type = 'Expense'
          AND t.CategoryID = @categoryId
          AND t.TransactionDate >= @startOfMonth
          AND t.TransactionDate <= @endOfMonth
    ),
    b.UpdatedAt = GETUTCDATE()
    FROM Budgets b
    WHERE b.UserID = @userId
      AND b.CategoryID = @categoryId
      AND b.IsActive = 1
      AND b.Period = 'monthly'; -- Chỉ cập nhật monthly budgets
    
    -- Return số lượng budgets đã cập nhật
    RETURN @@ROWCOUNT;
END;
GO

PRINT 'Stored procedure sp_UpdateBudgetSpentAmount đã được tạo thành công!';
