-- Setup default data for existing schema
USE PersonalFinanceDB;
GO

-- First, let's check the foreign key constraints
SELECT 
    fk.name AS ForeignKeyName,
    tp.name AS ParentTable,
    cp.name AS ParentColumn,
    tr.name AS ReferencedTable,
    cr.name AS ReferencedColumn
FROM sys.foreign_keys fk
INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
INNER JOIN sys.columns cp ON fkc.parent_column_id = cp.column_id AND fkc.parent_object_id = cp.object_id
INNER JOIN sys.columns cr ON fkc.referenced_column_id = cr.column_id AND fkc.referenced_object_id = cr.object_id
WHERE tp.name = 'Categories';

-- Option 1: Temporarily disable foreign key constraint
ALTER TABLE Categories NOCHECK CONSTRAINT ALL;

-- Clear existing categories
DELETE FROM Categories;

-- Create a special UserID for default categories
DECLARE @DefaultUserID UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000000';

-- Insert default Income categories
INSERT INTO Categories (CategoryID, UserID, Name, Type, Icon, Color, IsActive, CreatedAt, UpdatedAt) VALUES
(NEWID(), @DefaultUserID, N'Lương', 'Income', 'salary', '#27ae60', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Thưởng', 'Income', 'bonus', '#f39c12', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Phụ cấp', 'Income', 'allowance', '#3498db', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Đầu tư', 'Income', 'investment', '#9b59b6', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Kinh doanh', 'Income', 'business', '#e67e22', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Thu nhập khác', 'Income', 'other', '#95a5a6', 1, GETUTCDATE(), GETUTCDATE());

-- Insert default Expense categories
INSERT INTO Categories (CategoryID, UserID, Name, Type, Icon, Color, IsActive, CreatedAt, UpdatedAt) VALUES
(NEWID(), @DefaultUserID, N'Ăn uống', 'Expense', 'food', '#e74c3c', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Đi lại', 'Expense', 'transport', '#3498db', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Học tập', 'Expense', 'education', '#9b59b6', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Giải trí', 'Expense', 'entertainment', '#f39c12', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Y tế', 'Expense', 'healthcare', '#e67e22', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Mua sắm', 'Expense', 'shopping', '#e91e63', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Hóa đơn', 'Expense', 'bills', '#607d8b', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Nhà ở', 'Expense', 'housing', '#795548', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Quần áo', 'Expense', 'clothing', '#ff5722', 1, GETUTCDATE(), GETUTCDATE()),
(NEWID(), @DefaultUserID, N'Chi tiêu khác', 'Expense', 'other', '#95a5a6', 1, GETUTCDATE(), GETUTCDATE());

-- Re-enable foreign key constraint
ALTER TABLE Categories CHECK CONSTRAINT ALL;

-- Verify the categories were inserted
SELECT 
    Type as CategoryType,
    COUNT(*) as CategoryCount
FROM Categories 
WHERE UserID = @DefaultUserID
GROUP BY Type;

SELECT 
    Name,
    Type,
    Icon,
    Color
FROM Categories 
WHERE UserID = @DefaultUserID
ORDER BY Type, Name;

PRINT 'Default categories setup completed!';