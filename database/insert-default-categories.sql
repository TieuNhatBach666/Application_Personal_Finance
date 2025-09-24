-- Insert default categories for Personal Finance Manager
USE PersonalFinanceDB;
GO

-- Clear existing default categories (where UserID is NULL)
DELETE FROM Categories WHERE UserID IS NULL;

-- Insert default Income categories
INSERT INTO Categories (UserID, CategoryName, CategoryType, IconName, ColorCode) VALUES
(NULL, N'Lương', 'Income', 'salary', '#27ae60'),
(NULL, N'Thưởng', 'Income', 'bonus', '#f39c12'),
(NULL, N'Phụ cấp', 'Income', 'allowance', '#3498db'),
(NULL, N'Đầu tư', 'Income', 'investment', '#9b59b6'),
(NULL, N'Kinh doanh', 'Income', 'business', '#e67e22'),
(NULL, N'Thu nhập khác', 'Income', 'other', '#95a5a6');

-- Insert default Expense categories
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

-- Create stored procedure for copying default categories to new users
IF OBJECT_ID('sp_CreateDefaultCategoriesForUser', 'P') IS NOT NULL
    DROP PROCEDURE sp_CreateDefaultCategoriesForUser;
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
    
    SELECT @@ROWCOUNT as CategoriesCreated;
    PRINT 'Default categories created for UserID: ' + CAST(@UserID AS NVARCHAR(10));
END
GO

-- Verify the categories were inserted
SELECT 
    CategoryType,
    COUNT(*) as CategoryCount
FROM Categories 
WHERE UserID IS NULL
GROUP BY CategoryType;

SELECT * FROM Categories WHERE UserID IS NULL ORDER BY CategoryType, CategoryName;

PRINT 'Default categories inserted successfully!';