-- =============================================
-- TẠO BẢNG CHO HỆ THỐNG CÀI ĐẶT VÀ SAO LƯU
-- =============================================

USE PersonalFinanceDB;
GO

PRINT '🔧 Creating Settings and Backup tables...';

-- Bảng UserSettings - Lưu cài đặt người dùng
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserSettings')
BEGIN
    CREATE TABLE UserSettings (
        SettingID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserID UNIQUEIDENTIFIER NOT NULL,
        SettingKey NVARCHAR(100) NOT NULL,
        SettingValue NVARCHAR(MAX) NOT NULL,
        SettingType NVARCHAR(20) NOT NULL DEFAULT 'string', -- string, boolean, number, json
        Category NVARCHAR(50) NOT NULL, -- general, notifications, privacy, backup, appearance
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
        
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
        UNIQUE (UserID, SettingKey)
    );
    
    PRINT '✅ UserSettings table created';
END
ELSE
BEGIN
    PRINT '⚠️ UserSettings table already exists';
END

-- Bảng BackupHistory - Lịch sử sao lưu
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BackupHistory')
BEGIN
    CREATE TABLE BackupHistory (
        BackupID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserID UNIQUEIDENTIFIER NOT NULL,
        BackupType NVARCHAR(20) NOT NULL, -- manual, automatic
        BackupSize BIGINT NULL, -- Size in bytes
        Status NVARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, completed, failed
        ErrorMessage NVARCHAR(MAX) NULL,
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        CompletedAt DATETIME2 NULL,
        
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    );
    
    PRINT '✅ BackupHistory table created';
END
ELSE
BEGIN
    PRINT '⚠️ BackupHistory table already exists';
END

-- Bảng Notifications - Thông báo hệ thống
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
BEGIN
    CREATE TABLE Notifications (
        NotificationID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        UserID UNIQUEIDENTIFIER NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Message NVARCHAR(MAX) NOT NULL,
        Type NVARCHAR(50) NOT NULL, -- budget_warning, achievement, report, system, reminder
        Priority NVARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
        IsRead BIT DEFAULT 0,
        IsArchived BIT DEFAULT 0,
        ActionUrl NVARCHAR(500) NULL, -- URL để điều hướng khi click
        ExpiresAt DATETIME2 NULL, -- Thời gian hết hạn
        CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
        ReadAt DATETIME2 NULL,
        
        FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
    );
    
    PRINT '✅ Notifications table created';
END
ELSE
BEGIN
    PRINT '⚠️ Notifications table already exists';
END

-- Tạo indexes cho hiệu suất
PRINT '📊 Creating indexes...';

-- Index cho UserSettings
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_UserSettings_UserID_Category')
BEGIN
    CREATE INDEX IX_UserSettings_UserID_Category ON UserSettings(UserID, Category);
    PRINT '✅ Index IX_UserSettings_UserID_Category created';
END

-- Index cho BackupHistory
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_BackupHistory_UserID_CreatedAt')
BEGIN
    CREATE INDEX IX_BackupHistory_UserID_CreatedAt ON BackupHistory(UserID, CreatedAt DESC);
    PRINT '✅ Index IX_BackupHistory_UserID_CreatedAt created';
END

-- Index cho Notifications
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Notifications_UserID_IsRead_CreatedAt')
BEGIN
    CREATE INDEX IX_Notifications_UserID_IsRead_CreatedAt ON Notifications(UserID, IsRead, CreatedAt DESC);
    PRINT '✅ Index IX_Notifications_UserID_IsRead_CreatedAt created';
END

-- =============================================
-- TẠO STORED PROCEDURES
-- =============================================

PRINT '🔧 Creating stored procedures...';

-- Stored Procedure: Lấy cài đặt người dùng
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetUserSettings')
    DROP PROCEDURE sp_GetUserSettings;
GO

CREATE PROCEDURE sp_GetUserSettings
    @userId UNIQUEIDENTIFIER,
    @category NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        SettingID,
        SettingKey,
        SettingValue,
        SettingType,
        Category,
        CreatedAt,
        UpdatedAt
    FROM UserSettings
    WHERE UserID = @userId
        AND (@category IS NULL OR Category = @category)
    ORDER BY Category, SettingKey;
END
GO

PRINT '✅ sp_GetUserSettings created';

-- Stored Procedure: Lấy thông báo người dùng
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetUserNotifications')
    DROP PROCEDURE sp_GetUserNotifications;
GO

CREATE PROCEDURE sp_GetUserNotifications
    @userId UNIQUEIDENTIFIER,
    @isRead BIT = NULL,
    @type NVARCHAR(50) = NULL,
    @limit INT = 50,
    @offset INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        NotificationID,
        Title,
        Message,
        Type,
        Priority,
        IsRead,
        IsArchived,
        ActionUrl,
        ExpiresAt,
        CreatedAt,
        ReadAt,
        -- Tính toán thời gian tương đối
        CASE 
            WHEN DATEDIFF(MINUTE, CreatedAt, GETUTCDATE()) < 60 
                THEN CAST(DATEDIFF(MINUTE, CreatedAt, GETUTCDATE()) AS NVARCHAR) + N' phút trước'
            WHEN DATEDIFF(HOUR, CreatedAt, GETUTCDATE()) < 24 
                THEN CAST(DATEDIFF(HOUR, CreatedAt, GETUTCDATE()) AS NVARCHAR) + N' giờ trước'
            WHEN DATEDIFF(DAY, CreatedAt, GETUTCDATE()) < 7 
                THEN CAST(DATEDIFF(DAY, CreatedAt, GETUTCDATE()) AS NVARCHAR) + N' ngày trước'
            ELSE FORMAT(CreatedAt, 'dd/MM/yyyy HH:mm')
        END as TimeAgo
    FROM Notifications
    WHERE UserID = @userId
        AND (@isRead IS NULL OR IsRead = @isRead)
        AND (@type IS NULL OR Type = @type)
        AND IsArchived = 0
        AND (ExpiresAt IS NULL OR ExpiresAt > GETUTCDATE())
    ORDER BY 
        CASE Priority 
            WHEN 'urgent' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
        END,
        CreatedAt DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY;
END
GO

PRINT '✅ sp_GetUserNotifications created';

-- Stored Procedure: Tạo thông báo mới
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateNotification')
    DROP PROCEDURE sp_CreateNotification;
GO

CREATE PROCEDURE sp_CreateNotification
    @userId UNIQUEIDENTIFIER,
    @title NVARCHAR(200),
    @message NVARCHAR(MAX),
    @type NVARCHAR(50),
    @priority NVARCHAR(20) = 'medium',
    @actionUrl NVARCHAR(500) = NULL,
    @expiresAt DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @notificationId UNIQUEIDENTIFIER = NEWID();
    
    INSERT INTO Notifications (
        NotificationID, UserID, Title, Message, Type, Priority, ActionUrl, ExpiresAt
    ) VALUES (
        @notificationId, @userId, @title, @message, @type, @priority, @actionUrl, @expiresAt
    );
    
    SELECT @notificationId as NotificationID;
END
GO

PRINT '✅ sp_CreateNotification created';

-- =============================================
-- CHÈN DỮ LIỆU MẶC ĐỊNH
-- =============================================

PRINT '📝 Inserting default settings...';

-- Lấy user đầu tiên để test (nếu có)
DECLARE @testUserId UNIQUEIDENTIFIER;
SELECT TOP 1 @testUserId = UserID FROM Users;

IF @testUserId IS NOT NULL
BEGIN
    -- Cài đặt giao diện mặc định
    INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category)
    SELECT @testUserId, 'theme', 'light', 'string', 'appearance'
    WHERE NOT EXISTS (SELECT 1 FROM UserSettings WHERE UserID = @testUserId AND SettingKey = 'theme');
    
    INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category)
    SELECT @testUserId, 'language', 'vi', 'string', 'appearance'
    WHERE NOT EXISTS (SELECT 1 FROM UserSettings WHERE UserID = @testUserId AND SettingKey = 'language');
    
    INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category)
    SELECT @testUserId, 'currency', 'VND', 'string', 'appearance'
    WHERE NOT EXISTS (SELECT 1 FROM UserSettings WHERE UserID = @testUserId AND SettingKey = 'currency');
    
    -- Cài đặt thông báo mặc định
    INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category)
    SELECT @testUserId, 'push', 'true', 'boolean', 'notifications'
    WHERE NOT EXISTS (SELECT 1 FROM UserSettings WHERE UserID = @testUserId AND SettingKey = 'push');
    
    INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category)
    SELECT @testUserId, 'email', 'true', 'boolean', 'notifications'
    WHERE NOT EXISTS (SELECT 1 FROM UserSettings WHERE UserID = @testUserId AND SettingKey = 'email');
    
    INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category)
    SELECT @testUserId, 'budget', 'true', 'boolean', 'notifications'
    WHERE NOT EXISTS (SELECT 1 FROM UserSettings WHERE UserID = @testUserId AND SettingKey = 'budget');
    
    -- Tạo một số thông báo demo
    INSERT INTO Notifications (UserID, Title, Message, Type, Priority)
    SELECT @testUserId, N'Chào mừng bạn đến với ứng dụng!', N'Cảm ơn bạn đã sử dụng ứng dụng quản lý tài chính. Hãy bắt đầu bằng việc thêm giao dịch đầu tiên.', 'system', 'medium'
    WHERE NOT EXISTS (SELECT 1 FROM Notifications WHERE UserID = @testUserId AND Type = 'system');
    
    INSERT INTO Notifications (UserID, Title, Message, Type, Priority, ActionUrl)
    SELECT @testUserId, N'Thiết lập ngân sách', N'Bạn chưa có ngân sách nào. Hãy tạo ngân sách để theo dõi chi tiêu hiệu quả hơn.', 'reminder', 'high', '/budget'
    WHERE NOT EXISTS (SELECT 1 FROM Notifications WHERE UserID = @testUserId AND Type = 'reminder');
    
    PRINT '✅ Default settings and notifications inserted for test user';
END
ELSE
BEGIN
    PRINT '⚠️ No users found, skipping default data insertion';
END

PRINT '🎉 Settings and Backup system setup completed!';
PRINT '';
PRINT '📋 Summary:';
PRINT '   - UserSettings table: ✅';
PRINT '   - BackupHistory table: ✅';
PRINT '   - Notifications table: ✅';
PRINT '   - Stored procedures: ✅';
PRINT '   - Default data: ✅';
PRINT '';
PRINT '🚀 Ready to use Settings and Notifications features!';
