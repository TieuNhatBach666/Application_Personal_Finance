-- Update schema to match our design
USE PersonalFinanceDB;
GO

-- Check and create missing tables/columns
-- First, let's see what we have
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('Users', 'Categories', 'Transactions', 'Budgets', 'UserSettings', 'Notifications')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- Create UserSettings table if not exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'UserSettings')
BEGIN
    CREATE TABLE UserSettings (
        SettingID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
        SettingKey NVARCHAR(100) NOT NULL,
        SettingValue NVARCHAR(500),
        CreatedAt DATETIME2 DEFAULT GETDATE(),
        UpdatedAt DATETIME2 DEFAULT GETDATE(),
        UNIQUE(UserID, SettingKey)
    );
    PRINT 'UserSettings table created';
END

-- Create Notifications table if not exists
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Notifications')
BEGIN
    CREATE TABLE Notifications (
        NotificationID INT IDENTITY(1,1) PRIMARY KEY,
        UserID INT FOREIGN KEY REFERENCES Users(UserID) ON DELETE CASCADE,
        NotificationType NVARCHAR(50) NOT NULL,
        Title NVARCHAR(200) NOT NULL,
        Message NVARCHAR(1000) NOT NULL,
        IsRead BIT DEFAULT 0,
        CreatedAt DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Notifications table created';
END

-- Add missing columns to existing tables if needed
-- Check Users table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'PhoneNumber')
BEGIN
    ALTER TABLE Users ADD PhoneNumber NVARCHAR(20);
    PRINT 'Added PhoneNumber to Users table';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'IsActive')
BEGIN
    ALTER TABLE Users ADD IsActive BIT DEFAULT 1;
    PRINT 'Added IsActive to Users table';
END

-- Check Categories table
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Categories' AND COLUMN_NAME = 'IconName')
BEGIN
    ALTER TABLE Categories ADD IconName NVARCHAR(50) DEFAULT 'default';
    PRINT 'Added IconName to Categories table';
END

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Categories' AND COLUMN_NAME = 'ColorCode')
BEGIN
    ALTER TABLE Categories ADD ColorCode NVARCHAR(7) DEFAULT '#3498db';
    PRINT 'Added ColorCode to Categories table';
END

-- Create indexes if they don't exist
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Transactions_UserID_Date')
BEGIN
    CREATE INDEX IX_Transactions_UserID_Date ON Transactions(UserID, TransactionDate DESC);
    PRINT 'Created index IX_Transactions_UserID_Date';
END

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Categories_UserID_Type')
BEGIN
    CREATE INDEX IX_Categories_UserID_Type ON Categories(UserID, CategoryType);
    PRINT 'Created index IX_Categories_UserID_Type';
END

PRINT 'Schema update completed successfully!';