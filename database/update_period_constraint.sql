-- =============================================
-- CẬP NHẬT PERIOD CONSTRAINT - THÊM DAILY VÀ WEEKLY
-- =============================================

USE PersonalFinanceDB;
GO

PRINT '🔄 Updating Period constraint to include daily and weekly...';

-- Bước 1: Tìm tên constraint hiện tại
DECLARE @ConstraintName NVARCHAR(255);
SELECT @ConstraintName = name 
FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID('Budgets')
    AND definition LIKE '%Period%';

PRINT '📋 Current constraint name: ' + ISNULL(@ConstraintName, 'NOT FOUND');

-- Bước 2: Drop constraint cũ nếu tồn tại
IF @ConstraintName IS NOT NULL
BEGIN
    DECLARE @DropSQL NVARCHAR(500);
    SET @DropSQL = 'ALTER TABLE Budgets DROP CONSTRAINT [' + @ConstraintName + ']';
    PRINT '🗑️ Dropping old constraint: ' + @DropSQL;
    EXEC sp_executesql @DropSQL;
    PRINT '✅ Old constraint dropped successfully';
END

-- Bước 3: Tạo constraint mới với daily và weekly
PRINT '➕ Adding new constraint with daily, weekly, monthly, quarterly, yearly...';
ALTER TABLE Budgets 
ADD CONSTRAINT CK_Budgets_Period 
CHECK (Period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly'));

PRINT '✅ New Period constraint created successfully!';

-- Bước 4: Kiểm tra constraint mới
PRINT '🔍 Verifying new constraint...';
SELECT 
    name as ConstraintName,
    definition as ConstraintDefinition
FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID('Budgets')
    AND name = 'CK_Budgets_Period';

PRINT '🎉 Period constraint update completed!';
PRINT '📝 Allowed values: daily, weekly, monthly, quarterly, yearly';
