-- =============================================
-- PERSONAL FINANCE MANAGER - DATABASE HOÀN CHỈNH TỔNG HỢP
-- © Tiểu Nhất Bạch 2025
-- Mô tả: File SQL duy nhất chứa đầy đủ mọi thứ cần thiết cho dự án
-- Phiên bản: 2.1 - Đã sửa lỗi batch
-- =============================================

-- 🎯 HƯỚNG DẪN SỬ DỤNG:
-- 1. Mở SQL Server Management Studio (SSMS)
-- 2. Kết nối với server: TIEUNHATBACH666\TIEUNHATBACH (sa/123456)
-- 3. Chạy toàn bộ file này (F5)
-- 4. Database sẽ được tạo hoàn chỉnh với dữ liệu mẫu
-- 5. Sử dụng tài khoản: nguoidung@vidu.com / 123456

USE master;
GO

PRINT '🚀 BẮT ĐẦU THIẾT LẬP PERSONAL FINANCE MANAGER DATABASE';
PRINT '📅 Thời gian: ' + CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '👤 Tác giả: Tiểu Nhất Bạch';
PRINT '🎯 Mục tiêu: Tạo database hoàn chỉnh với tất cả chức năng';
PRINT '💎 Bản quyền: © Tiểu Nhất Bạch 2025';
PRINT '';

-- =============================================
-- BƯỚC 1: TẠO DATABASE
-- =============================================

PRINT '📊 BƯỚC 1: Tạo Database PersonalFinanceDB...';

-- Xóa database cũ nếu tồn tại
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'PersonalFinanceDB')
BEGIN
    ALTER DATABASE PersonalFinanceDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE PersonalFinanceDB;
    PRINT '🗑️ Đã xóa database cũ';
END

-- Tạo database mới với cấu hình tối ưu
CREATE DATABASE PersonalFinanceDB
ON (
    NAME = 'PersonalFinanceDB',
    FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL16.TIEUNHATBACH\MSSQL\DATA\PersonalFinanceDB.mdf',
    SIZE = 100MB,
    MAXSIZE = 1GB,
    FILEGROWTH = 10MB
)
LOG ON (
    NAME = 'PersonalFinanceDB_Log',
    FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL16.TIEUNHATBACH\MSSQL\DATA\PersonalFinanceDB_Log.ldf',
    SIZE = 10MB,
    MAXSIZE = 100MB,
    FILEGROWTH = 5MB
);

PRINT '✅ Database PersonalFinanceDB đã được tạo thành công';
GO

USE PersonalFinanceDB;
GO

-- =============================================
-- BƯỚC 2: TẠO CÁC BẢNG CHÍNH
-- =============================================

PRINT '🏗️ BƯỚC 2: Tạo các bảng chính...';

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
    LastLoginAt DATETIME2 NULL,
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
    Description NVARCHAR(500) NULL,
    IsActive BIT DEFAULT 1,
    SortOrder INT DEFAULT 0,
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
    Location NVARCHAR(200) NULL,
    PaymentMethod NVARCHAR(50) DEFAULT 'Cash',
    IsRecurring BIT DEFAULT 0,
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
    SpentAmount DECIMAL(15,2) DEFAULT 0,
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
    Description NVARCHAR(200) NULL,
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
    BackupPath NVARCHAR(500) NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'pending',
    ErrorMessage NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    CompletedAt DATETIME2 NULL,
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
PRINT '✅ Bảng BackupHistory đã được tạo';

-- Bảng AuditLog - Nhật ký kiểm toán
CREATE TABLE AuditLog (
    AuditID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NULL,
    TableName NVARCHAR(100) NOT NULL,
    Operation NVARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    RecordID NVARCHAR(100) NOT NULL,
    OldValues NVARCHAR(MAX) NULL,
    NewValues NVARCHAR(MAX) NULL,
    IPAddress NVARCHAR(45) NULL,
    UserAgent NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE SET NULL
);
PRINT '✅ Bảng AuditLog đã được tạo';
GO

-- =============================================
-- BƯỚC 3: TẠO INDEXES CHO HIỆU SUẤT
-- =============================================

PRINT '📊 BƯỚC 3: Tạo indexes cho hiệu suất...';

-- Indexes cho bảng Users
CREATE INDEX IX_Users_Email ON Users(Email);
CREATE INDEX IX_Users_IsActive ON Users(IsActive);
CREATE INDEX IX_Users_CreatedAt ON Users(CreatedAt DESC);

-- Indexes cho bảng Transactions
CREATE INDEX IX_Transactions_UserID_Date ON Transactions(UserID, TransactionDate DESC);
CREATE INDEX IX_Transactions_CategoryID ON Transactions(CategoryID);
CREATE INDEX IX_Transactions_Type_Date ON Transactions(Type, TransactionDate DESC);
CREATE INDEX IX_Transactions_Amount ON Transactions(Amount DESC);
CREATE INDEX IX_Transactions_PaymentMethod ON Transactions(PaymentMethod);

-- Indexes cho bảng Categories
CREATE INDEX IX_Categories_UserID_Type ON Categories(UserID, Type);
CREATE INDEX IX_Categories_Type_Active ON Categories(Type, IsActive);
CREATE INDEX IX_Categories_ParentCategoryID ON Categories(ParentCategoryID);

-- Indexes cho bảng Budgets
CREATE INDEX IX_Budgets_UserID_Period ON Budgets(UserID, Period);
CREATE INDEX IX_Budgets_CategoryID ON Budgets(CategoryID);
CREATE INDEX IX_Budgets_StartDate_EndDate ON Budgets(StartDate, EndDate);
CREATE INDEX IX_Budgets_IsActive ON Budgets(IsActive);

-- Indexes cho bảng UserSettings
CREATE INDEX IX_UserSettings_UserID_Category ON UserSettings(UserID, Category);
CREATE INDEX IX_UserSettings_SettingKey ON UserSettings(SettingKey);

-- Indexes cho bảng Notifications
CREATE INDEX IX_Notifications_UserID_IsRead_CreatedAt ON Notifications(UserID, IsRead, CreatedAt DESC);
CREATE INDEX IX_Notifications_Type_Priority ON Notifications(Type, Priority);
CREATE INDEX IX_Notifications_ExpiresAt ON Notifications(ExpiresAt);

-- Indexes cho bảng RecurringTransactions
CREATE INDEX IX_RecurringTransactions_UserID ON RecurringTransactions(UserID);
CREATE INDEX IX_RecurringTransactions_NextDueDate ON RecurringTransactions(NextDueDate);
CREATE INDEX IX_RecurringTransactions_IsActive ON RecurringTransactions(IsActive);

-- Indexes cho bảng BackupHistory
CREATE INDEX IX_BackupHistory_UserID_CreatedAt ON BackupHistory(UserID, CreatedAt DESC);
CREATE INDEX IX_BackupHistory_Status ON BackupHistory(Status);

-- Indexes cho bảng AuditLog
CREATE INDEX IX_AuditLog_UserID_CreatedAt ON AuditLog(UserID, CreatedAt DESC);
CREATE INDEX IX_AuditLog_TableName_Operation ON AuditLog(TableName, Operation);

PRINT '✅ Tất cả indexes đã được tạo để tối ưu hiệu suất';
GO

-- =============================================
-- BƯỚC 4: TẠO VIEWS
-- =============================================

PRINT '👁️ BƯỚC 4: Tạo các Views...';
GO

-- View tổng quan giao dịch
CREATE VIEW vw_TransactionSummary AS
SELECT 
    t.UserID,
    t.TransactionDate,
    c.CategoryName,
    c.Type as CategoryType,
    t.Amount,
    t.Description,
    t.PaymentMethod,
    YEAR(t.TransactionDate) as Year,
    MONTH(t.TransactionDate) as Month,
    DAY(t.TransactionDate) as Day
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
WHERE t.UserID IS NOT NULL;
GO

PRINT '✅ View vw_TransactionSummary đã được tạo';
GO

-- View thống kê ngân sách
CREATE VIEW vw_BudgetProgress AS
SELECT 
    b.BudgetID,
    b.UserID,
    b.BudgetName,
    c.CategoryName,
    b.BudgetAmount,
    b.SpentAmount,
    CASE 
        WHEN b.BudgetAmount > 0 THEN (b.SpentAmount / b.BudgetAmount) * 100
        ELSE 0
    END as ProgressPercentage,
    b.AlertThreshold,
    CASE 
        WHEN b.BudgetAmount > 0 AND (b.SpentAmount / b.BudgetAmount) * 100 >= b.AlertThreshold THEN 1
        ELSE 0
    END as IsOverThreshold,
    b.Period,
    b.StartDate,
    b.EndDate,
    b.IsActive
FROM Budgets b
INNER JOIN Categories c ON b.CategoryID = c.CategoryID;
GO

PRINT '✅ View vw_BudgetProgress đã được tạo';
GO

-- View thống kê thu chi theo tháng
CREATE VIEW vw_MonthlyIncomeExpense AS
SELECT 
    UserID,
    YEAR(TransactionDate) as Year,
    MONTH(TransactionDate) as Month,
    SUM(CASE WHEN Type = 'Income' THEN Amount ELSE 0 END) as TotalIncome,
    SUM(CASE WHEN Type = 'Expense' THEN Amount ELSE 0 END) as TotalExpense,
    SUM(CASE WHEN Type = 'Income' THEN Amount ELSE -Amount END) as NetAmount,
    COUNT(*) as TransactionCount
FROM Transactions
GROUP BY UserID, YEAR(TransactionDate), MONTH(TransactionDate);
GO

PRINT '✅ View vw_MonthlyIncomeExpense đã được tạo';
GO

-- =============================================
-- BƯỚC 5: TẠO FUNCTIONS
-- =============================================

PRINT '⚙️ BƯỚC 5: Tạo các Functions...';
GO

-- Function tính tiến độ ngân sách
CREATE FUNCTION fn_GetBudgetProgress(@BudgetID UNIQUEIDENTIFIER)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        b.BudgetID,
        b.BudgetName,
        b.BudgetAmount,
        ISNULL(SUM(t.Amount), 0) as SpentAmount,
        CASE 
            WHEN b.BudgetAmount > 0 THEN (ISNULL(SUM(t.Amount), 0) / b.BudgetAmount) * 100
            ELSE 0
        END as ProgressPercentage
    FROM Budgets b
    LEFT JOIN Transactions t ON b.CategoryID = t.CategoryID 
        AND b.UserID = t.UserID
        AND t.TransactionDate BETWEEN b.StartDate AND b.EndDate
        AND t.Type = 'Expense'
    WHERE b.BudgetID = @BudgetID
    GROUP BY b.BudgetID, b.BudgetName, b.BudgetAmount
);
GO

PRINT '✅ Function fn_GetBudgetProgress đã được tạo';
GO

-- Function tính tổng thu chi theo khoảng thời gian
CREATE FUNCTION fn_GetIncomeExpenseSummary(
    @UserID UNIQUEIDENTIFIER,
    @StartDate DATE,
    @EndDate DATE
)
RETURNS TABLE
AS
RETURN
(
    SELECT 
        SUM(CASE WHEN Type = 'Income' THEN Amount ELSE 0 END) as TotalIncome,
        SUM(CASE WHEN Type = 'Expense' THEN Amount ELSE 0 END) as TotalExpense,
        SUM(CASE WHEN Type = 'Income' THEN Amount ELSE -Amount END) as NetAmount,
        COUNT(*) as TransactionCount
    FROM Transactions
    WHERE UserID = @UserID 
        AND TransactionDate BETWEEN @StartDate AND @EndDate
);
GO

PRINT '✅ Function fn_GetIncomeExpenseSummary đã được tạo';
GO

-- =============================================
-- BƯỚC 6: TẠO STORED PROCEDURES
-- =============================================

PRINT '🔧 BƯỚC 6: Tạo các Stored Procedures...';
GO

-- Procedure tạo categories mặc định cho user mới
CREATE PROCEDURE sp_CreateDefaultCategoriesForUser
    @UserID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Sao chép categories mặc định cho user mới
    INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color, Description)
    SELECT 
        @UserID,
        CategoryName,
        Type,
        Icon,
        Color,
        Description
    FROM Categories 
    WHERE UserID = '00000000-0000-0000-0000-000000000000';
    
    SELECT @@ROWCOUNT as CategoriesCreated;
END;
GO

PRINT '✅ Procedure sp_CreateDefaultCategoriesForUser đã được tạo';
GO

-- Procedure xử lý giao dịch định kỳ
CREATE PROCEDURE sp_ProcessRecurringTransactions
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @ProcessedCount INT = 0;
    
    -- Cursor để xử lý từng giao dịch định kỳ
    DECLARE recurring_cursor CURSOR FOR
    SELECT RecurringID, UserID, CategoryID, Description, Amount, Type, Frequency, NextDueDate
    FROM RecurringTransactions
    WHERE IsActive = 1 AND NextDueDate <= GETDATE();
    
    DECLARE @RecurringID UNIQUEIDENTIFIER, @UserID UNIQUEIDENTIFIER, @CategoryID UNIQUEIDENTIFIER;
    DECLARE @Description NVARCHAR(255), @Amount DECIMAL(15,2), @Type NVARCHAR(10);
    DECLARE @Frequency NVARCHAR(20), @NextDueDate DATE, @NewTransactionID UNIQUEIDENTIFIER;
    
    OPEN recurring_cursor;
    FETCH NEXT FROM recurring_cursor INTO @RecurringID, @UserID, @CategoryID, @Description, @Amount, @Type, @Frequency, @NextDueDate;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Tạo giao dịch mới
        SET @NewTransactionID = NEWID();
        INSERT INTO Transactions (TransactionID, UserID, CategoryID, Amount, Type, Description, TransactionDate, IsRecurring)
        VALUES (@NewTransactionID, @UserID, @CategoryID, @Amount, @Type, @Description, @NextDueDate, 1);
        
        -- Lưu lịch sử
        INSERT INTO RecurringTransactionHistory (RecurringID, TransactionID)
        VALUES (@RecurringID, @NewTransactionID);
        
        -- Cập nhật NextDueDate
        DECLARE @NewNextDueDate DATE;
        SET @NewNextDueDate = CASE 
            WHEN @Frequency = 'Daily' THEN DATEADD(DAY, 1, @NextDueDate)
            WHEN @Frequency = 'Weekly' THEN DATEADD(WEEK, 1, @NextDueDate)
            WHEN @Frequency = 'Monthly' THEN DATEADD(MONTH, 1, @NextDueDate)
            WHEN @Frequency = 'Quarterly' THEN DATEADD(QUARTER, 1, @NextDueDate)
            WHEN @Frequency = 'Yearly' THEN DATEADD(YEAR, 1, @NextDueDate)
            ELSE @NextDueDate
        END;
        
        UPDATE RecurringTransactions 
        SET NextDueDate = @NewNextDueDate, UpdatedAt = GETUTCDATE()
        WHERE RecurringID = @RecurringID;
        
        SET @ProcessedCount = @ProcessedCount + 1;
        
        FETCH NEXT FROM recurring_cursor INTO @RecurringID, @UserID, @CategoryID, @Description, @Amount, @Type, @Frequency, @NextDueDate;
    END;
    
    CLOSE recurring_cursor;
    DEALLOCATE recurring_cursor;
    
    SELECT @ProcessedCount as ProcessedTransactions;
END;
GO

PRINT '✅ Procedure sp_ProcessRecurringTransactions đã được tạo';
GO

-- Procedure cập nhật ngân sách đã chi tiêu
CREATE PROCEDURE sp_UpdateBudgetSpentAmount
    @UserID UNIQUEIDENTIFIER,
    @CategoryID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE b
    SET SpentAmount = ISNULL(spent.TotalSpent, 0),
        UpdatedAt = GETUTCDATE()
    FROM Budgets b
    LEFT JOIN (
        SELECT 
            t.CategoryID,
            SUM(t.Amount) as TotalSpent
        FROM Transactions t
        WHERE t.UserID = @UserID 
            AND t.CategoryID = @CategoryID
            AND t.Type = 'Expense'
        GROUP BY t.CategoryID
    ) spent ON b.CategoryID = spent.CategoryID
    WHERE b.UserID = @UserID 
        AND b.CategoryID = @CategoryID
        AND b.IsActive = 1;
END;
GO

PRINT '✅ Procedure sp_UpdateBudgetSpentAmount đã được tạo';
GO

-- Procedure tạo thông báo
CREATE PROCEDURE sp_CreateNotification
    @UserID UNIQUEIDENTIFIER,
    @Title NVARCHAR(200),
    @Message NVARCHAR(MAX),
    @Type NVARCHAR(50),
    @Priority NVARCHAR(20) = 'medium',
    @ActionUrl NVARCHAR(500) = NULL,
    @ExpiresAt DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Notifications (UserID, Title, Message, Type, Priority, ActionUrl, ExpiresAt)
    VALUES (@UserID, @Title, @Message, @Type, @Priority, @ActionUrl, @ExpiresAt);
    
    SELECT SCOPE_IDENTITY() as NotificationID;
END;
GO

PRINT '✅ Procedure sp_CreateNotification đã được tạo';
GO

-- =============================================
-- BƯỚC 7: TẠO TRIGGERS
-- =============================================

PRINT '⚡ BƯỚC 7: Tạo các Triggers...';
GO

-- Trigger cập nhật UpdatedAt cho Users
CREATE TRIGGER tr_Users_UpdatedAt
ON Users
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE Users 
    SET UpdatedAt = GETUTCDATE()
    FROM Users u
    INNER JOIN inserted i ON u.UserID = i.UserID;
END;
GO

PRINT '✅ Trigger tr_Users_UpdatedAt đã được tạo';
GO

-- Trigger cập nhật ngân sách khi có giao dịch mới
CREATE TRIGGER tr_Transactions_UpdateBudget
ON Transactions
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Cập nhật cho transactions mới hoặc được sửa
    IF EXISTS (SELECT 1 FROM inserted)
    BEGIN
        UPDATE b
        SET SpentAmount = ISNULL(spent.TotalSpent, 0),
            UpdatedAt = GETUTCDATE()
        FROM Budgets b
        INNER JOIN inserted i ON b.UserID = i.UserID AND b.CategoryID = i.CategoryID
        LEFT JOIN (
            SELECT 
                t.UserID,
                t.CategoryID,
                SUM(t.Amount) as TotalSpent
            FROM Transactions t
            INNER JOIN inserted i2 ON t.UserID = i2.UserID AND t.CategoryID = i2.CategoryID
            WHERE t.Type = 'Expense'
            GROUP BY t.UserID, t.CategoryID
        ) spent ON b.UserID = spent.UserID AND b.CategoryID = spent.CategoryID
        WHERE b.IsActive = 1;
    END;
    
    -- Cập nhật cho transactions bị xóa
    IF EXISTS (SELECT 1 FROM deleted)
    BEGIN
        UPDATE b
        SET SpentAmount = ISNULL(spent.TotalSpent, 0),
            UpdatedAt = GETUTCDATE()
        FROM Budgets b
        INNER JOIN deleted d ON b.UserID = d.UserID AND b.CategoryID = d.CategoryID
        LEFT JOIN (
            SELECT 
                t.UserID,
                t.CategoryID,
                SUM(t.Amount) as TotalSpent
            FROM Transactions t
            INNER JOIN deleted d2 ON t.UserID = d2.UserID AND t.CategoryID = d2.CategoryID
            WHERE t.Type = 'Expense'
            GROUP BY t.UserID, t.CategoryID
        ) spent ON b.UserID = spent.UserID AND b.CategoryID = spent.CategoryID
        WHERE b.IsActive = 1;
    END;
END;
GO

PRINT '✅ Trigger tr_Transactions_UpdateBudget đã được tạo';
GO

-- =============================================
-- BƯỚC 8: CHÈN DỮ LIỆU MẶC ĐỊNH
-- =============================================

PRINT '📝 BƯỚC 8: Chèn dữ liệu mặc định...';

-- Insert default categories với DEFAULT_CATEGORIES_USER_ID
DECLARE @DefaultUserID UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000000';

-- Categories Thu nhập
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color, Description, SortOrder) VALUES
(@DefaultUserID, N'Lương', 'Income', 'salary', '#27ae60', N'Lương cơ bản hàng tháng', 1),
(@DefaultUserID, N'Thưởng', 'Income', 'bonus', '#f39c12', N'Thưởng hiệu suất, thưởng lễ tết', 2),
(@DefaultUserID, N'Phụ cấp', 'Income', 'allowance', '#3498db', N'Phụ cấp xăng xe, ăn trưa, điện thoại', 3),
(@DefaultUserID, N'Đầu tư', 'Income', 'investment', '#9b59b6', N'Lợi nhuận từ đầu tư, cổ tức', 4),
(@DefaultUserID, N'Kinh doanh', 'Income', 'business', '#e67e22', N'Thu nhập từ kinh doanh riêng', 5),
(@DefaultUserID, N'Freelance', 'Income', 'freelance', '#1abc9c', N'Thu nhập từ công việc tự do', 6),
(@DefaultUserID, N'Thu nhập khác', 'Income', 'other', '#95a5a6', N'Các khoản thu nhập khác', 7);

-- Categories Chi tiêu
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color, Description, SortOrder) VALUES
(@DefaultUserID, N'Ăn uống', 'Expense', 'food', '#e74c3c', N'Chi phí ăn uống hàng ngày', 1),
(@DefaultUserID, N'Đi lại', 'Expense', 'transport', '#3498db', N'Xăng xe, xe bus, taxi, grab', 2),
(@DefaultUserID, N'Học tập', 'Expense', 'education', '#9b59b6', N'Học phí, sách vở, khóa học', 3),
(@DefaultUserID, N'Giải trí', 'Expense', 'entertainment', '#f39c12', N'Xem phim, du lịch, game', 4),
(@DefaultUserID, N'Y tế', 'Expense', 'healthcare', '#e67e22', N'Khám bệnh, thuốc men, bảo hiểm', 5),
(@DefaultUserID, N'Mua sắm', 'Expense', 'shopping', '#e91e63', N'Quần áo, mỹ phẩm, đồ dùng', 6),
(@DefaultUserID, N'Hóa đơn', 'Expense', 'bills', '#607d8b', N'Điện, nước, internet, điện thoại', 7),
(@DefaultUserID, N'Nhà ở', 'Expense', 'housing', '#795548', N'Tiền thuê nhà, sửa chữa', 8),
(@DefaultUserID, N'Bảo hiểm', 'Expense', 'insurance', '#455a64', N'Bảo hiểm xe, nhà, sức khỏe', 9),
(@DefaultUserID, N'Tiết kiệm', 'Expense', 'savings', '#4caf50', N'Gửi tiết kiệm, đầu tư', 10),
(@DefaultUserID, N'Chi tiêu khác', 'Expense', 'other', '#95a5a6', N'Các khoản chi tiêu khác', 11);

PRINT '✅ Đã chèn ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' default categories';

-- Insert sample user với bcrypt hashed password cho "123456"
DECLARE @UserID UNIQUEIDENTIFIER = NEWID();
INSERT INTO Users (UserID, Email, PasswordHash, FirstName, LastName, PhoneNumber, IsEmailVerified)
VALUES (@UserID, 'nguoidung@vidu.com', '$2a$12$rG0k0U2JzTY/yXz2fey.0eJ6H8A2QzKq6O3jD0WJZ6yFvDQ2q9.0G', N'Nguyễn', N'Văn A', '0123456789', 1);
PRINT '✅ Đã tạo user mẫu với email: nguoidung@vidu.com và mật khẩu: 123456';

-- Tạo categories cho user mẫu
EXEC sp_CreateDefaultCategoriesForUser @UserID;
PRINT '✅ Đã tạo categories cho user mẫu';

-- Insert sample transactions với dữ liệu thực tế
DECLARE @SalaryCategoryID UNIQUEIDENTIFIER, @FoodCategoryID UNIQUEIDENTIFIER, @TransportCategoryID UNIQUEIDENTIFIER;
DECLARE @BillsCategoryID UNIQUEIDENTIFIER, @EntertainmentCategoryID UNIQUEIDENTIFIER, @BonusCategoryID UNIQUEIDENTIFIER;

SELECT @SalaryCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Lương';
SELECT @FoodCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Ăn uống';
SELECT @TransportCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Đi lại';
SELECT @BillsCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Hóa đơn';
SELECT @EntertainmentCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Giải trí';
SELECT @BonusCategoryID = CategoryID FROM Categories WHERE UserID = @UserID AND CategoryName = N'Thưởng';

-- Giao dịch tháng 1/2025
INSERT INTO Transactions (UserID, CategoryID, Amount, Type, TransactionDate, Description, PaymentMethod) VALUES
(@UserID, @SalaryCategoryID, 15000000, 'Income', '2025-01-01', N'Lương tháng 1/2025', 'Bank Transfer'),
(@UserID, @BonusCategoryID, 2000000, 'Income', '2025-01-05', N'Thưởng Tết Nguyên Đán', 'Bank Transfer'),
(@UserID, @FoodCategoryID, 350000, 'Expense', '2025-01-02', N'Ăn sáng - Phở bò', 'Cash'),
(@UserID, @FoodCategoryID, 450000, 'Expense', '2025-01-02', N'Ăn trưa - Cơm văn phòng', 'E-Wallet'),
(@UserID, @TransportCategoryID, 120000, 'Expense', '2025-01-02', N'Grab đi làm', 'E-Wallet'),
(@UserID, @BillsCategoryID, 850000, 'Expense', '2025-01-03', N'Tiền điện tháng 12/2024', 'Bank Transfer'),
(@UserID, @BillsCategoryID, 320000, 'Expense', '2025-01-03', N'Tiền nước tháng 12/2024', 'Bank Transfer'),
(@UserID, @EntertainmentCategoryID, 280000, 'Expense', '2025-01-04', N'Xem phim CGV', 'Credit Card'),
(@UserID, @FoodCategoryID, 680000, 'Expense', '2025-01-05', N'Ăn tối - Lẩu Thái', 'Credit Card');

PRINT '✅ Đã chèn ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' transactions mẫu';

-- Insert sample budgets
INSERT INTO Budgets (UserID, CategoryID, BudgetName, BudgetAmount, Period, StartDate, EndDate, AlertThreshold)
VALUES 
(@UserID, @FoodCategoryID, N'Ngân sách ăn uống tháng 1', 3000000, 'monthly', '2025-01-01', '2025-01-31', 80),
(@UserID, @TransportCategoryID, N'Ngân sách đi lại tháng 1', 1500000, 'monthly', '2025-01-01', '2025-01-31', 75),
(@UserID, @EntertainmentCategoryID, N'Ngân sách giải trí tháng 1', 2000000, 'monthly', '2025-01-01', '2025-01-31', 85);

PRINT '✅ Đã tạo ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' budgets mẫu';

-- Insert sample settings
INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category, Description)
VALUES
(@UserID, 'general.currency', 'VND', 'string', 'general', N'Đơn vị tiền tệ mặc định'),
(@UserID, 'general.language', 'vi', 'string', 'general', N'Ngôn ngữ giao diện'),
(@UserID, 'general.timezone', 'Asia/Ho_Chi_Minh', 'string', 'general', N'múi giờ'),
(@UserID, 'appearance.theme', 'light', 'string', 'appearance', N'Giao diện sáng/tối'),
(@UserID, 'appearance.color_scheme', 'blue', 'string', 'appearance', N'Bảng màu chủ đạo'),
(@UserID, 'notifications.push', 'true', 'boolean', 'notifications', N'Thông báo đẩy'),
(@UserID, 'notifications.email', 'true', 'boolean', 'notifications', N'Thông báo email'),
(@UserID, 'notifications.budget', 'true', 'boolean', 'notifications', N'Cảnh báo ngân sách'),
(@UserID, 'notifications.recurring', 'true', 'boolean', 'notifications', N'Nhắc nhở giao dịch định kỳ'),
(@UserID, 'privacy.show_profile', 'true', 'boolean', 'privacy', N'Hiển thị thông tin cá nhân'),
(@UserID, 'privacy.share_data', 'false', 'boolean', 'privacy', N'Chia sẻ dữ liệu thống kê'),
(@UserID, 'backup.auto_backup', 'true', 'boolean', 'backup', N'Tự động sao lưu'),
(@UserID, 'backup.backup_frequency', 'weekly', 'string', 'backup', N'Tần suất sao lưu');

PRINT '✅ Đã chèn ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' settings mẫu';

-- Insert sample notifications
INSERT INTO Notifications (UserID, Title, Message, Type, Priority, IsRead)
VALUES
(@UserID, N'🎉 Chào mừng bạn!', N'Chào mừng bạn đến với ứng dụng Quản Lý Tài Chính Cá Nhân. Hãy bắt đầu bằng việc thêm giao dịch đầu tiên của bạn!', 'welcome', 'medium', 0),
(@UserID, N'💰 Lương đã được ghi nhận', N'Lương tháng 1/2025 (15,000,000 VND) đã được thêm vào tài khoản của bạn.', 'income', 'low', 1),
(@UserID, N'⚠️ Cảnh báo ngân sách', N'Bạn đã sử dụng 52% ngân sách ăn uống trong tháng này. Hãy chú ý chi tiêu!', 'budget', 'medium', 0),
(@UserID, N'📊 Báo cáo tuần', N'Báo cáo tài chính tuần này đã sẵn sàng. Bạn đã tiết kiệm được 2,150,000 VND.', 'report', 'low', 0);

PRINT '✅ Đã chèn ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' notifications mẫu';

-- Insert sample recurring transaction
INSERT INTO RecurringTransactions (UserID, CategoryID, Description, Amount, Type, Frequency, StartDate, NextDueDate)
VALUES 
(@UserID, @SalaryCategoryID, N'Lương hàng tháng', 15000000, 'Income', 'Monthly', '2025-01-01', '2025-02-01'),
(@UserID, @BillsCategoryID, N'Tiền điện hàng tháng', 800000, 'Expense', 'Monthly', '2025-01-03', '2025-02-03');

PRINT '✅ Đã tạo ' + CAST(@@ROWCOUNT AS NVARCHAR) + ' recurring transactions mẫu';

-- Cập nhật spent amount cho budgets
EXEC sp_UpdateBudgetSpentAmount @UserID, @FoodCategoryID;
EXEC sp_UpdateBudgetSpentAmount @UserID, @TransportCategoryID;
EXEC sp_UpdateBudgetSpentAmount @UserID, @EntertainmentCategoryID;

PRINT '✅ Đã cập nhật spent amount cho budgets';
GO

-- =============================================
-- BƯỚC 9: TẠO JOB SCHEDULER (SQL AGENT)
-- =============================================

PRINT '⏰ BƯỚC 9: Tạo SQL Agent Jobs...';

-- Job xử lý giao dịch định kỳ hàng ngày
IF NOT EXISTS (SELECT name FROM msdb.dbo.sysjobs WHERE name = 'PersonalFinance_ProcessRecurringTransactions')
BEGIN
    EXEC msdb.dbo.sp_add_job
        @job_name = 'PersonalFinance_ProcessRecurringTransactions',
        @description = 'Xử lý giao dịch định kỳ hàng ngày cho Personal Finance Manager';
    
    EXEC msdb.dbo.sp_add_jobstep
        @job_name = 'PersonalFinance_ProcessRecurringTransactions',
        @step_name = 'Process Recurring Transactions',
        @command = 'EXEC PersonalFinanceDB.dbo.sp_ProcessRecurringTransactions',
        @database_name = 'PersonalFinanceDB';
    
    EXEC msdb.dbo.sp_add_schedule
        @schedule_name = 'Daily_6AM',
        @freq_type = 4, -- Daily
        @freq_interval = 1,
        @active_start_time = 060000; -- 6:00 AM
    
    EXEC msdb.dbo.sp_attach_schedule
        @job_name = 'PersonalFinance_ProcessRecurringTransactions',
        @schedule_name = 'Daily_6AM';
    
    EXEC msdb.dbo.sp_add_jobserver
        @job_name = 'PersonalFinance_ProcessRecurringTransactions';
    
    PRINT '✅ Job ProcessRecurringTransactions đã được tạo';
END
ELSE
BEGIN
    PRINT '⚠️ Job ProcessRecurringTransactions đã tồn tại';
END
GO

-- =============================================
-- BƯỚC 10: THỐNG KÊ VÀ HOÀN TẤT
-- =============================================

PRINT '';
PRINT '🎉 THIẾT LẬP DATABASE HOÀN TẤT!';
PRINT '';
PRINT '📋 THÔNG TIN ĐĂNG NHẬP MẪU:';
PRINT '   📧 Email: nguoidung@vidu.com';
PRINT '   🔑 Mật khẩu: 123456';
PRINT '';
PRINT '📊 THỐNG KÊ DATABASE:';

-- Đếm và hiển thị số lượng records
DECLARE @UserCount INT, @CategoryCount INT, @TransactionCount INT, @BudgetCount INT;
DECLARE @SettingCount INT, @NotificationCount INT, @RecurringCount INT;

SELECT @UserCount = COUNT(*) FROM Users;
SELECT @CategoryCount = COUNT(*) FROM Categories;
SELECT @TransactionCount = COUNT(*) FROM Transactions;
SELECT @BudgetCount = COUNT(*) FROM Budgets;
SELECT @SettingCount = COUNT(*) FROM UserSettings;
SELECT @NotificationCount = COUNT(*) FROM Notifications;
SELECT @RecurringCount = COUNT(*) FROM RecurringTransactions;

PRINT '   - Users: ' + CAST(@UserCount AS NVARCHAR);
PRINT '   - Categories: ' + CAST(@CategoryCount AS NVARCHAR);
PRINT '   - Transactions: ' + CAST(@TransactionCount AS NVARCHAR);
PRINT '   - Budgets: ' + CAST(@BudgetCount AS NVARCHAR);
PRINT '   - UserSettings: ' + CAST(@SettingCount AS NVARCHAR);
PRINT '   - Notifications: ' + CAST(@NotificationCount AS NVARCHAR);
PRINT '   - RecurringTransactions: ' + CAST(@RecurringCount AS NVARCHAR);
PRINT '';

PRINT '🔧 CÁC OBJECTS ĐÃ TẠO:';
PRINT '   - Tables: 10 bảng chính';
PRINT '   - Views: 3 views thống kê';
PRINT '   - Functions: 2 functions tiện ích';
PRINT '   - Stored Procedures: 4 procedures';
PRINT '   - Triggers: 2 triggers tự động';
PRINT '   - Indexes: 20+ indexes tối ưu';
PRINT '   - SQL Agent Jobs: 1 job tự động';
PRINT '';

PRINT '🚀 SẴN SÀNG SỬ DỤNG PERSONAL FINANCE MANAGER!';
PRINT '👤 Tác giả: Tiểu Nhất Bạch';
PRINT '📅 Hoàn thành: ' + CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '💎 Bản quyền: © Tiểu Nhất Bạch 2025';
PRINT '';
PRINT '🔗 THÔNG TIN KẾT NỐI:';
PRINT '   Server: TIEUNHATBACH666\TIEUNHATBACH';
PRINT '   Database: PersonalFinanceDB';
PRINT '   Login: sa / Password: 123456';
PRINT '';
PRINT '🎯 Chỉ cần chạy file này là có thể sử dụng ngay!';
PRINT '📖 Để khởi động ứng dụng:';
PRINT '   Backend: cd backend && npm run dev';
PRINT '   Frontend: cd frontend && npm run dev';
PRINT '';
PRINT '✨ DATABASE ĐÃ SẴN SÀNG VỚI ĐẦY ĐỦ CHỨC NĂNG!';

-- End of script
-- © Tiểu Nhất Bạch 2025