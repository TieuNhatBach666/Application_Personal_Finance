-- Check existing schema and adapt to current structure
USE PersonalFinanceDB;
GO

-- Check current table structure
PRINT 'Current table structure:';
SELECT 
    t.TABLE_NAME,
    c.COLUMN_NAME,
    c.DATA_TYPE,
    c.IS_NULLABLE,
    c.COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.TABLES t
INNER JOIN INFORMATION_SCHEMA.COLUMNS c ON t.TABLE_NAME = c.TABLE_NAME
WHERE t.TABLE_TYPE = 'BASE TABLE'
ORDER BY t.TABLE_NAME, c.ORDINAL_POSITION;

-- Check existing data
PRINT 'Checking existing data:';
SELECT 'Users' as TableName, COUNT(*) as RecordCount FROM Users
UNION ALL
SELECT 'Categories', COUNT(*) FROM Categories
UNION ALL
SELECT 'Transactions', COUNT(*) FROM Transactions
UNION ALL
SELECT 'Budgets', COUNT(*) FROM Budgets;

-- Check if we have default categories (UserID is NULL or specific pattern)
PRINT 'Checking categories:';
SELECT 
    Type as CategoryType,
    COUNT(*) as Count
FROM Categories
GROUP BY Type;

SELECT TOP 10 * FROM Categories ORDER BY Name;