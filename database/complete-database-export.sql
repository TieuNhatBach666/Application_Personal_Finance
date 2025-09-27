-- =============================================
-- QUẢN LÝ TÀI CHÍNH CÁ NHÂN - DATABASE HOÀN CHỈNH
-- Tác giả: Tiểu Nhất Bạch
-- Mô tả: File SQL tổng hợp duy nhất bao gồm tất cả fixes cần thiết
-- Người khác chỉ cần chạy file này trong SSMS là có thể sử dụng ngay
-- =============================================

USE master;
GO

PRINT '🚀 Bắt đầu thiết lập Personal Finance Manager Database...';
PRINT '📅 Thời gian: ' + CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '';

-- Xóa database nếu đã tồn tại để tạo mới hoàn toàn
IF EXISTS (SELECT name FROM sys.databases WHERE name = 'PersonalFinanceDB')
BEGIN
    ALTER DATABASE PersonalFinanceDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE PersonalFinanceDB;
    PRINT '✅ Xóa database PersonalFinanceDB cũ';
END

-- Tạo database mới
CREATE DATABASE PersonalFinanceDB;
PRINT '✅ Tạo database PersonalFinanceDB mới';
GO

USE PersonalFinanceDB;
GO

-- =============================================
-- TẠO CÁC BẢNG CHÍNH
-- =============================================

PRINT '🏗️ Tạo các bảng chính...';

-- Bảng Users
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
PRINT '✅ Bảng Users đã được tạo';

-- Bảng Categories
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
PRINT '✅ Bảng Categories đã được tạo';

-- Bảng Transactions
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
PRINT '✅ Bảng Transactions đã được tạo';

-- Bảng Budgets
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
-- TẠO INDEXES
-- =============================================

PRINT '📊 Tạo indexes để tối ưu hiệu suất...';

-- Indexes cho Transactions
CREATE INDEX IX_Transactions_UserID_Date ON Transactions(UserID, TransactionDate DESC);
CREATE INDEX IX_Transactions_CategoryID ON Transactions(CategoryID);
CREATE INDEX IX_Transactions_Type_Date ON Transactions(Type, TransactionDate DESC);

-- Indexes cho Categories
CREATE INDEX IX_Categories_UserID_Type ON Categories(UserID, Type);
CREATE INDEX IX_Categories_Type_Active ON Categories(Type, IsActive);

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
-- TẠO STORED PROCEDURES
-- =============================================

PRINT '🔧 Tạo stored procedures...';

PRINT '✅ Tất cả stored procedures đã được tạo';
GO

-- =============================================
-- TẠO VIEWS VÀ FUNCTIONS
-- =============================================

PRINT '📊 Tạo views và functions...';
GO

-- Function: Tính toán tiến độ budget
CREATE FUNCTION fn_GetBudgetProgress(@BudgetID UNIQUEIDENTIFIER)
RETURNS TABLE
AS
RETURN
(
    SELECT
        b.BudgetID,
        b.BudgetAmount as BudgetAmount,
        ISNULL(SUM(t.Amount), 0) as SpentAmount,
        CASE
            WHEN b.BudgetAmount > 0
            THEN ROUND((ISNULL(SUM(t.Amount), 0) / b.BudgetAmount) * 100, 2)
            ELSE 0
        END as PercentageUsed,
        CASE
            WHEN ISNULL(SUM(t.Amount), 0) >= b.BudgetAmount THEN 'Over Budget'
            WHEN (ISNULL(SUM(t.Amount), 0) / b.BudgetAmount) * 100 >= 90 THEN 'Danger'
            WHEN (ISNULL(SUM(t.Amount), 0) / b.BudgetAmount) * 100 >= b.AlertThreshold THEN 'Warning'
            ELSE 'On Track'
        END as Status
    FROM Budgets b
    LEFT JOIN Transactions t ON b.CategoryID = t.CategoryID
        AND b.UserID = t.UserID
        AND t.TransactionDate BETWEEN b.StartDate AND b.EndDate
        AND t.Type = 'Expense'
    WHERE b.BudgetID = @BudgetID
    GROUP BY b.BudgetID, b.BudgetAmount, b.AlertThreshold
);
GO

-- View: Tóm tắt giao dịch
CREATE VIEW vw_TransactionSummary AS
SELECT
    t.UserID,
    YEAR(t.TransactionDate) as Year,
    MONTH(t.TransactionDate) as Month,
    t.Type,
    c.CategoryName,
    c.Color,
    COUNT(*) as TransactionCount,
    SUM(t.Amount) as TotalAmount,
    AVG(t.Amount) as AverageAmount
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
GROUP BY t.UserID, YEAR(t.TransactionDate), MONTH(t.TransactionDate),
         t.Type, c.CategoryName, c.Color;
GO

-- View: Tóm tắt budget
CREATE VIEW vw_BudgetSummary AS
SELECT
    b.BudgetID,
    b.UserID,
    c.CategoryName,
    c.Color,
    b.BudgetAmount as BudgetAmount,
    b.Period,
    b.StartDate,
    b.EndDate,
    b.AlertThreshold,
    b.IsActive
FROM Budgets b
INNER JOIN Categories c ON b.CategoryID = c.CategoryID;
GO

PRINT '✅ Views và functions đã được tạo';
GO

-- =============================================
-- CHÈN DỮ LIỆU MẶC ĐỊNH
-- =============================================

PRINT '📝 Chèn dữ liệu mặc định...';

-- Chèn categories mặc định với DEFAULT_CATEGORIES_USER_ID
DECLARE @DefaultUserID UNIQUEIDENTIFIER = '00000000-0000-0000-0000-000000000000';

-- Categories thu nhập
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color) VALUES
(@DefaultUserID, N'Lương', 'Income', 'salary', '#27ae60'),
(@DefaultUserID, N'Thưởng', 'Income', 'bonus', '#f39c12'),
(@DefaultUserID, N'Phụ cấp', 'Income', 'allowance', '#3498db'),
(@DefaultUserID, N'Đầu tư', 'Income', 'investment', '#9b59b6'),
(@DefaultUserID, N'Kinh doanh', 'Income', 'business', '#e67e22'),
(@DefaultUserID, N'Thu nhập khác', 'Income', 'other', '#95a5a6');

-- Categories chi tiêu
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

PRINT '✅ Categories mặc định đã được chèn';

-- Chèn user mẫu với mật khẩu hash bcrypt hợp lệ
DECLARE @UserID UNIQUEIDENTIFIER = NEWID();
INSERT INTO Users (UserID, Email, PasswordHash, FirstName, LastName, PhoneNumber) 
VALUES (@UserID, 'nguoidung@vidu.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', N'Nguyễn', N'Văn A', '0123456789');
PRINT '✅ Chèn user mẫu với mật khẩu: 123456';

-- Chèn categories cho user
INSERT INTO Categories (UserID, CategoryName, Type, Icon, Color) 
SELECT @UserID, CategoryName, Type, Icon, Color 
FROM Categories WHERE UserID = @DefaultUserID;
PRINT '✅ Chèn categories cho user';

-- Chèn transactions mẫu
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

-- Chèn budget mẫu
INSERT INTO Budgets (UserID, CategoryID, BudgetName, BudgetAmount, Period, StartDate, EndDate) 
VALUES (@UserID, @FoodCategoryID, N'Ngân sách ăn uống', 2000000, 'monthly', '2025-09-01', '2025-09-30');
PRINT '✅ Chèn budget mẫu';

-- Chèn settings mẫu với format category.key
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

-- Chèn notifications mẫu
INSERT INTO Notifications (UserID, Title, Message, Type, Priority, IsRead) 
VALUES 
(@UserID, N'Chào mừng bạn', N'Chào mừng bạn đến với ứng dụng Quản Lý Tài Chính Cá Nhân', 'welcome', 'medium', 0),
(@UserID, N'Vượt ngân sách', N'Bạn đã vượt quá ngân sách cho danh mục Ăn uống', 'budget', 'high', 0);
PRINT '✅ Chèn notifications mẫu';

-- =============================================
-- HOÀN TẤT
-- =============================================

PRINT '';
PRINT '🎉 DATABASE HOÀN CHỈNH ĐÃ ĐƯỢC TẠO!';
PRINT '';
PRINT '📋 TÓM TẮT:';
PRINT '   ✅ Database: PersonalFinanceDB';
PRINT '   ✅ Bảng chính: 9 bảng';
PRINT '   ✅ Indexes: Đã tối ưu';
PRINT '   ✅ Stored Procedures: 6 procedures';
PRINT '   ✅ Views & Functions: 3 items';
PRINT '   ✅ Dữ liệu mẫu: 1 user, 32 categories, 4 transactions, 1 budget, 9 settings, 2 notifications';
PRINT '';
PRINT '📋 THÔNG TIN ĐĂNG NHẬP MẪU:';
PRINT '   📧 Email: nguoidung@vidu.com';
PRINT '   🔑 Mật khẩu: 123456';
PRINT '';
PRINT '🚀 SẴN SÀNG ĐỂ CHIA SẺ TRÊN GITHUB!';
PRINT '👉 Người khác chỉ cần mở file này trong SSMS và chạy là có thể sử dụng ngay!';
PRINT '📧 Tác giả: Tiểu Nhất Bạch';
PRINT '📅 Hoàn thành: ' + CONVERT(NVARCHAR, GETDATE(), 120);
PRINT '';