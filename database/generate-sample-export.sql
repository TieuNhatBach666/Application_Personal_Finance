-- =============================================
-- QUẢN LÝ TÀI CHÍNH CÁ NHÂN - XUẤT DỮ LIỆU MẪU
-- Tác giả: Tiểu Nhất Bạch
-- Mô tả: Script tạo dữ liệu mẫu để xuất chia sẻ trên GitHub
-- =============================================

-- Thông tin kết nối:
-- Server: TIEUNHATBACH\TIEUNHATBACH
-- Login: sa / Password: 123456
-- Database: PersonalFinanceDB

USE master;
GO

-- Kiểm tra và tạo database nếu chưa tồn tại
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PersonalFinanceDB')
BEGIN
    CREATE DATABASE PersonalFinanceDB;
    PRINT '✅ Database PersonalFinanceDB đã được tạo';
END
GO

USE PersonalFinanceDB;
GO

-- Xóa các bảng cũ nếu tồn tại
IF OBJECT_ID('Notifications', 'U') IS NOT NULL DROP TABLE Notifications;
IF OBJECT_ID('UserSettings', 'U') IS NOT NULL DROP TABLE UserSettings;
IF OBJECT_ID('Budgets', 'U') IS NOT NULL DROP TABLE Budgets;
IF OBJECT_ID('Transactions', 'U') IS NOT NULL DROP TABLE Transactions;
IF OBJECT_ID('Categories', 'U') IS NOT NULL DROP TABLE Categories;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;
GO

-- Tạo bảng Users
CREATE TABLE Users (
    UserID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Email NVARCHAR(255) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);
PRINT '✅ Bảng Users đã được tạo';

-- Tạo bảng Categories
CREATE TABLE Categories (
    CategoryID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NULL, -- NULL cho categories mặc định
    CategoryName NVARCHAR(100) NOT NULL,
    CategoryType NVARCHAR(20) CHECK (CategoryType IN ('Income', 'Expense')) NOT NULL,
    IconName NVARCHAR(50) DEFAULT 'default',
    ColorCode NVARCHAR(7) DEFAULT '#3498db',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
PRINT '✅ Bảng Categories đã được tạo';

-- Tạo bảng Transactions
CREATE TABLE Transactions (
    TransactionID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    CategoryID UNIQUEIDENTIFIER NOT NULL,
    Amount DECIMAL(15,2) NOT NULL,
    Type NVARCHAR(20) CHECK (Type IN ('Income', 'Expense')) NOT NULL,
    Date DATE NOT NULL,
    Description NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);
PRINT '✅ Bảng Transactions đã được tạo';

-- Tạo bảng Budgets
CREATE TABLE Budgets (
    BudgetID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    CategoryID UNIQUEIDENTIFIER NOT NULL,
    Amount DECIMAL(15,2) NOT NULL,
    Period NVARCHAR(20) CHECK (Period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    SpentAmount DECIMAL(15,2) DEFAULT 0,
    WarningThreshold DECIMAL(5,2) DEFAULT 70.00 CHECK (WarningThreshold BETWEEN 0 AND 100),
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);
PRINT '✅ Bảng Budgets đã được tạo';

-- Tạo bảng UserSettings
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

-- Tạo bảng Notifications
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

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX IX_Transactions_UserID_Date ON Transactions(UserID, Date DESC);
CREATE INDEX IX_Transactions_CategoryID ON Transactions(CategoryID);
CREATE INDEX IX_Categories_UserID_Type ON Categories(UserID, CategoryType);
CREATE INDEX IX_Budgets_UserID_Period ON Budgets(UserID, Period);
CREATE INDEX IX_UserSettings_UserID_Category ON UserSettings(UserID, Category);
CREATE INDEX IX_Notifications_UserID_IsRead_CreatedAt ON Notifications(UserID, IsRead, CreatedAt DESC);
PRINT '✅ Indexes đã được tạo';

-- Chèn dữ liệu mẫu cho categories mặc định
PRINT '📝 Chèn dữ liệu mẫu cho categories...';

-- Categories thu nhập
INSERT INTO Categories (UserID, CategoryName, CategoryType, IconName, ColorCode) VALUES
(NULL, N'Lương', 'Income', 'salary', '#27ae60'),
(NULL, N'Thưởng', 'Income', 'bonus', '#f39c12'),
(NULL, N'Phụ cấp', 'Income', 'allowance', '#3498db'),
(NULL, N'Đầu tư', 'Income', 'investment', '#9b59b6'),
(NULL, N'Kinh doanh', 'Income', 'business', '#e67e22'),
(NULL, N'Thu nhập khác', 'Income', 'other', '#95a5a6');

-- Categories chi tiêu
INSERT INTO Categories (UserID, CategoryName, CategoryType, IconName, ColorCode) VALUES
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

PRINT '✅ Categories mặc định đã được chèn';

-- Chèn dữ liệu mẫu cho user
PRINT '📝 Chèn dữ liệu mẫu cho user...';
DECLARE @UserID UNIQUEIDENTIFIER = NEWID();
INSERT INTO Users (UserID, Email, PasswordHash, FirstName, LastName, PhoneNumber) 
VALUES (@UserID, 'sample@example.com', 'sample_hash', N'Nguyễn', N'Văn A', '0123456789');

-- Chèn categories cho user
PRINT '📝 Chèn categories cho user...';
INSERT INTO Categories (UserID, CategoryName, CategoryType, IconName, ColorCode) 
SELECT @UserID, CategoryName, CategoryType, IconName, ColorCode 
FROM Categories WHERE UserID IS NULL;

-- Chèn dữ liệu mẫu cho transactions
PRINT '📝 Chèn dữ liệu mẫu cho transactions...';
DECLARE @SalaryCategoryID UNIQUEIDENTIFIER;
DECLARE @FoodCategoryID UNIQUEIDENTIFIER;
DECLARE @TransportCategoryID UNIQUEIDENTIFIER;

SELECT @SalaryCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Lương';
SELECT @FoodCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Ăn uống';
SELECT @TransportCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Đi lại';

INSERT INTO Transactions (UserID, CategoryID, Amount, Type, Date, Description) VALUES
(@UserID, @SalaryCategoryID, 15000000, 'Income', '2025-09-01', N'Lương tháng 9'),
(@UserID, @FoodCategoryID, 250000, 'Expense', '2025-09-02', N'Ăn sáng'),
(@UserID, @TransportCategoryID, 50000, 'Expense', '2025-09-02', N'Đi xe bus'),
(@UserID, @FoodCategoryID, 180000, 'Expense', '2025-09-03', N'Ăn trưa');

-- Chèn dữ liệu mẫu cho budgets
PRINT '📝 Chèn dữ liệu mẫu cho budgets...';
INSERT INTO Budgets (UserID, CategoryID, Amount, Period, StartDate, EndDate) 
VALUES (@UserID, @FoodCategoryID, 2000000, 'monthly', '2025-09-01', '2025-09-30');

-- Chèn dữ liệu mẫu cho settings
PRINT '📝 Chèn dữ liệu mẫu cho settings...';
INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category) 
VALUES 
(@UserID, 'currency', 'VND', 'string', 'general'),
(@UserID, 'language', 'vi', 'string', 'general'),
(@UserID, 'theme', 'light', 'string', 'appearance');

-- Chèn dữ liệu mẫu cho notifications
PRINT '📝 Chèn dữ liệu mẫu cho notifications...';
INSERT INTO Notifications (UserID, Title, Message, Type, Priority) 
VALUES 
(@UserID, N'Chào mừng bạn', N'Chào mừng bạn đến với ứng dụng Quản Lý Tài Chính Cá Nhân', 'welcome', 'medium'),
(@UserID, N'Vượt ngân sách', N'Bạn đã vượt quá ngân sách cho danh mục Ăn uống', 'budget', 'high');

PRINT '';
PRINT '🎉 XUẤT DỮ LIỆU MẪU ĐÃ ĐƯỢC TẠO!';
PRINT '';
PRINT '📋 TÓM TẮT:';
PRINT '   ✅ Database: PersonalFinanceDB';
PRINT '   ✅ Users: 1 user mẫu';
PRINT '   ✅ Categories: 16 categories (6 Income, 10 Expense)';
PRINT '   ✅ Transactions: 4 giao dịch mẫu';
PRINT '   ✅ Budgets: 1 ngân sách mẫu';
PRINT '   ✅ Settings: 3 cài đặt mẫu';
PRINT '   ✅ Notifications: 2 thông báo mẫu';
PRINT '';
PRINT '🚀 SẴN SÀNG ĐỂ CHIA SẺ TRÊN GITHUB!';
PRINT '📧 Tác giả: Tiểu Nhất Bạch';
PRINT '📅 Hoàn thành: ' + CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '';