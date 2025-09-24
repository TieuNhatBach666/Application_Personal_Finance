-- Kiểm tra signature của stored procedure hiện tại
USE PersonalFinanceDB;
GO

PRINT '🔍 KIỂM TRA STORED PROCEDURE SIGNATURE';
PRINT '======================================';

-- 1. Kiểm tra procedure có tồn tại không
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
BEGIN
    PRINT '✅ Procedure sp_UpdateBudgetSpentAmount tồn tại';
    
    -- 2. Hiển thị parameters của procedure
    PRINT '';
    PRINT 'Parameters của procedure:';
    SELECT 
        par.parameter_id as [Thứ tự],
        par.name as [Tên Parameter],
        t.name as [Kiểu dữ liệu],
        par.max_length as [Độ dài],
        CASE WHEN par.is_output = 1 THEN 'OUTPUT' ELSE 'INPUT' END as [Loại]
    FROM sys.procedures p
    INNER JOIN sys.parameters par ON p.object_id = par.object_id
    INNER JOIN sys.types t ON par.user_type_id = t.user_type_id
    WHERE p.name = 'sp_UpdateBudgetSpentAmount'
    ORDER BY par.parameter_id;
    
    -- 3. Hiển thị definition của procedure
    PRINT '';
    PRINT 'Definition của procedure:';
    SELECT OBJECT_DEFINITION(OBJECT_ID('sp_UpdateBudgetSpentAmount')) as [Procedure Definition];
    
END
ELSE
BEGIN
    PRINT '❌ Procedure sp_UpdateBudgetSpentAmount KHÔNG tồn tại';
END

-- 4. Kiểm tra tất cả procedures có liên quan đến Budget
PRINT '';
PRINT 'Tất cả procedures liên quan đến Budget:';
SELECT 
    name as [Procedure Name],
    create_date as [Ngày tạo],
    modify_date as [Ngày sửa]
FROM sys.procedures 
WHERE name LIKE '%Budget%' OR name LIKE '%budget%'
ORDER BY name;

-- 5. Hiển thị cách gọi procedure đúng
PRINT '';
PRINT '📋 CÁCH GỌI PROCEDURE ĐÚNG:';
PRINT 'EXEC sp_UpdateBudgetSpentAmount @userId = ''USER_ID_HERE'', @categoryId = ''CATEGORY_ID_HERE'';';
PRINT '';
PRINT 'VÍ DỤ:';
PRINT 'DECLARE @testUserId UNIQUEIDENTIFIER = (SELECT TOP 1 UserID FROM Budgets WHERE IsActive = 1);';
PRINT 'DECLARE @testCategoryId UNIQUEIDENTIFIER = (SELECT TOP 1 CategoryID FROM Budgets WHERE CategoryID IS NOT NULL AND IsActive = 1);';
PRINT 'EXEC sp_UpdateBudgetSpentAmount @testUserId, @testCategoryId;';
