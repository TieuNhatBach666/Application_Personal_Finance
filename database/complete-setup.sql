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

PRINT '🗑️ BƯỚC 2: Xóa các bảng cũ (nếu có)...';

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

PRINT '✅ Các bảng cũ đã được xóa';

-- =============================================
-- BƯỚC 3: TẠO CÁC BẢNG CHÍNH
-- =============================================

PRINT '🏗️ BƯỚC 3: Tạo các bảng chính...';

-- Bảng Users
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

-- Bảng Categories
CREATE TABLE Categories (
    CategoryID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserID UNIQUEIDENTIFIER NULL, -- NULL cho default categories
    CategoryName NVARCHAR(100) NOT NULL,
    CategoryType NVARCHAR(20) CHECK (CategoryType IN ('Income', 'Expense')) NOT NULL,
    IconName NVARCHAR(50) DEFAULT 'default',
    ColorCode NVARCHAR(7) DEFAULT '#3498db',
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1,
    
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);
PRINT '✅ Bảng Categories đã được tạo';

-- Bảng Transactions
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

-- Bảng Budgets
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

-- Bảng UserSettings
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

-- Bảng Notifications
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

-- Bảng RecurringTransactions
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

-- Bảng BackupHistory
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

-- Bảng RecurringTransactionHistory
CREATE TABLE RecurringTransactionHistory (
    HistoryID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RecurringID UNIQUEIDENTIFIER NOT NULL,
    TransactionID UNIQUEIDENTIFIER NOT NULL,
    GeneratedDate DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (RecurringID) REFERENCES RecurringTransactions(RecurringID) ON DELETE CASCADE,
    FOREIGN KEY (TransactionID) REFERENCES Transactions(TransactionID) ON DELETE CASCADE
);
PRINT '✅ Bảng RecurringTransactionHistory đã được tạo';

-- =============================================
-- BƯỚC 4: TẠO INDEXES
-- =============================================

PRINT '📊 BƯỚC 4: Tạo indexes để tối ưu hiệu suất...';

-- Indexes cho Transactions
CREATE INDEX IX_Transactions_UserID_Date ON Transactions(UserID, Date DESC);
CREATE INDEX IX_Transactions_CategoryID ON Transactions(CategoryID);
CREATE INDEX IX_Transactions_Type_Date ON Transactions(Type, Date DESC);

-- Indexes cho Categories
CREATE INDEX IX_Categories_UserID_Type ON Categories(UserID, CategoryType);
CREATE INDEX IX_Categories_Type_Active ON Categories(CategoryType, IsActive);

-- Indexes cho Budgets
CREATE INDEX IX_Budgets_UserID_Period ON Budgets(UserID, Period);
CREATE INDEX IX_Budgets_CategoryID ON Budgets(CategoryID);
CREATE INDEX IX_Budgets_StartDate_EndDate ON Budgets(StartDate, EndDate);

-- Indexes cho UserSettings
CREATE INDEX IX_UserSettings_UserID_Category ON UserSettings(UserID, Category);

-- Indexes cho Notifications
CREATE INDEX IX_Notifications_UserID_IsRead_CreatedAt ON Notifications(UserID, IsRead, CreatedAt DESC);
CREATE INDEX IX_Notifications_Type_Priority ON Notifications(Type, Priority);

-- Indexes cho RecurringTransactions
CREATE INDEX IX_RecurringTransactions_UserID ON RecurringTransactions(UserID);
CREATE INDEX IX_RecurringTransactions_NextDueDate ON RecurringTransactions(NextDueDate);
CREATE INDEX IX_RecurringTransactions_IsActive ON RecurringTransactions(IsActive);

-- Indexes cho BackupHistory
CREATE INDEX IX_BackupHistory_UserID_CreatedAt ON BackupHistory(UserID, CreatedAt DESC);

PRINT '✅ Tất cả indexes đã được tạo';

-- =============================================
-- BƯỚC 5: TẠO STORED PROCEDURES
-- =============================================

PRINT '🔧 BƯỚC 5: Tạo stored procedures...';

-- Stored Procedure: Tạo categories mặc định cho user mới
CREATE PROCEDURE sp_CreateDefaultCategoriesForUser
    @UserID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- Copy default categories (where UserID is NULL) for the new user
    INSERT INTO Categories (UserID, CategoryName, CategoryType, IconName, ColorCode, CreatedAt, IsActive)
    SELECT
        @UserID,
        CategoryName,
        CategoryType,
        IconName,
        ColorCode,
        GETUTCDATE(),
        1
    FROM Categories
    WHERE UserID IS NULL;

    SELECT @@ROWCOUNT as CategoriesCreated;
    PRINT 'Default categories created for UserID: ' + CAST(@UserID AS NVARCHAR(36));
END
GO

-- Stored Procedure: Cập nhật số tiền đã chi trong budget
CREATE PROCEDURE sp_UpdateBudgetSpentAmount
    @UserID UNIQUEIDENTIFIER,
    @CategoryID UNIQUEIDENTIFIER
AS
BEGIN
    SET NOCOUNT ON;

    -- Cập nhật tất cả budgets active của user và category
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
END
GO

-- Stored Procedure: Lấy cài đặt người dùng
CREATE PROCEDURE sp_GetUserSettings
    @userId UNIQUEIDENTIFIER,
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

-- Stored Procedure: Lấy thông báo người dùng
CREATE PROCEDURE sp_GetUserNotifications
    @userId UNIQUEIDENTIFIER,
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
            WHEN DATEDIFF(MINUTE, CreatedAt, GETUTCDATE()) < 60
                THEN CAST(DATEDIFF(MINUTE, CreatedAt, GETUTCDATE()) AS NVARCHAR) + N' phút trước'
            WHEN DATEDIFF(HOUR, CreatedAt, GETUTCDATE()) < 24
                THEN CAST(DATEDIFF(HOUR, CreatedAt, GETUTCDATE()) AS NVARCHAR) + N' giờ trước'
            WHEN DATEDIFF(DAY, CreatedAt, GETUTCDATE()) < 7
                THEN CAST(DATEDIFF(DAY, CreatedAt, GETUTCDATE()) AS NVARCHAR) + N' ngày trước'
            ELSE FORMAT(CreatedAt, 'dd/MM/yyyy HH:mm')
        END as TimeAgo
    FROM Notifications
    WHERE UserID = @userId
        AND (@isRead IS NULL OR IsRead = @isRead)
        AND (@type IS NULL OR Type = @type)
        AND IsArchived = 0
        AND (ExpiresAt IS NULL OR ExpiresAt > GETUTCDATE())
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

-- Stored Procedure: Tạo thông báo mới
CREATE PROCEDURE sp_CreateNotification
    @userId UNIQUEIDENTIFIER,
    @title NVARCHAR(200),
    @message NVARCHAR(MAX),
    @type NVARCHAR(50),
    @priority NVARCHAR(20) = 'medium',
    @actionUrl NVARCHAR(500) = NULL,
    @expiresAt DATETIME2 = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @notificationId UNIQUEIDENTIFIER = NEWID();

    INSERT INTO Notifications (
        NotificationID, UserID, Title, Message, Type, Priority, ActionUrl, ExpiresAt
    ) VALUES (
        @notificationId, @userId, @title, @message, @type, @priority, @actionUrl, @expiresAt
    );

    SELECT @notificationId as NotificationID;
END
GO

-- Stored Procedure: Xử lý giao dịch định kỳ
CREATE PROCEDURE sp_ProcessRecurringTransactions
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Today DATE = CAST(GETUTCDATE() AS DATE);
    DECLARE @ProcessedCount INT = 0;

    -- Cursor để xử lý từng giao dịch định kỳ đến hạn
    DECLARE recurring_cursor CURSOR FOR
    SELECT
        rt.RecurringID,
        rt.UserID,
        rt.CategoryID,
        rt.Description,
        rt.Amount,
        rt.Type,
        rt.Frequency,
        rt.NextDueDate
    FROM RecurringTransactions rt
    WHERE rt.IsActive = 1
      AND rt.NextDueDate <= @Today
      AND (rt.EndDate IS NULL OR rt.EndDate >= @Today);

    DECLARE @RecurringID UNIQUEIDENTIFIER,
            @UserID UNIQUEIDENTIFIER,
            @CategoryID UNIQUEIDENTIFIER,
            @Description NVARCHAR(255),
            @Amount DECIMAL(15,2),
            @Type NVARCHAR(10),
            @Frequency NVARCHAR(20),
            @NextDueDate DATE;

    OPEN recurring_cursor;
    FETCH NEXT FROM recurring_cursor INTO
        @RecurringID, @UserID, @CategoryID, @Description, @Amount, @Type, @Frequency, @NextDueDate;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Tạo giao dịch mới
        DECLARE @NewTransactionID UNIQUEIDENTIFIER = NEWID();

        INSERT INTO Transactions (
            TransactionID, UserID, CategoryID, Description, Amount, Type, Date, CreatedAt
        ) VALUES (
            @NewTransactionID, @UserID, @CategoryID, @Description, @Amount, @Type, @Today, GETUTCDATE()
        );

        -- Ghi lại lịch sử
        INSERT INTO RecurringTransactionHistory (
            RecurringID, TransactionID
        ) VALUES (
            @RecurringID, @NewTransactionID
        );

        -- Tính toán ngày đến hạn tiếp theo
        DECLARE @NewNextDueDate DATE;

        IF @Frequency = 'Daily'
            SET @NewNextDueDate = DATEADD(DAY, 1, @NextDueDate);
        ELSE IF @Frequency = 'Weekly'
            SET @NewNextDueDate = DATEADD(WEEK, 1, @NextDueDate);
        ELSE IF @Frequency = 'Monthly'
            SET @NewNextDueDate = DATEADD(MONTH, 1, @NextDueDate);
        ELSE IF @Frequency = 'Quarterly'
            SET @NewNextDueDate = DATEADD(QUARTER, 1, @NextDueDate);
        ELSE IF @Frequency = 'Yearly'
            SET @NewNextDueDate = DATEADD(YEAR, 1, @NextDueDate);

        -- Cập nhật ngày đến hạn tiếp theo
        UPDATE RecurringTransactions
        SET NextDueDate = @NewNextDueDate,
            UpdatedAt = GETUTCDATE()
        WHERE RecurringID = @RecurringID;

        -- Cập nhật budget nếu có
        EXEC sp_UpdateBudgetSpentAmount @UserID, @CategoryID;

        SET @ProcessedCount = @ProcessedCount + 1;

        FETCH NEXT FROM recurring_cursor INTO
            @RecurringID, @UserID, @CategoryID, @Description, @Amount, @Type, @Frequency, @NextDueDate;
    END;

    CLOSE recurring_cursor;
    DEALLOCATE recurring_cursor;

    -- Trả về kết quả
    SELECT @ProcessedCount as ProcessedTransactions;
END
GO

PRINT '✅ Tất cả stored procedures đã được tạo';

-- =============================================
-- BƯỚC 6: TẠO VIEWS VÀ FUNCTIONS
-- =============================================

PRINT '📊 BƯỚC 6: Tạo views và functions...';

-- Function: Tính toán tiến độ budget
CREATE FUNCTION fn_GetBudgetProgress(@BudgetID UNIQUEIDENTIFIER)
RETURNS TABLE
AS
RETURN
(
    SELECT
        b.BudgetID,
        b.Amount as BudgetAmount,
        ISNULL(SUM(t.Amount), 0) as SpentAmount,
        CASE
            WHEN b.Amount > 0
            THEN ROUND((ISNULL(SUM(t.Amount), 0) / b.Amount) * 100, 2)
            ELSE 0
        END as PercentageUsed,
        CASE
            WHEN ISNULL(SUM(t.Amount), 0) >= b.Amount THEN 'Over Budget'
            WHEN (ISNULL(SUM(t.Amount), 0) / b.Amount) * 100 >= 90 THEN 'Danger'
            WHEN (ISNULL(SUM(t.Amount), 0) / b.Amount) * 100 >= b.WarningThreshold THEN 'Warning'
            ELSE 'On Track'
        END as Status
    FROM Budgets b
    LEFT JOIN Transactions t ON b.CategoryID = t.CategoryID
        AND b.UserID = t.UserID
        AND t.Date BETWEEN b.StartDate AND b.EndDate
        AND t.Type = 'Expense'
    WHERE b.BudgetID = @BudgetID
    GROUP BY b.BudgetID, b.Amount, b.WarningThreshold
);
GO

-- View: Tóm tắt giao dịch
CREATE VIEW vw_TransactionSummary AS
SELECT
    t.UserID,
    YEAR(t.Date) as Year,
    MONTH(t.Date) as Month,
    t.Type,
    c.CategoryName,
    c.ColorCode,
    COUNT(*) as TransactionCount,
    SUM(t.Amount) as TotalAmount,
    AVG(t.Amount) as AverageAmount
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
GROUP BY t.UserID, YEAR(t.Date), MONTH(t.Date),
         t.Type, c.CategoryName, c.ColorCode;
GO

-- View: Tóm tắt budget
CREATE VIEW vw_BudgetSummary AS
SELECT
    b.BudgetID,
    b.UserID,
    c.CategoryName,
    c.ColorCode,
    b.Amount as BudgetAmount,
    b.SpentAmount,
    b.Period,
    b.StartDate,
    b.EndDate,
    b.WarningThreshold,
    CASE
        WHEN b.Amount > 0
        THEN ROUND((b.SpentAmount / b.Amount) * 100, 2)
        ELSE 0
    END as PercentageUsed,
    CASE
        WHEN b.SpentAmount >= b.Amount THEN 'Over Budget'
        WHEN (b.SpentAmount / b.Amount) * 100 >= 90 THEN 'Danger'
        WHEN (b.SpentAmount / b.Amount) * 100 >= b.WarningThreshold THEN 'Warning'
        ELSE 'On Track'
    END as Status,
    b.IsActive
FROM Budgets b
INNER JOIN Categories c ON b.CategoryID = c.CategoryID;
GO

PRINT '✅ Views và functions đã được tạo';

-- =============================================
-- BƯỚC 7: CHÈN DỮ LIỆU MẶC ĐỊNH
-- =============================================

PRINT '📝 BƯỚC 7: Chèn dữ liệu mặc định...';

-- Chèn categories mặc định cho Income
INSERT INTO Categories (UserID, CategoryName, CategoryType, IconName, ColorCode) VALUES
(NULL, N'Lương', 'Income', 'salary', '#27ae60'),
(NULL, N'Thưởng', 'Income', 'bonus', '#f39c12'),
(NULL, N'Phụ cấp', 'Income', 'allowance', '#3498db'),
(NULL, N'Đầu tư', 'Income', 'investment', '#9b59b6'),
(NULL, N'Kinh doanh', 'Income', 'business', '#e67e22'),
(NULL, N'Thu nhập khác', 'Income', 'other', '#95a5a6');

-- Chèn categories mặc định cho Expense
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

-- =============================================
-- BƯỚC 8: HOÀN TẤT VÀ KIỂM TRA
-- =============================================

PRINT '🔍 BƯỚC 8: Kiểm tra kết quả...';

-- Kiểm tra số lượng bảng đã tạo
SELECT
    TABLE_NAME as 'Tên Bảng',
    TABLE_TYPE as 'Loại'
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;

-- Kiểm tra categories mặc định
SELECT
    CategoryType as 'Loại Danh Mục',
    COUNT(*) as 'Số Lượng'
FROM Categories
WHERE UserID IS NULL
GROUP BY CategoryType;

-- Kiểm tra stored procedures
SELECT
    ROUTINE_NAME as 'Tên Procedure',
    ROUTINE_TYPE as 'Loại'
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE'
ORDER BY ROUTINE_NAME;

-- =============================================
-- HOÀN TẤT
-- =============================================

PRINT '';
PRINT '🎉 THIẾT LẬP DATABASE HOÀN TẤT!';
PRINT '';
PRINT '📋 TÓM TẮT:';
PRINT '   ✅ Database: PersonalFinanceDB';
PRINT '   ✅ Bảng chính: 9 bảng';
PRINT '   ✅ Indexes: Đã tối ưu';
PRINT '   ✅ Stored Procedures: 6 procedures';
PRINT '   ✅ Views & Functions: 3 items';
PRINT '   ✅ Dữ liệu mặc định: 16 categories';
PRINT '';
PRINT '🚀 SẴN SÀNG SỬ DỤNG!';
PRINT '📧 Tác giả: Tiểu Nhất Bạch';
PRINT '📅 Hoàn thành: ' + CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '';

-- Kết thúc script
GO
