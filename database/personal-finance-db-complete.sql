-- =============================================
-- QUẢN LÝ TÀI CHÍNH CÁ NHÂN - DATABASE HOÀN CHỈNH
-- Tác giả: Tiểu Nhất Bạch
-- Mô tả: File SQL hoàn chỉnh để tạo database với dữ liệu mẫu
-- Người khác chỉ cần chạy file này trong SSMS là có thể sử dụng ngay
-- =============================================

USE master;
GO

-- Xóa database nếu đã tồn tại
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'PersonalFinanceDB')
BEGIN
    ALTER DATABASE PersonalFinanceDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE PersonalFinanceDB;
    PRINT '✅ Xóa database PersonalFinanceDB cũ (nếu có)';
END
GO

-- Tạo database mới
CREATE DATABASE PersonalFinanceDB;
PRINT '✅ Tạo database PersonalFinanceDB mới';
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
    CreatedAt DATETIME2 DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 DEFAULT GETUTCDATE(),
    IsActive BIT DEFAULT 1
);
PRINT '✅ Tạo bảng Users';

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
PRINT '✅ Tạo bảng Categories';

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
PRINT '✅ Tạo bảng Transactions';

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
PRINT '✅ Tạo bảng Budgets';

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
PRINT '✅ Tạo bảng UserSettings';

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
PRINT '✅ Tạo bảng Notifications';

-- Tạo bảng RecurringTransactions
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
PRINT '✅ Tạo bảng RecurringTransactions';

-- Tạo bảng BackupHistory
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
PRINT '✅ Tạo bảng BackupHistory';

-- Tạo bảng RecurringTransactionHistory
CREATE TABLE RecurringTransactionHistory (
    HistoryID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RecurringID UNIQUEIDENTIFIER NOT NULL,
    TransactionID UNIQUEIDENTIFIER NOT NULL,
    GeneratedDate DATETIME2 DEFAULT GETUTCDATE(),
    
    FOREIGN KEY (RecurringID) REFERENCES RecurringTransactions(RecurringID) ON DELETE CASCADE,
    FOREIGN KEY (TransactionID) REFERENCES Transactions(TransactionID) ON DELETE CASCADE
);
PRINT '✅ Tạo bảng RecurringTransactionHistory';

-- Tạo indexes để tối ưu hiệu suất
CREATE INDEX IX_Transactions_UserID_Date ON Transactions(UserID, Date DESC);
CREATE INDEX IX_Transactions_CategoryID ON Transactions(CategoryID);
CREATE INDEX IX_Transactions_Type_Date ON Transactions(Type, Date DESC);
CREATE INDEX IX_Categories_UserID_Type ON Categories(UserID, CategoryType);
CREATE INDEX IX_Categories_Type_Active ON Categories(CategoryType, IsActive);
CREATE INDEX IX_Budgets_UserID_Period ON Budgets(UserID, Period);
CREATE INDEX IX_Budgets_CategoryID ON Budgets(CategoryID);
CREATE INDEX IX_Budgets_StartDate_EndDate ON Budgets(StartDate, EndDate);
CREATE INDEX IX_UserSettings_UserID_Category ON UserSettings(UserID, Category);
CREATE INDEX IX_Notifications_UserID_IsRead_CreatedAt ON Notifications(UserID, IsRead, CreatedAt DESC);
CREATE INDEX IX_Notifications_Type_Priority ON Notifications(Type, Priority);
CREATE INDEX IX_RecurringTransactions_UserID ON RecurringTransactions(UserID);
CREATE INDEX IX_RecurringTransactions_NextDueDate ON RecurringTransactions(NextDueDate);
CREATE INDEX IX_RecurringTransactions_IsActive ON RecurringTransactions(IsActive);
CREATE INDEX IX_BackupHistory_UserID_CreatedAt ON BackupHistory(UserID, CreatedAt DESC);
PRINT '✅ Tạo indexes để tối ưu hiệu suất';

-- Tạo stored procedures
PRINT '🔧 Tạo stored procedures...';

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

PRINT '✅ Tạo stored procedures';

-- Tạo functions và views
PRINT '📊 Tạo functions và views...';

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

PRINT '✅ Tạo functions và views';

-- Chèn dữ liệu mẫu
PRINT '📝 Chèn dữ liệu mẫu...';

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

PRINT '✅ Chèn categories mặc định';

-- Chèn user mẫu
DECLARE @UserID UNIQUEIDENTIFIER = NEWID();
INSERT INTO Users (UserID, Email, PasswordHash, FirstName, LastName, PhoneNumber) 
VALUES (@UserID, 'nguoidung@vidu.com', 'matkhau_hash', N'Nguyễn', N'Văn A', '0123456789');
PRINT '✅ Chèn user mẫu';

-- Chèn categories cho user
INSERT INTO Categories (UserID, CategoryName, CategoryType, IconName, ColorCode) 
SELECT @UserID, CategoryName, CategoryType, IconName, ColorCode 
FROM Categories WHERE UserID IS NULL;
PRINT '✅ Chèn categories cho user';

-- Chèn transactions mẫu
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
PRINT '✅ Chèn transactions mẫu';

-- Chèn budgets mẫu
INSERT INTO Budgets (UserID, CategoryID, Amount, Period, StartDate, EndDate) 
VALUES (@UserID, @FoodCategoryID, 2000000, 'monthly', '2025-09-01', '2025-09-30');
PRINT '✅ Chèn budgets mẫu';

-- Chèn settings mẫu
INSERT INTO UserSettings (UserID, SettingKey, SettingValue, SettingType, Category) 
VALUES 
(@UserID, 'currency', 'VND', 'string', 'general'),
(@UserID, 'language', 'vi', 'string', 'general'),
(@UserID, 'theme', 'light', 'string', 'appearance');
PRINT '✅ Chèn settings mẫu';

-- Chèn notifications mẫu
INSERT INTO Notifications (UserID, Title, Message, Type, Priority) 
VALUES 
(@UserID, N'Chào mừng bạn', N'Chào mừng bạn đến với ứng dụng Quản Lý Tài Chính Cá Nhân', 'welcome', 'medium'),
(@UserID, N'Vượt ngân sách', N'Bạn đã vượt quá ngân sách cho danh mục Ăn uống', 'budget', 'high');
PRINT '✅ Chèn notifications mẫu';

-- Hoàn tất
PRINT '';
PRINT '🎉 DATABASE HOÀN CHỈNH ĐÃ ĐƯỢC TẠO!';
PRINT '';
PRINT '📋 TÓM TẮT:';
PRINT '   ✅ Database: PersonalFinanceDB';
PRINT '   ✅ Bảng chính: 9 bảng';
PRINT '   ✅ Indexes: Đã tối ưu';
PRINT '   ✅ Stored Procedures: 6 procedures';
PRINT '   ✅ Views & Functions: 3 items';
PRINT '   ✅ Dữ liệu mẫu: 1 user, 16 categories, 4 transactions, 1 budget, 3 settings, 2 notifications';
PRINT '';
PRINT '🚀 SẴN SÀNG SỬ DỤNG!';
PRINT '📧 Tác giả: Tiểu Nhất Bạch';
PRINT '📅 Hoàn thành: ' + CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '';
PRINT '👉 Người khác chỉ cần mở file này trong SSMS và chạy (Execute) là có thể sử dụng ngay!';
PRINT '';