-- Personal Finance Manager Database Creation Script
-- Server: TIEUNHATBACH\TIEUNHATBACH
-- Login: sa / Password: 123456

-- Create database if not exists
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PersonalFinanceDB')
BEGIN
    CREATE DATABASE PersonalFinanceDB;
END
GO

USE PersonalFinanceDB;
GO

-- Drop tables if they exist (for clean setup)
IF OBJECT_ID('Notifications', 'U') IS NOT NULL DROP TABLE Notifications;
IF OBJECT_ID('UserSettings', 'U') IS NOT NULL DROP TABLE UserSettings;
IF OBJECT_ID('Budgets', 'U') IS NOT NULL DROP TABLE Budgets;
IF OBJECT_ID('Transactions', 'U') IS NOT NULL DROP TABLE Transactions;
IF OBJECT_ID('Categories', 'U') IS NOT NULL DROP TABLE Categories;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
GO

-- Create Users table
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
PRINT '✅ Tạo bảng Users';

-- Create Categories table
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
PRINT '✅ Tạo bảng Categories';

-- Create Transactions table
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
PRINT '✅ Tạo bảng Transactions';

-- Create Budgets table
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
PRINT '✅ Tạo bảng Budgets';

-- Create UserSettings table
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
PRINT '✅ Tạo bảng UserSettings';

-- Create Notifications table
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
PRINT '✅ Tạo bảng Notifications';

-- Create indexes for better performance
CREATE INDEX IX_Transactions_UserID_Date ON Transactions(UserID, TransactionDate DESC);
CREATE INDEX IX_Transactions_CategoryID ON Transactions(CategoryID);
CREATE INDEX IX_Transactions_Type_Date ON Transactions(Type, TransactionDate DESC);
CREATE INDEX IX_Categories_UserID_Type ON Categories(UserID, Type);
CREATE INDEX IX_Categories_Type_Active ON Categories(Type, IsActive);
CREATE INDEX IX_Budgets_UserID_Period ON Budgets(UserID, Period);
CREATE INDEX IX_Budgets_CategoryID ON Budgets(CategoryID);
CREATE INDEX IX_Budgets_StartDate_EndDate ON Budgets(StartDate, EndDate);
CREATE INDEX IX_UserSettings_UserID_Category ON UserSettings(UserID, Category);
CREATE INDEX IX_Notifications_UserID_IsRead_CreatedAt ON Notifications(UserID, IsRead, CreatedAt DESC);
CREATE INDEX IX_Notifications_Type_Priority ON Notifications(Type, Priority);
PRINT '✅ Tạo indexes để tối ưu hiệu suất';

-- Insert default categories for Income với DEFAULT_CATEGORIES_USER_ID
DECLARE @DefaultUserID UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000000';
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color) VALUES
(@DefaultUserID, N'Lương', 'Income', 'salary', '#27ae60'),
(@DefaultUserID, N'Thưởng', 'Income', 'bonus', '#f39c12'),
(@DefaultUserID, N'Phụ cấp', 'Income', 'allowance', '#3498db'),
(@DefaultUserID, N'Đầu tư', 'Income', 'investment', '#9b59b6'),
(@DefaultUserID, N'Kinh doanh', 'Income', 'business', '#e67e22'),
(@DefaultUserID, N'Thu nhập khác', 'Income', 'other', '#95a5a6');
PRINT '✅ Chèn categories thu nhập mặc định';

-- Insert default categories for Expense
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
PRINT '✅ Chèn categories chi tiêu mặc định';

-- Insert sample user with bcrypt hashed password for "123456"
-- Hash được tạo với bcrypt cost factor 12
DECLARE @UserID UNIQUEIDENTIFIER = NEWID();
INSERT INTO Users (UserID, Email, PasswordHash, FirstName, LastName, PhoneNumber)
VALUES (@UserID, 'nguoidung@vidu.com', '$2a$12$rG0k0U2JzTY/yXz2fey.0eJ6H8A2QzKq6O3jD0WJZ6yFvDQ2q9.0G', N'Nguyễn', N'Văn A', '0123456789');
PRINT '✅ Chèn user mẫu với mật khẩu: 123456';

-- Insert sample categories for user
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color)
SELECT @UserID, CategoryName, Type, Icon, Color
FROM Categories WHERE UserID = @DefaultUserID;
PRINT '✅ Chèn categories cho user';

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
PRINT '✅ Chèn transactions mẫu';

-- Insert sample budget
INSERT INTO Budgets (UserID, CategoryID, BudgetName, BudgetAmount, Period, StartDate, EndDate)
VALUES (@UserID, @FoodCategoryID, N'Ngân sách ăn uống', 2000000, 'monthly', '2025-09-01', '2025-09-30');
PRINT '✅ Chèn budget mẫu';

-- Insert sample settings với format category.key
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
PRINT '✅ Chèn settings mẫu';

-- Insert sample notifications
INSERT INTO Notifications (UserID, Title, Message, Type, Priority, IsRead)
VALUES
(@UserID, N'Chào mừng bạn', N'Chào mừng bạn đến với ứng dụng Quản Lý Tài Chính Cá Nhân', 'welcome', 'medium', 0),
(@UserID, N'Vượt ngân sách', N'Bạn đã vượt quá ngân sách cho danh mục Ăn uống', 'budget', 'high', 0);
PRINT '✅ Chèn notifications mẫu';

PRINT '';
PRINT '🎉 DATABASE VÀ DỮ LIỆU MẪU ĐÃ ĐƯỢC TẠO!';
PRINT '';
PRINT '📋 THÔNG TIN ĐĂNG NHẬP MẪU:';
PRINT '   📧 Email: nguoidung@vidu.com';
PRINT '   🔑 Mật khẩu: 123456';
PRINT '';
PRINT '🚀 SẴN SÀNG ĐỂ CHIA SẺ TRÊN GITHUB!';
PRINT '👉 Người khác chỉ cần mở file này trong SSMS và chạy là có thể sử dụng ngay!';