-- =============================================
-- PERSONAL FINANCE MANAGER - SETUP ĐƠN GIẢN 100%
-- Tác giả: Tiểu Nhất Bạch
-- Phiên bản: Siêu đơn giản - Đảm bảo 100% hoạt động
-- =============================================

-- Xóa database cũ nếu tồn tại và tạo mới
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'PersonalFinanceDB')
BEGIN
    ALTER DATABASE PersonalFinanceDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE PersonalFinanceDB;
END

CREATE DATABASE PersonalFinanceDB;
GO

USE PersonalFinanceDB;
GO

-- Tạo bảng Users
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

-- Tạo bảng Categories
CREATE TABLE Categories (
    CategoryID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NULL,
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

-- Tạo bảng Transactions
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

-- Tạo bảng Budgets
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

-- Tạo indexes
CREATE INDEX IX_Transactions_UserID_Date ON Transactions(UserID, TransactionDate DESC);
CREATE INDEX IX_Transactions_CategoryID ON Transactions(CategoryID);
CREATE INDEX IX_Categories_UserID_Type ON Categories(UserID, Type);
CREATE INDEX IX_Budgets_UserID_Period ON Budgets(UserID, Period);
CREATE INDEX IX_UserSettings_UserID_Category ON UserSettings(UserID, Category);
CREATE INDEX IX_Notifications_UserID_IsRead_CreatedAt ON Notifications(UserID, IsRead, CreatedAt DESC);

-- Tạo user mẫu trước
DECLARE @UserID UNIQUEIDENTIFIER = NEWID();
INSERT INTO Users (UserID, Email, PasswordHash, FirstName, LastName, PhoneNumber)
VALUES (@UserID, 'nguoidung@vidu.com', '$2a$12$rG0k0U2JzTY/yXz2fey.0eJ6H8A2QzKq6O3jD0WJZ6yFvDQ2q9.0G', N'Nguyễn', N'Văn A', '0123456789');

-- Tạo categories trực tiếp cho user (không dùng default categories)
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color) VALUES
(@UserID, N'Lương', 'Income', 'salary', '#27ae60'),
(@UserID, N'Thưởng', 'Income', 'bonus', '#f39c12'),
(@UserID, N'Phụ cấp', 'Income', 'allowance', '#3498db'),
(@UserID, N'Đầu tư', 'Income', 'investment', '#9b59b6'),
(@UserID, N'Kinh doanh', 'Income', 'business', '#e67e22'),
(@UserID, N'Thu nhập khác', 'Income', 'other', '#95a5a6'),
(@UserID, N'Ăn uống', 'Expense', 'food', '#e74c3c'),
(@UserID, N'Đi lại', 'Expense', 'transport', '#3498db'),
(@UserID, N'Học tập', 'Expense', 'education', '#9b59b6'),
(@UserID, N'Giải trí', 'Expense', 'entertainment', '#f39c12'),
(@UserID, N'Y tế', 'Expense', 'healthcare', '#e67e22'),
(@UserID, N'Mua sắm', 'Expense', 'shopping', '#e91e63'),
(@UserID, N'Hóa đơn', 'Expense', 'bills', '#607d8b'),
(@UserID, N'Nhà ở', 'Expense', 'housing', '#795548'),
(@UserID, N'Quần áo', 'Expense', 'clothing', '#ff5722'),
(@UserID, N'Chi tiêu khác', 'Expense', 'other', '#95a5a6');

-- Tạo transactions mẫu
DECLARE @SalaryCategoryID UNIQUEIDENTIFIER;
DECLARE @FoodCategoryID UNIQUEIDENTIFIER;
DECLARE @TransportCategoryID UNIQUEIDENTIFIER;

SELECT @SalaryCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Lương';
SELECT @FoodCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Ăn uống';
SELECT @TransportCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Đi lại';

-- Kiểm tra CategoryID có tồn tại không
IF @SalaryCategoryID IS NOT NULL AND @FoodCategoryID IS NOT NULL AND @TransportCategoryID IS NOT NULL
BEGIN
    INSERT INTO Transactions (UserID, CategoryID, Amount, Type, TransactionDate, Description) VALUES
    (@UserID, @SalaryCategoryID, 15000000, 'Income', '2025-09-01', N'Lương tháng 9'),
    (@UserID, @FoodCategoryID, 250000, 'Expense', '2025-09-02', N'Ăn sáng'),
    (@UserID, @TransportCategoryID, 50000, 'Expense', '2025-09-02', N'Đi xe bus'),
    (@UserID, @FoodCategoryID, 180000, 'Expense', '2025-09-03', N'Ăn trưa');

    -- Tạo budget mẫu
    INSERT INTO Budgets (UserID, CategoryID, BudgetName, BudgetAmount, Period, StartDate, EndDate)
    VALUES (@UserID, @FoodCategoryID, N'Ngân sách ăn uống', 2000000, 'monthly', '2025-09-01', '2025-09-30');
END

-- Tạo settings mẫu
INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category)
VALUES
(@UserID, 'general.currency', 'VND', 'string', 'general'),
(@UserID, 'general.language', 'vi', 'string', 'general'),
(@UserID, 'appearance.theme', 'light', 'string', 'appearance'),
(@UserID, 'notifications.push', 'true', 'boolean', 'notifications'),
(@UserID, 'notifications.email', 'true', 'boolean', 'notifications'),
(@UserID, 'notifications.budget', 'true', 'boolean', 'notifications');

-- Tạo notifications mẫu
INSERT INTO Notifications (UserID, Title, Message, Type, Priority, IsRead)
VALUES
(@UserID, N'Chào mừng bạn', N'Chào mừng bạn đến với ứng dụng Quản Lý Tài Chính Cá Nhân', 'welcome', 'medium', 0),
(@UserID, N'Vượt ngân sách', N'Bạn đã vượt quá ngân sách cho danh mục Ăn uống', 'budget', 'high', 0);

-- Thông báo hoàn thành
PRINT '==============================================';
PRINT 'SETUP DATABASE HOÀN TẤT!';
PRINT '==============================================';
PRINT 'Email: nguoidung@vidu.com';
PRINT 'Password: 123456';
PRINT '==============================================';
PRINT 'Tác giả: Tiểu Nhất Bạch';
PRINT '==============================================';

-- End of script
