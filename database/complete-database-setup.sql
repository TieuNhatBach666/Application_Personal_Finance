-- =============================================
-- PERSONAL FINANCE MANAGER - COMPLETE DATABASE SETUP
-- Tác giả: Tiểu Nhất Bạch
-- Mô tả: File SQL tổng hợp để thiết lập hoàn chỉnh database
-- =============================================

-- Cấu hình kết nối:
-- Server: TIEUNHATBACH\TIEUNHATBACH
-- Login: sa / Password: 123456
-- Database: PersonalFinanceDB

USE master;
GO

PRINT '🚀 Bắt đầu thiết lập Personal Finance Manager Database...';
PRINT '📅 Thời gian: ' + CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '👤 Tác giả: Tiểu Nhất Bạch';
PRINT '';

-- =============================================
-- BƯỚC 1: TẠO DATABASE
-- =============================================

PRINT '📊 BƯỚC 1: Tạo Database...';

-- Tạo database nếu chưa tồn tại
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PersonalFinanceDB')
BEGIN
    CREATE DATABASE PersonalFinanceDB;
    PRINT '✅ Database PersonalFinanceDB đã được tạo';
END
ELSE
BEGIN
    PRINT '⚠️ Database PersonalFinanceDB đã tồn tại';
END
GO

USE PersonalFinanceDB;
GO

-- =============================================
-- BƯỚC 2: XÓA CÁC BẢNG CŨ (NẾU CÓ)
-- =============================================

PRINT '🗑️ BƯỚC 2: Xóa các bảng cũ để thiết lập lại...';

-- Xóa theo thứ tự để tránh lỗi foreign key
IF OBJECT_ID('RecurringTransactionHistory', 'U') IS NOT NULL DROP TABLE RecurringTransactionHistory;
IF OBJECT_ID('RecurringTransactions', 'U') IS NOT NULL DROP TABLE RecurringTransactions;
IF OBJECT_ID('BackupHistory', 'U') IS NOT NULL DROP TABLE BackupHistory;
IF OBJECT_ID('Notifications', 'U') IS NOT NULL DROP TABLE Notifications;
IF OBJECT_ID('UserSettings', 'U') IS NOT NULL DROP TABLE UserSettings;
IF OBJECT_ID('Budgets', 'U') IS NOT NULL DROP TABLE Budgets;
IF OBJECT_ID('Transactions', 'U') IS NOT NULL DROP TABLE Transactions;
IF OBJECT_ID('Categories', 'U') IS NOT NULL DROP TABLE Categories;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;

-- Xóa các views và functions cũ
IF OBJECT_ID('vw_TransactionSummary', 'V') IS NOT NULL DROP VIEW vw_TransactionSummary;
IF OBJECT_ID('fn_GetBudgetProgress', 'TF') IS NOT NULL DROP FUNCTION fn_GetBudgetProgress;

-- Xóa các stored procedures cũ
IF OBJECT_ID('sp_CreateDefaultCategoriesForUser', 'P') IS NOT NULL DROP PROCEDURE sp_CreateDefaultCategoriesForUser;
IF OBJECT_ID('sp_ProcessRecurringTransactions', 'P') IS NOT NULL DROP PROCEDURE sp_ProcessRecurringTransactions;
IF OBJECT_ID('sp_DailyRecurringTransactionJob', 'P') IS NOT NULL DROP PROCEDURE sp_DailyRecurringTransactionJob;
IF OBJECT_ID('sp_GetUserSettings', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserSettings;
IF OBJECT_ID('sp_GetUserNotifications', 'P') IS NOT NULL DROP PROCEDURE sp_GetUserNotifications;
IF OBJECT_ID('sp_CreateNotification', 'P') IS NOT NULL DROP PROCEDURE sp_CreateNotification;

PRINT '✅ Đã xóa các bảng và objects cũ';

-- =============================================
-- BƯỚC 3: TẠO CÁC BẢNG CHÍNH
-- =============================================

PRINT '🏗️ BƯỚC 3: Tạo các bảng chính...';

-- Bảng Users - Người dùng
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(255) NOT NULL,
    PhoneNumber NVARCHAR(20),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);
PRINT '✅ Bảng Users đã được tạo';

-- Bảng Categories - Danh mục thu chi
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    CategoryName NVARCHAR(100) NOT NULL,
    CategoryType NVARCHAR(20) CHECK (CategoryType IN ('Income', 'Expense')) NOT NULL,
    IconName NVARCHAR(50) DEFAULT 'default',
    ColorCode NVARCHAR(7) DEFAULT '#3498db',
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);
PRINT '✅ Bảng Categories đã được tạo';

-- Bảng Transactions - Giao dịch
CREATE TABLE Transactions (
    TransactionID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
    Amount DECIMAL(15,2) NOT NULL,
    TransactionType NVARCHAR(20) CHECK (TransactionType IN ('Income', 'Expense')) NOT NULL,
    TransactionDate DATE NOT NULL,
    Description NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);
PRINT '✅ Bảng Transactions đã được tạo';

-- Bảng Budgets - Ngân sách
CREATE TABLE Budgets (
    BudgetID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
    BudgetAmount DECIMAL(15,2) NOT NULL,
    Period NVARCHAR(20) CHECK (Period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) NOT NULL DEFAULT 'monthly',
    BudgetMonth INT NOT NULL CHECK (BudgetMonth BETWEEN 1 AND 12),
    BudgetYear INT NOT NULL CHECK (BudgetYear >= 2020),
    WarningThreshold DECIMAL(5,2) DEFAULT 70.00 CHECK (WarningThreshold BETWEEN 0 AND 100),
    SpentAmount DECIMAL(15,2) DEFAULT 0.00,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    UNIQUE(UserID, CategoryID, BudgetMonth, BudgetYear)
);
PRINT '✅ Bảng Budgets đã được tạo';

-- Bảng UserSettings - Cài đặt người dùng
CREATE TABLE UserSettings (
    SettingID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    SettingKey NVARCHAR(100) NOT NULL,
    SettingValue NVARCHAR(MAX) NOT NULL,
    SettingType NVARCHAR(20) NOT NULL DEFAULT 'string',
    Category NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    UNIQUE(UserID, SettingKey)
);
PRINT '✅ Bảng UserSettings đã được tạo';

-- Bảng Notifications - Thông báo
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Priority NVARCHAR(20) NOT NULL DEFAULT 'medium',
    IsRead BIT DEFAULT 0,
    IsArchived BIT DEFAULT 0,
    ActionUrl NVARCHAR(500) NULL,
    ExpiresAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    ReadAt DATETIME2 NULL
);
PRINT '✅ Bảng Notifications đã được tạo';

-- Bảng BackupHistory - Lịch sử sao lưu
CREATE TABLE BackupHistory (
    BackupID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    BackupType NVARCHAR(20) NOT NULL,
    BackupSize BIGINT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'pending',
    ErrorMessage NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CompletedAt DATETIME2 NULL
);
PRINT '✅ Bảng BackupHistory đã được tạo';

-- =============================================
-- BƯỚC 4: TẠO INDEXES CHO HIỆU SUẤT
-- =============================================

PRINT '📊 BƯỚC 4: Tạo indexes cho hiệu suất...';

-- Indexes cho bảng Transactions
CREATE INDEX IX_Transactions_UserID_Date ON Transactions(UserID, TransactionDate DESC);
CREATE INDEX IX_Transactions_CategoryID ON Transactions(CategoryID);
PRINT '✅ Indexes cho Transactions đã được tạo';

-- Indexes cho bảng Categories
CREATE INDEX IX_Categories_UserID_Type ON Categories(UserID, CategoryType);
PRINT '✅ Indexes cho Categories đã được tạo';

-- Indexes cho bảng Budgets
CREATE INDEX IX_Budgets_UserID_Month_Year ON Budgets(UserID, BudgetMonth, BudgetYear);
PRINT '✅ Indexes cho Budgets đã được tạo';

-- Indexes cho bảng UserSettings
CREATE INDEX IX_UserSettings_UserID_Key ON UserSettings(UserID, SettingKey);
CREATE INDEX IX_UserSettings_UserID_Category ON UserSettings(UserID, Category);
PRINT '✅ Indexes cho UserSettings đã được tạo';

-- Indexes cho bảng Notifications
CREATE INDEX IX_Notifications_UserID_Read ON Notifications(UserID, IsRead);
CREATE INDEX IX_Notifications_UserID_IsRead_CreatedAt ON Notifications(UserID, IsRead, CreatedAt DESC);
PRINT '✅ Indexes cho Notifications đã được tạo';

-- Indexes cho bảng BackupHistory
CREATE INDEX IX_BackupHistory_UserID_CreatedAt ON BackupHistory(UserID, CreatedAt DESC);
PRINT '✅ Indexes cho BackupHistory đã được tạo';

-- =============================================
-- BƯỚC 5: CHÈN DỮ LIỆU MẶC ĐỊNH
-- =============================================

PRINT '📝 BƯỚC 5: Chèn dữ liệu mặc định...';

-- Chèn default categories (UserID = NULL để làm template)
INSERT INTO Categories (UserID, CategoryName, CategoryType, IconName, ColorCode) VALUES
-- Categories Thu nhập
(NULL, N'Lương', 'Income', 'salary', '#27ae60'),
(NULL, N'Thưởng', 'Income', 'bonus', '#f39c12'),
(NULL, N'Phụ cấp', 'Income', 'allowance', '#3498db'),
(NULL, N'Đầu tư', 'Income', 'investment', '#9b59b6'),
(NULL, N'Kinh doanh', 'Income', 'business', '#e67e22'),
(NULL, N'Thu nhập khác', 'Income', 'other', '#95a5a6'),
-- Categories Chi tiêu
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

PRINT '✅ Đã chèn ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' default categories';

-- =============================================
-- BƯỚC 6: TẠO STORED PROCEDURES
-- =============================================

PRINT '🔧 BƯỚC 6: Tạo stored procedures...';
GO

-- Stored Procedure: Tạo default categories cho user mới
CREATE PROCEDURE sp_CreateDefaultCategoriesForUser
    @UserID INT
AS
BEGIN
    SET NOCOUNT ON;

    -- Sao chép default categories (UserID = NULL) cho user mới
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
    PRINT 'Đã tạo default categories cho UserID: ' + CAST(@UserID AS NVARCHAR(10));
END
GO

PRINT '✅ sp_CreateDefaultCategoriesForUser đã được tạo';

-- Stored Procedure: Lấy cài đặt người dùng
CREATE PROCEDURE sp_GetUserSettings
    @userId INT,
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

PRINT '✅ sp_GetUserSettings đã được tạo';

-- Stored Procedure: Lấy thông báo người dùng
CREATE PROCEDURE sp_GetUserNotifications
    @userId INT,
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
            WHEN DATEDIFF(MINUTE, CreatedAt, GETDATE()) < 60
                THEN CAST(DATEDIFF(MINUTE, CreatedAt, GETDATE()) AS NVARCHAR) + N' phút trước'
            WHEN DATEDIFF(HOUR, CreatedAt, GETDATE()) < 24
                THEN CAST(DATEDIFF(HOUR, CreatedAt, GETDATE()) AS NVARCHAR) + N' giờ trước'
            WHEN DATEDIFF(DAY, CreatedAt, GETDATE()) < 7
                THEN CAST(DATEDIFF(DAY, CreatedAt, GETDATE()) AS NVARCHAR) + N' ngày trước'
            ELSE FORMAT(CreatedAt, 'dd/MM/yyyy HH:mm')
        END as TimeAgo
    FROM Notifications
    WHERE UserID = @userId
        AND (@isRead IS NULL OR IsRead = @isRead)
        AND (@type IS NULL OR Type = @type)
        AND IsArchived = 0
        AND (ExpiresAt IS NULL OR ExpiresAt > GETDATE())
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

PRINT '✅ sp_GetUserNotifications đã được tạo';

-- Stored Procedure: Tạo thông báo mới
CREATE PROCEDURE sp_CreateNotification
    @userId INT,
    @title NVARCHAR(200),
    @message NVARCHAR(MAX),
    @type NVARCHAR(50),
    @priority NVARCHAR(20) = 'medium',
    @actionUrl NVARCHAR(500) = NULL,
    @expiresAt DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @notificationId INT;

    INSERT INTO Notifications (
        UserID, Title, Message, Type, Priority, ActionUrl, ExpiresAt
    ) VALUES (
        @userId, @title, @message, @type, @priority, @actionUrl, @expiresAt
    );

    SET @notificationId = SCOPE_IDENTITY();
    SELECT @notificationId as NotificationID;
END
GO

PRINT '✅ sp_CreateNotification đã được tạo';

-- =============================================
-- BƯỚC 7: TẠO VIEWS VÀ FUNCTIONS
-- =============================================

PRINT '📊 BƯỚC 7: Tạo views và functions...';

-- Function: Tính toán tiến độ ngân sách
CREATE FUNCTION fn_GetBudgetProgress(@BudgetID INT)
RETURNS TABLE
AS
RETURN
(
    SELECT
        b.BudgetID,
        b.BudgetAmount,
        ISNULL(SUM(t.Amount), 0) as SpentAmount,
        CASE
            WHEN b.BudgetAmount > 0
            THEN ROUND((ISNULL(SUM(t.Amount), 0) / b.BudgetAmount) * 100, 2)
            ELSE 0
        END as PercentageUsed,
        CASE
            WHEN ISNULL(SUM(t.Amount), 0) >= b.BudgetAmount THEN N'Vượt ngân sách'
            WHEN (ISNULL(SUM(t.Amount), 0) / b.BudgetAmount) * 100 >= 90 THEN N'Nguy hiểm'
            WHEN (ISNULL(SUM(t.Amount), 0) / b.BudgetAmount) * 100 >= b.WarningThreshold THEN N'Cảnh báo'
            ELSE N'Bình thường'
        END as Status
    FROM Budgets b
    LEFT JOIN Transactions t ON b.CategoryID = t.CategoryID
        AND b.UserID = t.UserID
        AND MONTH(t.TransactionDate) = b.BudgetMonth
        AND YEAR(t.TransactionDate) = b.BudgetYear
        AND t.TransactionType = 'Expense'
    WHERE b.BudgetID = @BudgetID
    GROUP BY b.BudgetID, b.BudgetAmount, b.WarningThreshold
);
GO

PRINT '✅ fn_GetBudgetProgress đã được tạo';

-- View: Tóm tắt giao dịch
CREATE VIEW vw_TransactionSummary AS
SELECT
    t.UserID,
    YEAR(t.TransactionDate) as Year,
    MONTH(t.TransactionDate) as Month,
    t.TransactionType,
    c.CategoryName,
    c.ColorCode,
    COUNT(*) as TransactionCount,
    SUM(t.Amount) as TotalAmount,
    AVG(t.Amount) as AverageAmount
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
GROUP BY t.UserID, YEAR(t.TransactionDate), MONTH(t.TransactionDate),
         t.TransactionType, c.CategoryName, c.ColorCode;
GO

PRINT '✅ vw_TransactionSummary đã được tạo';

-- =============================================
-- BƯỚC 8: TẠO USER DEMO VÀ DỮ LIỆU MẪU
-- =============================================

PRINT '👤 BƯỚC 8: Tạo user demo và dữ liệu mẫu...';

-- Tạo user demo
DECLARE @demoUserId INT;

INSERT INTO Users (Email, PasswordHash, FullName, PhoneNumber) VALUES
(N'demo@example.com', N'$2b$10$demo.hash.for.testing.purposes.only', N'Người dùng Demo', N'0123456789');

SET @demoUserId = SCOPE_IDENTITY();
PRINT '✅ Đã tạo user demo với ID: ' + CAST(@demoUserId AS NVARCHAR);

-- Tạo categories cho user demo
EXEC sp_CreateDefaultCategoriesForUser @demoUserId;

-- Chèn cài đặt mặc định cho user demo
INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category) VALUES
(@demoUserId, 'theme', 'light', 'string', 'appearance'),
(@demoUserId, 'language', 'vi', 'string', 'appearance'),
(@demoUserId, 'currency', 'VND', 'string', 'appearance'),
(@demoUserId, 'push', 'true', 'boolean', 'notifications'),
(@demoUserId, 'email', 'true', 'boolean', 'notifications'),
(@demoUserId, 'budget', 'true', 'boolean', 'notifications');

PRINT '✅ Đã chèn cài đặt mặc định cho user demo';

-- Tạo một số thông báo demo
INSERT INTO Notifications (UserID, Title, Message, Type, Priority) VALUES
(@demoUserId, N'Chào mừng bạn đến với ứng dụng!', N'Cảm ơn bạn đã sử dụng ứng dụng quản lý tài chính. Hãy bắt đầu bằng việc thêm giao dịch đầu tiên.', 'system', 'medium'),
(@demoUserId, N'Thiết lập ngân sách', N'Bạn chưa có ngân sách nào. Hãy tạo ngân sách để theo dõi chi tiêu hiệu quả hơn.', 'reminder', 'high');

PRINT '✅ Đã tạo thông báo demo';

-- Tạo một số giao dịch mẫu
DECLARE @foodCategoryId INT, @salaryCategoryId INT;

SELECT @foodCategoryId = CategoryID FROM Categories WHERE UserID = @demoUserId AND CategoryName = N'Ăn uống';
SELECT @salaryCategoryId = CategoryID FROM Categories WHERE UserID = @demoUserId AND CategoryName = N'Lương';

INSERT INTO Transactions (UserID, CategoryID, Amount, TransactionType, TransactionDate, Description) VALUES
(@demoUserId, @salaryCategoryId, 15000000, 'Income', DATEADD(DAY, -5, GETDATE()), N'Lương tháng 12'),
(@demoUserId, @foodCategoryId, 150000, 'Expense', DATEADD(DAY, -3, GETDATE()), N'Ăn trưa'),
(@demoUserId, @foodCategoryId, 80000, 'Expense', DATEADD(DAY, -2, GETDATE()), N'Cà phê sáng'),
(@demoUserId, @foodCategoryId, 200000, 'Expense', DATEADD(DAY, -1, GETDATE()), N'Ăn tối với gia đình');

PRINT '✅ Đã tạo ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' giao dịch mẫu';

-- Tạo ngân sách mẫu
INSERT INTO Budgets (UserID, CategoryID, BudgetAmount, BudgetMonth, BudgetYear, WarningThreshold) VALUES
(@demoUserId, @foodCategoryId, 2000000, MONTH(GETDATE()), YEAR(GETDATE()), 80.00);

PRINT '✅ Đã tạo ngân sách mẫu';

-- =============================================
-- BƯỚC 9: KIỂM TRA VÀ XÁC NHẬN
-- =============================================

PRINT '🔍 BƯỚC 9: Kiểm tra và xác nhận...';

-- Kiểm tra số lượng bảng đã tạo
SELECT
    TABLE_NAME as 'Tên Bảng',
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = t.TABLE_NAME) as 'Số Cột'
FROM INFORMATION_SCHEMA.TABLES t
WHERE TABLE_TYPE = 'BASE TABLE'
    AND TABLE_NAME IN ('Users', 'Categories', 'Transactions', 'Budgets', 'UserSettings', 'Notifications', 'BackupHistory')
ORDER BY TABLE_NAME;

-- Kiểm tra số lượng dữ liệu
PRINT '';
PRINT '📊 Thống kê dữ liệu:';
PRINT '   - Users: ' + CAST((SELECT COUNT(*) FROM Users) AS NVARCHAR);
PRINT '   - Categories: ' + CAST((SELECT COUNT(*) FROM Categories) AS NVARCHAR);
PRINT '   - Transactions: ' + CAST((SELECT COUNT(*) FROM Transactions) AS NVARCHAR);
PRINT '   - Budgets: ' + CAST((SELECT COUNT(*) FROM Budgets) AS NVARCHAR);
PRINT '   - UserSettings: ' + CAST((SELECT COUNT(*) FROM UserSettings) AS NVARCHAR);
PRINT '   - Notifications: ' + CAST((SELECT COUNT(*) FROM Notifications) AS NVARCHAR);

-- =============================================
-- HOÀN THÀNH
-- =============================================

PRINT '';
PRINT '🎉 THIẾT LẬP DATABASE HOÀN TẤT!';
PRINT '';
PRINT '📋 Tóm tắt:';
PRINT '   ✅ Database: PersonalFinanceDB';
PRINT '   ✅ Bảng chính: 7 bảng';
PRINT '   ✅ Indexes: Đã tối ưu hiệu suất';
PRINT '   ✅ Stored Procedures: 4 procedures';
PRINT '   ✅ Views & Functions: 2 objects';
PRINT '   ✅ Dữ liệu mẫu: User demo + categories + transactions';
PRINT '';
PRINT '🚀 Sẵn sàng sử dụng Personal Finance Manager!';
PRINT '👤 Tác giả: Tiểu Nhất Bạch';
PRINT '📅 Hoàn thành: ' + CONVERT(NVARCHAR, GETDATE(), 120);

-- Thông tin kết nối cho developers
PRINT '';
PRINT '🔗 Thông tin kết nối:';
PRINT '   Server: TIEUNHATBACH\TIEUNHATBACH';
PRINT '   Database: PersonalFinanceDB';
PRINT '   Demo User: demo@example.com';
PRINT '';
PRINT '📖 Để sử dụng: Chạy backend server và frontend app';
PRINT '   Backend: cd backend && npm run dev';
PRINT '   Frontend: cd frontend && npm run dev';
PRINT '';
PRINT '🎯 Happy Coding! - Tiểu Nhất Bạch';

-- End of script
