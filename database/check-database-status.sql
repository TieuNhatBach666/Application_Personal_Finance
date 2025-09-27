-- Kiểm tra trạng thái database PersonalFinanceDB
USE master;
GO

-- Kiểm tra database có tồn tại không
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'PersonalFinanceDB')
BEGIN
    PRINT '✅ Database PersonalFinanceDB tồn tại';
    
    USE PersonalFinanceDB;
    
    -- Kiểm tra các bảng có tồn tại không
    PRINT '';
    PRINT '📊 DANH SÁCH CÁC BẢNG HIỆN TẠI:';
    
    SELECT 
        TABLE_NAME as 'Tên Bảng',
        TABLE_TYPE as 'Loại'
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE'
    ORDER BY TABLE_NAME;
    
    -- Đếm số lượng bảng
    DECLARE @TableCount INT;
    SELECT @TableCount = COUNT(*)
    FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE = 'BASE TABLE';
    
    PRINT '';
    PRINT 'Tổng số bảng: ' + CAST(@TableCount AS NVARCHAR(10));
    
    -- Kiểm tra từng bảng cụ thể
    IF OBJECT_ID('Users', 'U') IS NOT NULL
        PRINT '✅ Bảng Users tồn tại'
    ELSE
        PRINT '❌ Bảng Users KHÔNG tồn tại';
        
    IF OBJECT_ID('Categories', 'U') IS NOT NULL
        PRINT '✅ Bảng Categories tồn tại'
    ELSE
        PRINT '❌ Bảng Categories KHÔNG tồn tại';
        
    IF OBJECT_ID('Transactions', 'U') IS NOT NULL
        PRINT '✅ Bảng Transactions tồn tại'
    ELSE
        PRINT '❌ Bảng Transactions KHÔNG tồn tại';
        
    IF OBJECT_ID('Budgets', 'U') IS NOT NULL
        PRINT '✅ Bảng Budgets tồn tại'
    ELSE
        PRINT '❌ Bảng Budgets KHÔNG tồn tại';
        
    IF OBJECT_ID('UserSettings', 'U') IS NOT NULL
        PRINT '✅ Bảng UserSettings tồn tại'
    ELSE
        PRINT '❌ Bảng UserSettings KHÔNG tồn tại';
        
    IF OBJECT_ID('Notifications', 'U') IS NOT NULL
        PRINT '✅ Bảng Notifications tồn tại'
    ELSE
        PRINT '❌ Bảng Notifications KHÔNG tồn tại';
END
ELSE
BEGIN
    PRINT '❌ Database PersonalFinanceDB KHÔNG tồn tại';
    PRINT '';
    PRINT '🔧 HƯỚNG DẪN KHẮC PHỤC:';
    PRINT '1. Mở SQL Server Management Studio (SSMS)';
    PRINT '2. Kết nối đến server: TIEUNHATBACH666\TIEUNHATBACH';
    PRINT '3. Mở file create-database.sql';
    PRINT '4. Chạy script để tạo database và các bảng';
END

PRINT '';
PRINT '🔍 KIỂM TRA HOÀN TẤT!';