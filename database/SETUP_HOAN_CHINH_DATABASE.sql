-- =============================================
-- PERSONAL FINANCE MANAGER - THIẾT LẬP DATABASE HOÀN CHỈNH
-- Tác giả: Tiểu Nhất Bạch
-- Mô tả: File SQL duy nhất để thiết lập hoàn chỉnh toàn bộ database
-- Phiên bản: 1.0 - Hoàn chỉnh
-- =============================================

-- Cấu hình kết nối:
-- Server: TIEUNHATBACH\TIEUNHATBACH
-- Login: sa / Password: 123456
-- Database: PersonalFinanceDB

USE master;
GO

PRINT '🚀 BẮT ĐẦU THIẾT LẬP PERSONAL FINANCE MANAGER DATABASE';
PRINT '📅 Thời gian: ' + CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '👤 Tác giả: Tiểu Nhất Bạch';
PRINT '🎯 Mục tiêu: Tạo database hoàn chỉnh chỉ với 1 file SQL';
PRINT '';

-- =============================================
-- BƯỚC 1: TẠO DATABASE
-- =============================================

PRINT '📊 BƯỚC 1: Tạo Database PersonalFinanceDB...';

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PersonalFinanceDB')
BEGIN
    CREATE DATABASE PersonalFinanceDB;
    PRINT '✅ Database PersonalFinanceDB đã được tạo thành công';
END
ELSE
BEGIN
    PRINT '⚠️ Database PersonalFinanceDB đã tồn tại - sẽ thiết lập lại';
END
GO

-- Đợi một chút để database được tạo hoàn toàn
WAITFOR DELAY '00:00:02';
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

PRINT '✅ Đã xóa tất cả các objects cũ';

-- =============================================
-- BƯỚC 3: TẠO CÁC BẢNG CHÍNH
-- =============================================

PRINT '🏗️ BƯỚC 3: Tạo các bảng chính...';

-- Bảng Users - Người dùng
CREATE TABLE Users (
    UserID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20),
    AvatarURL NVARCHAR(500) NULL,
    Currency NVARCHAR(10) DEFAULT 'VND',
    Language NVARCHAR(10) DEFAULT 'vi-VN',
    TimeZone NVARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    IsEmailVerified BIT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE()
);
PRINT '✅ Bảng Users đã được tạo';

-- Bảng Categories - Danh mục thu chi
CREATE TABLE Categories (
    CategoryID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NULL, -- NULL cho default categories
    CategoryName NVARCHAR(100) NOT NULL,
    Type NVARCHAR(20) CHECK (Type IN ('Income', 'Expense')) NOT NULL,
    Icon NVARCHAR(50) DEFAULT 'default',
    Color NVARCHAR(7) DEFAULT '#3498db',
    ParentCategoryID UNIQUEIDENTIFIER NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ParentCategoryID) REFERENCES Categories(CategoryID)
);
PRINT '✅ Bảng Categories đã được tạo';

-- Bảng Transactions - Giao dịch
CREATE TABLE Transactions (
    TransactionID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    CategoryID UNIQUEIDENTIFIER NOT NULL,
    Amount DECIMAL(15,2) NOT NULL,
    Type NVARCHAR(20) CHECK (Type IN ('Income', 'Expense')) NOT NULL,
    Description NVARCHAR(500),
    TransactionDate DATE NOT NULL,
    ReceiptURL NVARCHAR(500) NULL,
    Tags NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);
PRINT '✅ Bảng Transactions đã được tạo';

-- Bảng Budgets - Ngân sách
CREATE TABLE Budgets (
    BudgetID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    CategoryID UNIQUEIDENTIFIER NOT NULL,
    BudgetName NVARCHAR(100) NOT NULL,
    BudgetAmount DECIMAL(15,2) NOT NULL,
    Period NVARCHAR(20) CHECK (Period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    AlertThreshold DECIMAL(5,2) DEFAULT 80.00 CHECK (AlertThreshold BETWEEN 0 AND 100),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);
PRINT '✅ Bảng Budgets đã được tạo';

-- Bảng UserSettings - Cài đặt người dùng
CREATE TABLE UserSettings (
    SettingID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    SettingKey NVARCHAR(100) NOT NULL,
    SettingValue NVARCHAR(MAX) NOT NULL,
    SettingType NVARCHAR(20) NOT NULL DEFAULT 'string',
    Category NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    UNIQUE (UserID, SettingKey)
);
PRINT '✅ Bảng UserSettings đã được tạo';

-- Bảng Notifications - Thông báo
CREATE TABLE Notifications (
    NotificationID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    Priority NVARCHAR(20) NOT NULL DEFAULT 'medium',
    IsRead BIT DEFAULT 0,
    IsArchived BIT DEFAULT 0,
    ActionUrl NVARCHAR(500) NULL,
    ExpiresAt DATETIME2 NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    ReadAt DATETIME2 NULL,
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
PRINT '✅ Bảng Notifications đã được tạo';

-- Bảng RecurringTransactions - Giao dịch định kỳ
CREATE TABLE RecurringTransactions (
    RecurringID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    CategoryID UNIQUEIDENTIFIER NOT NULL,
    Description NVARCHAR(255) NOT NULL,
    Amount DECIMAL(15,2) NOT NULL,
    Type NVARCHAR(10) CHECK (Type IN ('Income', 'Expense')) NOT NULL,
    Frequency NVARCHAR(20) CHECK (Frequency IN ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly')) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NULL,
    NextDueDate DATE NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE CASCADE
);
PRINT '✅ Bảng RecurringTransactions đã được tạo';

-- Bảng RecurringTransactionHistory - Lịch sử giao dịch định kỳ
CREATE TABLE RecurringTransactionHistory (
    HistoryID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RecurringID UNIQUEIDENTIFIER NOT NULL,
    TransactionID UNIQUEIDENTIFIER NOT NULL,
    GeneratedDate DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (RecurringID) REFERENCES RecurringTransactions(RecurringID) ON DELETE CASCADE,
    FOREIGN KEY (TransactionID) REFERENCES Transactions(TransactionID) ON DELETE CASCADE
);
PRINT '✅ Bảng RecurringTransactionHistory đã được tạo';

-- Bảng BackupHistory - Lịch sử sao lưu
CREATE TABLE BackupHistory (
    BackupID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    BackupType NVARCHAR(20) NOT NULL,
    BackupSize BIGINT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'pending',
    ErrorMessage NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CompletedAt DATETIME2 NULL,
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
PRINT '✅ Bảng BackupHistory đã được tạo';

-- =============================================
-- BƯỚC 4: TẠO INDEXES CHO HIỆU SUẤT
-- =============================================

PRINT '📊 BƯỚC 4: Tạo indexes cho hiệu suất...';

-- Indexes cho bảng Transactions
CREATE INDEX IX_Transactions_UserID_Date ON Transactions(UserID, TransactionDate DESC);
CREATE INDEX IX_Transactions_CategoryID ON Transactions(CategoryID);
CREATE INDEX IX_Transactions_Type_Date ON Transactions(Type, TransactionDate DESC);

-- Indexes cho bảng Categories
CREATE INDEX IX_Categories_UserID_Type ON Categories(UserID, Type);
CREATE INDEX IX_Categories_Type_Active ON Categories(Type, IsActive);

-- Indexes cho bảng Budgets
CREATE INDEX IX_Budgets_UserID_Period ON Budgets(UserID, Period);
CREATE INDEX IX_Budgets_CategoryID ON Budgets(CategoryID);
CREATE INDEX IX_Budgets_StartDate_EndDate ON Budgets(StartDate, EndDate);

-- Indexes cho bảng UserSettings
CREATE INDEX IX_UserSettings_UserID_Category ON UserSettings(UserID, Category);

-- Indexes cho bảng Notifications
CREATE INDEX IX_Notifications_UserID_IsRead_CreatedAt ON Notifications(UserID, IsRead, CreatedAt DESC);
CREATE INDEX IX_Notifications_Type_Priority ON Notifications(Type, Priority);

-- Indexes cho bảng RecurringTransactions
CREATE INDEX IX_RecurringTransactions_UserID ON RecurringTransactions(UserID);
CREATE INDEX IX_RecurringTransactions_NextDueDate ON RecurringTransactions(NextDueDate);
CREATE INDEX IX_RecurringTransactions_IsActive ON RecurringTransactions(IsActive);

-- Indexes cho bảng BackupHistory
CREATE INDEX IX_BackupHistory_UserID_CreatedAt ON BackupHistory(UserID, CreatedAt DESC);

PRINT '✅ Tất cả indexes đã được tạo để tối ưu hiệu suất';

-- =============================================
-- BƯỚC 5: CHÈN DỮ LIỆU MẶC ĐỊNH
-- =============================================

PRINT '📝 BƯỚC 5: Chèn dữ liệu mặc định...';

-- Insert default categories với DEFAULT_CATEGORIES_USER_ID
DECLARE @DefaultUserID UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000000';

-- Categories Thu nhập
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color) VALUES
(@DefaultUserID, N'Lương', 'Income', 'salary', '#27ae60'),
(@DefaultUserID, N'Thưởng', 'Income', 'bonus', '#f39c12'),
(@DefaultUserID, N'Phụ cấp', 'Income', 'allowance', '#3498db'),
(@DefaultUserID, N'Đầu tư', 'Income', 'investment', '#9b59b6'),
(@DefaultUserID, N'Kinh doanh', 'Income', 'business', '#e67e22'),
(@DefaultUserID, N'Thu nhập khác', 'Income', 'other', '#95a5a6');

-- Categories Chi tiêu
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color) VALUES
(@DefaultUserID, N'Ăn uống', 'Expense', 'food', '#e74c3c'),
(@DefaultUserID, N'Đi lại', 'Expense', 'transport', '#3498db'),
(@DefaultUserID, N'Học tập', 'Expense', 'education', '#9b59b6'),
(@DefaultUserID, N'Giải trí', 'Expense', 'entertainment', '#f39c12'),
(@DefaultUserID, N'Y tế', 'Expense', 'healthcare', '#e67e22'),
(@DefaultUserID, N'Mua sắm', 'Expense', 'shopping', '#e91e63'),
(@DefaultUserID, N'Hóa đơn', 'Expense', 'bills', '#607d8b'),
(@DefaultUserID, N'Nhà ở', 'Expense', 'housing', '#795548'),
(@DefaultUserID, N'Quần áo', 'Expense', 'clothing', '#ff5722'),
(@DefaultUserID, N'Chi tiêu khác', 'Expense', 'other', '#95a5a6');

PRINT '✅ Đã chèn ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' default categories';

-- Insert sample user với bcrypt hashed password cho "123456"
DECLARE @UserID UNIQUEIDENTIFIER = NEWID();
INSERT INTO Users (UserID, Email, PasswordHash, FirstName, LastName, PhoneNumber)
VALUES (@UserID, 'nguoidung@vidu.com', '$2a$12$rG0k0U2JzTY/yXz2fey.0eJ6H8A2QzKq6O3jD0WJZ6yFvDQ2q9.0G', N'Nguyễn', N'Văn A', '0123456789');
PRINT '✅ Đã tạo user mẫu với email: nguoidung@vidu.com và mật khẩu: 123456';

-- Insert categories cho user
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color)
SELECT @UserID, CategoryName, Type, Icon, Color
FROM Categories WHERE UserID = @DefaultUserID;
PRINT '✅ Đã sao chép categories cho user mẫu';

-- Insert sample transactions
DECLARE @SalaryCategoryID UNIQUEIDENTIFIER;
DECLARE @FoodCategoryID UNIQUEIDENTIFIER;
DECLARE @TransportCategoryID UNIQUEIDENTIFIER;

SELECT @SalaryCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Lương';
SELECT @FoodCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Ăn uống';
SELECT @TransportCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Đi lại';

INSERT INTO Transactions (UserID, CategoryID, Amount, Type, TransactionDate, Description) VALUES
(@UserID, @SalaryCategoryID, 15000000, 'Income', '2025-09-01', N'Lương tháng 9'),
(@UserID, @FoodCategoryID, 250000, 'Expense', '2025-09-02', N'Ăn sáng'),
(@UserID, @TransportCategoryID, 50000, 'Expense', '2025-09-02', N'Đi xe bus'),
(@UserID, @FoodCategoryID, 180000, 'Expense', '2025-09-03', N'Ăn trưa');
PRINT '✅ Đã chèn ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' transactions mẫu';

-- Insert sample budget
INSERT INTO Budgets (UserID, CategoryID, BudgetName, BudgetAmount, Period, StartDate, EndDate)
VALUES (@UserID, @FoodCategoryID, N'Ngân sách ăn uống', 2000000, 'monthly', '2025-09-01', '2025-09-30');
PRINT '✅ Đã tạo budget mẫu';

-- Insert sample settings
INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category)
VALUES
(@UserID, 'general.currency', 'VND', 'string', 'general'),
(@UserID, 'general.language', 'vi', 'string', 'general'),
(@UserID, 'appearance.theme', 'light', 'string', 'appearance'),
(@UserID, 'notifications.push', 'true', 'boolean', 'notifications'),
(@UserID, 'notifications.email', 'true', 'boolean', 'notifications'),
(@UserID, 'notifications.budget', 'true', 'boolean', 'notifications'),
(@UserID, 'privacy.show_profile', 'true', 'boolean', 'privacy'),
(@UserID, 'privacy.share_data', 'false', 'boolean', 'privacy'),
(@UserID, 'backup.auto_backup', 'true', 'boolean', 'backup');
PRINT '✅ Đã chèn ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' settings mẫu';

-- Insert sample notifications
INSERT INTO Notifications (UserID, Title, Message, Type, Priority, IsRead)
VALUES
(@UserID, N'Chào mừng bạn', N'Chào mừng bạn đến với ứng dụng Quản Lý Tài Chính Cá Nhân', 'welcome', 'medium', 0),
(@UserID, N'Vượt ngân sách', N'Bạn đã vượt quá ngân sách cho danh mục Ăn uống', 'budget', 'high', 0);
PRINT '✅ Đã chèn ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' notifications mẫu';

PRINT '';
PRINT '🎉 THIẾT LẬP DATABASE HOÀN TẤT!';
PRINT '';
PRINT '📋 THÔNG TIN ĐĂNG NHẬP MẪU:';
PRINT '   📧 Email: nguoidung@vidu.com';
PRINT '   🔑 Mật khẩu: 123456';
PRINT '';
PRINT '📊 THỐNG KÊ DATABASE:';

-- Đếm và hiển thị số lượng records
DECLARE @UserCount INT, @CategoryCount INT, @TransactionCount INT, @BudgetCount INT, @SettingCount INT, @NotificationCount INT;

SELECT @UserCount = COUNT(*) FROM Users;
SELECT @CategoryCount = COUNT(*) FROM Categories;
SELECT @TransactionCount = COUNT(*) FROM Transactions;
SELECT @BudgetCount = COUNT(*) FROM Budgets;
SELECT @SettingCount = COUNT(*) FROM UserSettings;
SELECT @NotificationCount = COUNT(*) FROM Notifications;

PRINT '   - Users: ' + CAST(@UserCount AS NVARCHAR);
PRINT '   - Categories: ' + CAST(@CategoryCount AS NVARCHAR);
PRINT '   - Transactions: ' + CAST(@TransactionCount AS NVARCHAR);
PRINT '   - Budgets: ' + CAST(@BudgetCount AS NVARCHAR);
PRINT '   - UserSettings: ' + CAST(@SettingCount AS NVARCHAR);
PRINT '   - Notifications: ' + CAST(@NotificationCount AS NVARCHAR);
PRINT '';
PRINT '🚀 SẴN SÀNG SỬ DỤNG PERSONAL FINANCE MANAGER!';
PRINT '👤 Tác giả: Tiểu Nhất Bạch';
PRINT '📅 Hoàn thành: ' + CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '';
PRINT '🔗 THÔNG TIN KẾT NỐI:';
PRINT '   Server: TIEUNHATBACH\TIEUNHATBACH';
PRINT '   Database: PersonalFinanceDB';
PRINT '   Login: sa / Password: 123456';
PRINT '';
PRINT '🎯 Chỉ cần chạy file này là có thể sử dụng ngay!';
PRINT '📖 Để khởi động ứng dụng:';
PRINT '   Backend: cd backend && npm run dev';
PRINT '   Frontend: cd frontend && npm run dev';
PRINT '';
PRINT '💎 Bản quyền thuộc về Tiểu Nhất Bạch';

-- End of script
