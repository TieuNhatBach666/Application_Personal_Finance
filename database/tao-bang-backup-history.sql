-- =============================================
-- Script: Tạo Bảng BackupHistory
-- Mô tả: Tạo bảng BackupHistory nếu chưa tồn tại
-- Tác giả: Tiểu Nhất Bạch
-- Ngày tạo: 2025-09-27
-- =============================================

USE PersonalFinanceDB;
GO

PRINT '🔧 Bắt đầu tạo bảng BackupHistory...';

-- Kiểm tra và tạo bảng BackupHistory nếu chưa tồn tại
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'BackupHistory')
BEGIN
    PRINT '📋 Tạo bảng BackupHistory...';
    
    CREATE TABLE BackupHistory (
        BackupID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserID UNIQUEIDENTIFIER NOT NULL,
        BackupType NVARCHAR(20) NOT NULL,
        BackupSize BIGINT NULL,
        Status NVARCHAR(20) NOT NULL DEFAULT 'pending',
        ErrorMessage NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    );
    
    PRINT '✅ Bảng BackupHistory đã được tạo thành công';
    
    -- Tạo index cho hiệu suất
    CREATE INDEX IX_BackupHistory_UserID_CreatedAt ON BackupHistory(UserID, CreatedAt DESC);
    PRINT '✅ Index cho BackupHistory đã được tạo';
    
END
ELSE
BEGIN
    PRINT '⚠️ Bảng BackupHistory đã tồn tại, bỏ qua việc tạo';
END

-- Kiểm tra kết quả
SELECT 
    TABLE_NAME as 'Tên Bảng',
    CASE 
        WHEN TABLE_NAME = 'BackupHistory' THEN '✅ Đã tồn tại'
        ELSE '❌ Chưa tồn tại'
    END as 'Trạng Thái'
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME = 'BackupHistory';

PRINT '🎉 Hoàn thành tạo bảng BackupHistory!';
