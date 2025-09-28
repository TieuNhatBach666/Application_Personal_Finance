-- ========================================
-- SCRIPT XUẤT TOÀN BỘ DATABASE PERSONALFINANCEDB
-- Tác giả: Tiểu Nhất Bạch
-- Ngày: 28/09/2025
-- ========================================

USE PersonalFinanceDB;
GO

PRINT '========================================';
PRINT '    XUẤT DATABASE PERSONALFINANCEDB';
PRINT '========================================';
PRINT '';

-- ========================================
-- 1. XUẤT CẤU TRÚC BẢNG
-- ========================================

PRINT '1. XUẤT CẤU TRÚC CÁC BẢNG...';

-- Lấy script tạo tất cả bảng
SELECT 
    'CREATE TABLE [' + TABLE_SCHEMA + '].[' + TABLE_NAME + '] (' +
    STUFF((
        SELECT ', [' + COLUMN_NAME + '] ' + DATA_TYPE + 
               CASE 
                   WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL 
                   THEN '(' + CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR(10)) + ')'
                   WHEN NUMERIC_PRECISION IS NOT NULL 
                   THEN '(' + CAST(NUMERIC_PRECISION AS VARCHAR(10)) + ',' + CAST(NUMERIC_SCALE AS VARCHAR(10)) + ')'
                   ELSE ''
               END +
               CASE WHEN IS_NULLABLE = 'NO' THEN ' NOT NULL' ELSE ' NULL' END
        FROM INFORMATION_SCHEMA.COLUMNS c2
        WHERE c2.TABLE_NAME = c1.TABLE_NAME AND c2.TABLE_SCHEMA = c1.TABLE_SCHEMA
        ORDER BY ORDINAL_POSITION
        FOR XML PATH('')
    ), 1, 2, '') + ');'
FROM INFORMATION_SCHEMA.COLUMNS c1
WHERE TABLE_SCHEMA = 'dbo'
GROUP BY TABLE_SCHEMA, TABLE_NAME
ORDER BY TABLE_NAME;

-- ========================================
-- 2. XUẤT DỮ LIỆU CÁC BẢNG
-- ========================================

PRINT '';
PRINT '2. XUẤT DỮ LIỆU CÁC BẢNG...';

-- Users
PRINT '2.1. Xuất dữ liệu bảng Users...';
SELECT 'INSERT INTO Users (UserID, Email, PasswordHash, FirstName, LastName, PhoneNumber, AvatarUrl, CreatedAt, UpdatedAt, IsActive, Currency, Language, Timezone) VALUES (' +
       CAST(UserID AS VARCHAR(10)) + ', ''' + 
       Email + ''', ''' + 
       PasswordHash + ''', ''' + 
       ISNULL(FirstName, '') + ''', ''' + 
       ISNULL(LastName, '') + ''', ''' + 
       ISNULL(PhoneNumber, '') + ''', ''' + 
       ISNULL(AvatarUrl, '') + ''', ''' + 
       CONVERT(VARCHAR(23), CreatedAt, 121) + ''', ''' + 
       CONVERT(VARCHAR(23), UpdatedAt, 121) + ''', ' + 
       CAST(CAST(IsActive AS INT) AS VARCHAR(1)) + ', ''' + 
       ISNULL(Currency, 'VND') + ''', ''' + 
       ISNULL(Language, 'vi') + ''', ''' + 
       ISNULL(Timezone, 'Asia/Ho_Chi_Minh') + ''');'
FROM Users;

-- Categories
PRINT '2.2. Xuất dữ liệu bảng Categories...';
SELECT 'INSERT INTO Categories (CategoryID, CategoryName, CategoryType, Icon, Color, Description, IsDefault, CreatedAt, UpdatedAt) VALUES (' +
       CAST(CategoryID AS VARCHAR(10)) + ', ''' + 
       CategoryName + ''', ''' + 
       CategoryType + ''', ''' + 
       ISNULL(Icon, '') + ''', ''' + 
       ISNULL(Color, '') + ''', ''' + 
       ISNULL(Description, '') + ''', ' + 
       CAST(CAST(IsDefault AS INT) AS VARCHAR(1)) + ', ''' + 
       CONVERT(VARCHAR(23), CreatedAt, 121) + ''', ''' + 
       CONVERT(VARCHAR(23), UpdatedAt, 121) + ''');'
FROM Categories;

-- Transactions
PRINT '2.3. Xuất dữ liệu bảng Transactions...';
SELECT 'INSERT INTO Transactions (TransactionID, UserID, CategoryID, Amount, Description, TransactionDate, Type, CreatedAt, UpdatedAt) VALUES (' +
       CAST(TransactionID AS VARCHAR(10)) + ', ' + 
       CAST(UserID AS VARCHAR(10)) + ', ' + 
       CAST(CategoryID AS VARCHAR(10)) + ', ' + 
       CAST(Amount AS VARCHAR(20)) + ', ''' + 
       ISNULL(Description, '') + ''', ''' + 
       CONVERT(VARCHAR(10), TransactionDate, 121) + ''', ''' + 
       Type + ''', ''' + 
       CONVERT(VARCHAR(23), CreatedAt, 121) + ''', ''' + 
       CONVERT(VARCHAR(23), UpdatedAt, 121) + ''');'
FROM Transactions;

-- Budgets
PRINT '2.4. Xuất dữ liệu bảng Budgets...';
SELECT 'INSERT INTO Budgets (BudgetID, UserID, CategoryID, Amount, Period, StartDate, EndDate, CreatedAt, UpdatedAt, IsActive) VALUES (' +
       CAST(BudgetID AS VARCHAR(10)) + ', ' + 
       CAST(UserID AS VARCHAR(10)) + ', ' + 
       CAST(CategoryID AS VARCHAR(10)) + ', ' + 
       CAST(Amount AS VARCHAR(20)) + ', ''' + 
       Period + ''', ''' + 
       CONVERT(VARCHAR(10), StartDate, 121) + ''', ''' + 
       CONVERT(VARCHAR(10), EndDate, 121) + ''', ''' + 
       CONVERT(VARCHAR(23), CreatedAt, 121) + ''', ''' + 
       CONVERT(VARCHAR(23), UpdatedAt, 121) + ''', ' + 
       CAST(CAST(IsActive AS INT) AS VARCHAR(1)) + ');'
FROM Budgets;

-- UserSettings
PRINT '2.5. Xuất dữ liệu bảng UserSettings...';
SELECT 'INSERT INTO UserSettings (SettingID, UserID, SettingKey, SettingValue, CreatedAt, UpdatedAt) VALUES (' +
       CAST(SettingID AS VARCHAR(10)) + ', ' + 
       CAST(UserID AS VARCHAR(10)) + ', ''' + 
       SettingKey + ''', ''' + 
       ISNULL(SettingValue, '') + ''', ''' + 
       CONVERT(VARCHAR(23), CreatedAt, 121) + ''', ''' + 
       CONVERT(VARCHAR(23), UpdatedAt, 121) + ''');'
FROM UserSettings;

-- Notifications
PRINT '2.6. Xuất dữ liệu bảng Notifications...';
SELECT 'INSERT INTO Notifications (NotificationID, UserID, Title, Message, Type, IsRead, CreatedAt, ReadAt) VALUES (' +
       CAST(NotificationID AS VARCHAR(10)) + ', ' + 
       CAST(UserID AS VARCHAR(10)) + ', ''' + 
       Title + ''', ''' + 
       Message + ''', ''' + 
       Type + ''', ' + 
       CAST(CAST(IsRead AS INT) AS VARCHAR(1)) + ', ''' + 
       CONVERT(VARCHAR(23), CreatedAt, 121) + ''', ' + 
       CASE WHEN ReadAt IS NULL THEN 'NULL' ELSE '''' + CONVERT(VARCHAR(23), ReadAt, 121) + '''' END + ');'
FROM Notifications;

-- ========================================
-- 3. XUẤT STORED PROCEDURES
-- ========================================

PRINT '';
PRINT '3. XUẤT STORED PROCEDURES...';

-- Lấy định nghĩa tất cả stored procedures
SELECT 
    'CREATE PROCEDURE [' + ROUTINE_SCHEMA + '].[' + ROUTINE_NAME + ']' + CHAR(13) +
    ROUTINE_DEFINITION + CHAR(13) + 'GO' + CHAR(13)
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_SCHEMA = 'dbo';

-- ========================================
-- 4. XUẤT FUNCTIONS
-- ========================================

PRINT '';
PRINT '4. XUẤT FUNCTIONS...';

-- Lấy định nghĩa tất cả functions
SELECT 
    'CREATE FUNCTION [' + ROUTINE_SCHEMA + '].[' + ROUTINE_NAME + ']' + CHAR(13) +
    ROUTINE_DEFINITION + CHAR(13) + 'GO' + CHAR(13)
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'FUNCTION' AND ROUTINE_SCHEMA = 'dbo';

-- ========================================
-- 5. XUẤT TRIGGERS
-- ========================================

PRINT '';
PRINT '5. XUẤT TRIGGERS...';

-- Lấy định nghĩa tất cả triggers
SELECT 
    'CREATE TRIGGER [' + s.name + '].[' + tr.name + '] ON [' + s.name + '].[' + t.name + ']' + CHAR(13) +
    'FOR INSERT, UPDATE' + CHAR(13) +
    'AS' + CHAR(13) +
    'BEGIN' + CHAR(13) +
    '    UPDATE ' + t.name + CHAR(13) +
    '    SET UpdatedAt = GETDATE()' + CHAR(13) +
    '    FROM ' + t.name + ' INNER JOIN inserted i ON ' + t.name + '.ID = i.ID' + CHAR(13) +
    'END' + CHAR(13) + 'GO' + CHAR(13)
FROM sys.triggers tr
INNER JOIN sys.tables t ON tr.parent_id = t.object_id
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE s.name = 'dbo';

-- ========================================
-- 6. XUẤT INDEXES
-- ========================================

PRINT '';
PRINT '6. XUẤT INDEXES...';

-- Lấy định nghĩa tất cả indexes
SELECT 
    'CREATE ' + 
    CASE WHEN i.is_unique = 1 THEN 'UNIQUE ' ELSE '' END +
    'INDEX [' + i.name + '] ON [' + s.name + '].[' + t.name + '] (' +
    STUFF((
        SELECT ', [' + c.name + ']' + 
               CASE WHEN ic.is_descending_key = 1 THEN ' DESC' ELSE ' ASC' END
        FROM sys.index_columns ic
        INNER JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
        WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
        ORDER BY ic.key_ordinal
        FOR XML PATH('')
    ), 1, 2, '') + ');'
FROM sys.indexes i
INNER JOIN sys.tables t ON i.object_id = t.object_id
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE i.type > 0 AND i.is_primary_key = 0 AND i.is_unique_constraint = 0
AND s.name = 'dbo';

PRINT '';
PRINT '========================================';
PRINT '    XUẤT DATABASE HOÀN THÀNH!';
PRINT '========================================';
GO
