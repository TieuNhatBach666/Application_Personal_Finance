-- Debug real-time để kiểm tra vấn đề ngân sách không cập nhật
USE PersonalFinanceDB;
GO

PRINT '🔍 DEBUG REAL-TIME - NGÂN SÁCH KHÔNG CẬP NHẬT';
PRINT '==============================================';

-- 1. Kiểm tra stored procedure có tồn tại không
PRINT '1. KIỂM TRA STORED PROCEDURE:';
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
    PRINT '✅ sp_UpdateBudgetSpentAmount TỒN TẠI'
ELSE
    PRINT '❌ sp_UpdateBudgetSpentAmount KHÔNG TỒN TẠI - ĐÂY LÀ VẤN ĐỀ!';

-- 2. Hiển thị tất cả budgets hiện có
PRINT '';
PRINT '2. TẤT CẢ BUDGETS HIỆN CÓ:';
SELECT 
    BudgetName as [Tên],
    Period as [Chu kỳ],
    FORMAT(BudgetAmount, 'N0') + ' ₫' as [Ngân sách],
    FORMAT(SpentAmount, 'N0') + ' ₫' as [Đã chi],
    UserID as [User ID],
    CategoryID as [Category ID]
FROM Budgets 
WHERE IsActive = 1
ORDER BY CreatedAt DESC;

-- 3. Hiển thị transactions gần đây nhất
PRINT '';
PRINT '3. TRANSACTIONS GẦN ĐÂY NHẤT (10 giao dịch):';
SELECT TOP 10
    CONVERT(varchar, TransactionDate, 103) as [Ngày],
    c.CategoryName as [Danh mục],
    FORMAT(t.Amount, 'N0') + ' ₫' as [Số tiền],
    t.Type as [Loại],
    t.UserID as [User ID],
    t.CategoryID as [Category ID],
    t.CreatedAt as [Thời gian tạo]
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
ORDER BY t.CreatedAt DESC;

-- 4. Kiểm tra liên kết Budget-Transaction
PRINT '';
PRINT '4. PHÂN TÍCH LIÊN KẾT BUDGET-TRANSACTION:';
SELECT 
    b.BudgetName as [Budget],
    c1.CategoryName as [Budget Category],
    b.UserID as [Budget UserID],
    b.CategoryID as [Budget CategoryID],
    COUNT(t.TransactionID) as [Số giao dịch liên quan],
    FORMAT(SUM(ISNULL(t.Amount, 0)), 'N0') + ' ₫' as [Tổng tiền thực tế],
    FORMAT(b.SpentAmount, 'N0') + ' ₫' as [SpentAmount trong DB],
    CASE 
        WHEN b.SpentAmount = SUM(ISNULL(t.Amount, 0)) THEN '✅ KHỚP'
        ELSE '❌ KHÔNG KHỚP'
    END as [Trạng thái]
FROM Budgets b
LEFT JOIN Categories c1 ON b.CategoryID = c1.CategoryID
LEFT JOIN Transactions t ON (
    t.UserID = b.UserID 
    AND t.CategoryID = b.CategoryID 
    AND t.Type = 'Expense'
    AND (
        (b.Period = 'daily' AND t.TransactionDate = CAST(GETDATE() AS DATE))
        OR
        (b.Period = 'monthly' AND t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1) AND t.TransactionDate <= EOMONTH(GETDATE()))
        OR
        (b.Period = 'yearly' AND t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1) AND t.TransactionDate <= DATEFROMPARTS(YEAR(GETDATE()), 12, 31))
    )
)
WHERE b.IsActive = 1
GROUP BY b.BudgetID, b.BudgetName, c1.CategoryName, b.UserID, b.CategoryID, b.SpentAmount, b.Period
ORDER BY b.BudgetName;

-- 5. Test manual update cho budget "Ăn uống" gần đây nhất
PRINT '';
PRINT '5. TEST MANUAL UPDATE CHO BUDGET ĂN UỐNG:';

DECLARE @budgetUserId UNIQUEIDENTIFIER;
DECLARE @budgetCategoryId UNIQUEIDENTIFIER;
DECLARE @budgetName NVARCHAR(255);
DECLARE @budgetPeriod NVARCHAR(20);
DECLARE @calculatedAmount DECIMAL(18,2);

-- Lấy budget "Ăn uống" gần đây nhất
SELECT TOP 1 
    @budgetUserId = b.UserID,
    @budgetCategoryId = b.CategoryID,
    @budgetName = b.BudgetName,
    @budgetPeriod = b.Period
FROM Budgets b
INNER JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE c.CategoryName LIKE N'%Ăn uống%' 
  AND b.IsActive = 1
ORDER BY b.CreatedAt DESC;

IF @budgetUserId IS NOT NULL
BEGIN
    PRINT 'Tìm thấy budget: ' + @budgetName + ' (Period: ' + @budgetPeriod + ')';
    
    -- Tính toán số tiền thực tế dựa trên period
    IF @budgetPeriod = 'daily'
    BEGIN
        SELECT @calculatedAmount = ISNULL(SUM(Amount), 0)
        FROM Transactions
        WHERE UserID = @budgetUserId
          AND CategoryID = @budgetCategoryId
          AND Type = 'Expense'
          AND TransactionDate = CAST(GETDATE() AS DATE);
        PRINT 'Tính theo daily (hôm nay): ' + FORMAT(@calculatedAmount, 'N0') + ' ₫';
    END
    ELSE IF @budgetPeriod = 'monthly'
    BEGIN
        SELECT @calculatedAmount = ISNULL(SUM(Amount), 0)
        FROM Transactions
        WHERE UserID = @budgetUserId
          AND CategoryID = @budgetCategoryId
          AND Type = 'Expense'
          AND TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
          AND TransactionDate <= EOMONTH(GETDATE());
        PRINT 'Tính theo monthly (tháng này): ' + FORMAT(@calculatedAmount, 'N0') + ' ₫';
    END
    
    -- Cập nhật budget
    UPDATE Budgets
    SET SpentAmount = @calculatedAmount,
        UpdatedAt = GETUTCDATE()
    WHERE UserID = @budgetUserId 
      AND CategoryID = @budgetCategoryId 
      AND IsActive = 1;
    
    PRINT '✅ Đã cập nhật budget với SpentAmount = ' + FORMAT(@calculatedAmount, 'N0') + ' ₫';
END
ELSE
BEGIN
    PRINT '❌ Không tìm thấy budget Ăn uống nào!';
END

-- 6. Hiển thị kết quả cuối cùng
PRINT '';
PRINT '6. KẾT QUẢ SAU KHI MANUAL UPDATE:';
SELECT 
    b.BudgetName as [Tên ngân sách],
    c.CategoryName as [Danh mục],
    b.Period as [Chu kỳ],
    FORMAT(b.BudgetAmount, 'N0') + ' ₫' as [Ngân sách],
    FORMAT(b.SpentAmount, 'N0') + ' ₫' as [Đã chi],
    FORMAT(b.BudgetAmount - b.SpentAmount, 'N0') + ' ₫' as [Còn lại],
    CAST(ROUND((b.SpentAmount * 100.0 / NULLIF(b.BudgetAmount, 0)), 1) AS DECIMAL(5,1)) as [%]
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.IsActive = 1
  AND c.CategoryName LIKE N'%Ăn uống%'
ORDER BY b.CreatedAt DESC;

PRINT '';
PRINT '📋 HƯỚNG DẪN DEBUG:';
PRINT '   1. Nếu stored procedure không tồn tại → Chạy create_universal_procedure.sql';
PRINT '   2. Nếu không có giao dịch liên quan → Kiểm tra UserID/CategoryID';
PRINT '   3. Nếu manual update thành công → Backend không gọi procedure';
PRINT '   4. Kiểm tra backend logs khi tạo transaction mới';
