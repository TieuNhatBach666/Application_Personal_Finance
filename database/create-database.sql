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
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    FullName NVARCHAR(255) NOT NULL,
    PhoneNumber NVARCHAR(20),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

-- Create Categories table
CREATE TABLE Categories (
    CategoryID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    CategoryName NVARCHAR(100) NOT NULL,
    CategoryType NVARCHAR(20) CHECK (CategoryType IN ('Income', 'Expense')) NOT NULL,
    IconName NVARCHAR(50) DEFAULT 'default',
    ColorCode NVARCHAR(7) DEFAULT '#3498db', -- Hex color code
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    IsActive BIT DEFAULT 1
);

-- Create Transactions table
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

-- Create Budgets table
CREATE TABLE Budgets (
    BudgetID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
    BudgetAmount DECIMAL(15,2) NOT NULL,
    BudgetMonth INT NOT NULL CHECK (BudgetMonth BETWEEN 1 AND 12),
    BudgetYear INT NOT NULL CHECK (BudgetYear >= 2020),
    WarningThreshold DECIMAL(5,2) DEFAULT 70.00 CHECK (WarningThreshold BETWEEN 0 AND 100), -- Percentage
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    UNIQUE(UserID, CategoryID, BudgetMonth, BudgetYear)
);

-- Create UserSettings table
CREATE TABLE UserSettings (
    SettingID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    SettingKey NVARCHAR(100) NOT NULL,
    SettingValue NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE(),
    UNIQUE(UserID, SettingKey)
);

-- Create Notifications table
CREATE TABLE Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
    NotificationType NVARCHAR(50) NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message NVARCHAR(1000) NOT NULL,
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- Create indexes for better performance
CREATE INDEX IX_Transactions_UserID_Date ON Transactions(UserID, TransactionDate DESC);
CREATE INDEX IX_Transactions_CategoryID ON Transactions(CategoryID);
CREATE INDEX IX_Categories_UserID_Type ON Categories(UserID, CategoryType);
CREATE INDEX IX_Budgets_UserID_Month_Year ON Budgets(UserID, BudgetMonth, BudgetYear);
CREATE INDEX IX_UserSettings_UserID_Key ON UserSettings(UserID, SettingKey);
CREATE INDEX IX_Notifications_UserID_Read ON Notifications(UserID, IsRead);

PRINT 'Database schema created successfully!';