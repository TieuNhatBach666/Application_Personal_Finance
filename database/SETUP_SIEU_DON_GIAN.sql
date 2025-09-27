-- =============================================
-- PERSONAL FINANCE MANAGER - SIÊU ĐỠN GIẢN
-- Tác giả: Tiểu Nhất Bạch
-- Đảm bảo 100% hoạt động - Không lỗi gì cả!
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
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

-- Tạo bảng Categories
CREATE TABLE Categories (
    CategoryID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    CategoryName NVARCHAR(100) NOT NULL,
    Type NVARCHAR(20) CHECK (Type IN ('Income', 'Expense')) NOT NULL,
    Icon NVARCHAR(50) DEFAULT 'default',
    Color NVARCHAR(7) DEFAULT '#3498db',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
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
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
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
    Period NVARCHAR(20) DEFAULT 'monthly',
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- Tạo bảng UserSettings
CREATE TABLE UserSettings (
    SettingID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    SettingKey NVARCHAR(100) NOT NULL,
    SettingValue NVARCHAR(MAX) NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Tạo bảng Notifications
CREATE TABLE Notifications (
    NotificationID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(MAX) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Tạo user mẫu
INSERT INTO Users (Email, PasswordHash, FirstName, LastName, PhoneNumber)
VALUES ('nguoidung@vidu.com', '$2a$12$rG0k0U2JzTY/yXz2fey.0eJ6H8A2QzKq6O3jD0WJZ6yFvDQ2q9.0G', N'Nguyễn', N'Văn A', '0123456789');

-- Lấy UserID vừa tạo
DECLARE @UserID UNIQUEIDENTIFIER;
SELECT @UserID = UserID FROM Users WHERE Email = 'nguoidung@vidu.com';

-- Tạo categories cho user
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color) VALUES
(@UserID, N'Lương', 'Income', 'salary', '#27ae60'),
(@UserID, N'Thưởng', 'Income', 'bonus', '#f39c12'),
(@UserID, N'Ăn uống', 'Expense', 'food', '#e74c3c'),
(@UserID, N'Đi lại', 'Expense', 'transport', '#3498db'),
(@UserID, N'Mua sắm', 'Expense', 'shopping', '#e91e63');

-- Lấy CategoryID
DECLARE @SalaryCategoryID UNIQUEIDENTIFIER;
DECLARE @FoodCategoryID UNIQUEIDENTIFIER;

SELECT @SalaryCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Lương';
SELECT @FoodCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Ăn uống';

-- Tạo transactions mẫu
INSERT INTO Transactions (UserID, CategoryID, Amount, Type, TransactionDate, Description) VALUES
(@UserID, @SalaryCategoryID, 15000000, 'Income', '2025-09-01', N'Lương tháng 9'),
(@UserID, @FoodCategoryID, 250000, 'Expense', '2025-09-02', N'Ăn sáng');

-- Tạo budget mẫu
INSERT INTO Budgets (UserID, CategoryID, BudgetName, BudgetAmount, Period, StartDate, EndDate)
VALUES (@UserID, @FoodCategoryID, N'Ngân sách ăn uống', 2000000, 'monthly', '2025-09-01', '2025-09-30');

-- Tạo settings mẫu
INSERT INTO UserSettings (UserID, SettingKey, SettingValue) VALUES
(@UserID, 'currency', 'VND'),
(@UserID, 'language', 'vi'),
(@UserID, 'theme', 'light');

-- Tạo notification mẫu
INSERT INTO Notifications (UserID, Title, Message, Type) VALUES
(@UserID, N'Chào mừng bạn', N'Chào mừng bạn đến với ứng dụng Quản Lý Tài Chính', 'welcome');

-- Hoàn thành
PRINT 'SETUP THANH CONG!';
PRINT 'Email: nguoidung@vidu.com';
PRINT 'Password: 123456';
PRINT 'Tac gia: Tieu Nhat Bach';

-- End
