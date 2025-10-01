-- ==========================================
-- Fix AvatarURL Column Size
-- Tăng độ dài cột để chứa base64 image
-- ==========================================

USE PersonalFinanceDB;
GO

-- Kiểm tra cột hiện tại
SELECT 
    c.name AS ColumnName,
    t.name AS DataType,
    c.max_length AS MaxLength,
    CASE 
        WHEN c.max_length = -1 THEN 'MAX'
        ELSE CAST(c.max_length AS VARCHAR(10))
    END AS DisplayLength
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('Users')
  AND c.name = 'AvatarURL';

PRINT '📊 Cột AvatarURL hiện tại:';
GO

-- Tăng kích thước cột lên VARCHAR(MAX) hoặc NVARCHAR(MAX)
ALTER TABLE Users
ALTER COLUMN AvatarURL NVARCHAR(MAX) NULL;

PRINT '✅ Đã tăng kích thước cột AvatarURL lên NVARCHAR(MAX)';
GO

-- Kiểm tra sau khi update
SELECT 
    c.name AS ColumnName,
    t.name AS DataType,
    CASE 
        WHEN c.max_length = -1 THEN 'MAX'
        ELSE CAST(c.max_length AS VARCHAR(10))
    END AS DisplayLength
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
WHERE c.object_id = OBJECT_ID('Users')
  AND c.name = 'AvatarURL';

PRINT '📊 Cột AvatarURL sau khi fix:';
GO
