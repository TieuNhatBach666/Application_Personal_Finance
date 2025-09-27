-- =============================================
-- PERSONAL FINANCE MANAGER - AN TOÀN NHẤT
-- Tác giả: Tiểu Nhất Bạch
-- Không xóa database cũ - Chỉ tạo mới nếu chưa có
-- =============================================

-- Tạo database chỉ khi chưa tồn tại
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'PersonalFinanceDB')
BEGIN
    CREATE DATABASE PersonalFinanceDB;
    PRINT 'Database PersonalFinanceDB da duoc tao';
END
ELSE
BEGIN
    PRINT 'Database PersonalFinanceDB da ton tai';
END
GO

USE PersonalFinanceDB;
GO

-- Xóa các bảng cũ nếu có (để tạo lại)
IF OBJECT_ID('Notifications', 'U') IS NOT NULL DROP TABLE Notifications;
IF OBJECT_ID('UserSettings', 'U') IS NOT NULL DROP TABLE UserSettings;
IF OBJECT_ID('Budgets', 'U') IS NOT NULL DROP TABLE Budgets;
IF OBJECT_ID('Transactions', 'U') IS NOT NULL DROP TABLE Transactions;
IF OBJECT_ID('Categories', 'U') IS NOT NULL DROP TABLE Categories;
IF OBJECT_ID('Users', 'U') IS NOT NULL DROP TABLE Users;

-- Tạo bảng Users (với tất cả cột mà backend cần)
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
    UserID UNIQUEIDENTIFIER NOT NULL,
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
    Period NVARCHAR(20) CHECK (Period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) NOT NULL DEFAULT 'monthly',
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
    Category NVARCHAR(50) NOT NULL DEFAULT 'general',
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

-- Tạo user mẫu
INSERT INTO Users (Email, PasswordHash, FirstName, LastName, PhoneNumber)
VALUES ('nguoidung@vidu.com', '$2a$12$rG0k0U2JzTY/yXz2fey.0eJ6H8A2QzKq6O3jD0WJZ6yFvDQ2q9.0G', N'Nguyen', N'Van A', '0123456789');

-- Lấy UserID vừa tạo
DECLARE @UserID UNIQUEIDENTIFIER;
SELECT @UserID = UserID FROM Users WHERE Email = 'nguoidung@vidu.com';

-- Tạo categories cho user
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color) VALUES
(@UserID, N'Luong', 'Income', 'salary', '#27ae60'),
(@UserID, N'Thuong', 'Income', 'bonus', '#f39c12'),
(@UserID, N'An uong', 'Expense', 'food', '#e74c3c'),
(@UserID, N'Di lai', 'Expense', 'transport', '#3498db'),
(@UserID, N'Mua sam', 'Expense', 'shopping', '#e91e63');

-- Lấy CategoryID
DECLARE @SalaryCategoryID UNIQUEIDENTIFIER;
DECLARE @FoodCategoryID UNIQUEIDENTIFIER;

SELECT @SalaryCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Luong';
SELECT @FoodCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'An uong';

-- Tạo transactions mẫu
INSERT INTO Transactions (UserID, CategoryID, Amount, Type, TransactionDate, Description) VALUES
(@UserID, @SalaryCategoryID, 15000000, 'Income', '2025-09-01', N'Luong thang 9'),
(@UserID, @FoodCategoryID, 250000, 'Expense', '2025-09-02', N'An sang');

-- Tạo budget mẫu
INSERT INTO Budgets (UserID, CategoryID, BudgetName, BudgetAmount, Period, StartDate, EndDate)
VALUES (@UserID, @FoodCategoryID, N'Ngan sach an uong', 2000000, 'monthly', '2025-09-01', '2025-09-30');

-- Tạo settings mẫu
INSERT INTO UserSettings (UserID, SettingKey, SettingValue) VALUES
(@UserID, 'currency', 'VND'),
(@UserID, 'language', 'vi'),
(@UserID, 'theme', 'light');

-- Tạo notification mẫu
INSERT INTO Notifications (UserID, Title, Message, Type) VALUES
(@UserID, N'Chao mung ban', N'Chao mung ban den voi ung dung Quan Ly Tai Chinh', 'welcome');

-- Hoàn thành
PRINT 'SETUP THANH CONG!';
PRINT 'Email: nguoidung@vidu.com';
PRINT 'Password: 123456';
PRINT 'Tac gia: Tieu Nhat Bach';

-- End
