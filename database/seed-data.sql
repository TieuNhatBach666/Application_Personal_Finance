-- Seed data for Personal Finance Manager
USE PersonalFinanceDB;
GO

-- Insert default categories for Income
INSERT INTO Categories (UserID, CategoryName, CategoryType, IconName, ColorCode) VALUES
(NULL, N'Lương', 'Income', 'salary', '#27ae60'),
(NULL, N'Thưởng', 'Income', 'bonus', '#f39c12'),
(NULL, N'Phụ cấp', 'Income', 'allowance', '#3498db'),
(NULL, N'Đầu tư', 'Income', 'investment', '#9b59b6'),
(NULL, N'Kinh doanh', 'Income', 'business', '#e67e22'),
(NULL, N'Thu nhập khác', 'Income', 'other', '#95a5a6');

-- Insert default categories for Expense
INSERT INTO Categories (UserID, CategoryName, CategoryType, IconName, ColorCode) VALUES
(NULL, N'Ăn uống', 'Expense', 'food', '#e74c3c'),
(NULL, N'Đi lại', 'Expense', 'transport', '#3498db'),
(NULL, N'Học tập', 'Expense', 'education', '#9b59b6'),
(NULL, N'Giải trí', 'Expense', 'entertainment', '#f39c12'),
(NULL, N'Y tế', 'Expense', 'healthcare', '#e67e22'),
(NULL, N'Mua sắm', 'Expense', 'shopping', '#e91e63'),
(NULL, N'Hóa đơn', 'Expense', 'bills', '#607d8b'),
(NULL, N'Nhà ở', 'Expense', 'housing', '#795548'),
(NULL, N'Quần áo', 'Expense', 'clothing', '#ff5722'),
(NULL, N'Chi tiêu khác', 'Expense', 'other', '#95a5a6');

-- Create a stored procedure to copy default categories for new users
GO
CREATE PROCEDURE sp_CreateDefaultCategoriesForUser
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Copy default categories (where UserID is NULL) for the new user
    INSERT INTO Categories (UserID, CategoryName, CategoryType, IconName, ColorCode, CreatedAt, IsActive)
    SELECT 
        @UserID,
        CategoryName,
        CategoryType,
        IconName,
        ColorCode,
        GETDATE(),
        1
    FROM Categories 
    WHERE UserID IS NULL;
    
    PRINT 'Default categories created for UserID: ' + CAST(@UserID AS NVARCHAR(10));
END
GO

-- Create a function to calculate budget progress
CREATE FUNCTION fn_GetBudgetProgress(@BudgetID INT)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        b.BudgetID,
        b.BudgetAmount,
        ISNULL(SUM(t.Amount), 0) as SpentAmount,
        CASE 
            WHEN b.BudgetAmount > 0 
            THEN ROUND((ISNULL(SUM(t.Amount), 0) / b.BudgetAmount) * 100, 2)
            ELSE 0 
        END as PercentageUsed,
        CASE 
            WHEN ISNULL(SUM(t.Amount), 0) >= b.BudgetAmount THEN 'Over Budget'
            WHEN (ISNULL(SUM(t.Amount), 0) / b.BudgetAmount) * 100 >= 90 THEN 'Danger'
            WHEN (ISNULL(SUM(t.Amount), 0) / b.BudgetAmount) * 100 >= b.WarningThreshold THEN 'Warning'
            ELSE 'On Track'
        END as Status
    FROM Budgets b
    LEFT JOIN Transactions t ON b.CategoryID = t.CategoryID 
        AND b.UserID = t.UserID
        AND MONTH(t.TransactionDate) = b.BudgetMonth
        AND YEAR(t.TransactionDate) = b.BudgetYear
        AND t.TransactionType = 'Expense'
    WHERE b.BudgetID = @BudgetID
    GROUP BY b.BudgetID, b.BudgetAmount, b.WarningThreshold
);
GO

-- Create a view for transaction summary
CREATE VIEW vw_TransactionSummary AS
SELECT 
    t.UserID,
    YEAR(t.TransactionDate) as Year,
    MONTH(t.TransactionDate) as Month,
    t.TransactionType,
    c.CategoryName,
    c.ColorCode,
    COUNT(*) as TransactionCount,
    SUM(t.Amount) as TotalAmount,
    AVG(t.Amount) as AverageAmount
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
GROUP BY t.UserID, YEAR(t.TransactionDate), MONTH(t.TransactionDate), 
         t.TransactionType, c.CategoryName, c.ColorCode;
GO

PRINT 'Seed data and stored procedures created successfully!';