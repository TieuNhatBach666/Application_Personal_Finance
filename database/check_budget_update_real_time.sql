-- Kiểm tra budget có thực sự được cập nhật không
USE PersonalFinanceDB;
GO

PRINT '🔍 KIỂM TRA BUDGET CẬP NHẬT REAL-TIME';
PRINT '====================================';

-- 1. Hiển thị budget hiện tại
PRINT '1. BUDGET HIỆN TẠI:';
SELECT 
    BudgetName,
    Period,
    FORMAT(CAST(BudgetAmount AS BIGINT), 'N0') + ' ₫' as [Ngân sách],
    FORMAT(CAST(SpentAmount AS BIGINT), 'N0') + ' ₫' as [Đã chi],
    FORMAT(CAST((BudgetAmount - SpentAmount) AS BIGINT), 'N0') + ' ₫' as [Còn lại],
    UpdatedAt as [Cập nhật lúc],
    UserID,
    CategoryID
FROM Budgets 
WHERE IsActive = 1
ORDER BY UpdatedAt DESC;

-- 2. Kiểm tra transactions gần đây nhất
PRINT '';
PRINT '2. TRANSACTIONS GẦN ĐÂY NHẤT (5 giao dịch):';
SELECT TOP 5
    CONVERT(varchar, TransactionDate, 103) as [Ngày],
    c.CategoryName as [Danh mục],
    FORMAT(CAST(t.Amount AS BIGINT), 'N0') + ' ₫' as [Số tiền],
    t.Type as [Loại],
    t.CreatedAt as [Tạo lúc],
    t.UserID,
    t.CategoryID
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
ORDER BY t.CreatedAt DESC;

-- 3. Test manual call stored procedure
PRINT '';
PRINT '3. TEST MANUAL CALL STORED PROCEDURE:';

DECLARE @testUserId UNIQUEIDENTIFIER = 'E40F69CC-3F79-486F-99BA-D51E024E3B49';
DECLARE @testCategoryId UNIQUEIDENTIFIER = 'D6EDC0A1-A10D-4B50-9969-E933391A2E1D';

PRINT 'Gọi sp_UpdateBudgetSpentAmount với:';
PRINT 'UserId: ' + CAST(@testUserId AS NVARCHAR(36));
PRINT 'CategoryId: ' + CAST(@testCategoryId AS NVARCHAR(36));

EXEC sp_UpdateBudgetSpentAmount @testUserId, @testCategoryId;

-- 4. Hiển thị kết quả sau khi gọi procedure
PRINT '';
PRINT '4. KẾT QUẢ SAU KHI GỌI PROCEDURE:';
SELECT 
    BudgetName,
    Period,
    FORMAT(CAST(BudgetAmount AS BIGINT), 'N0') + ' ₫' as [Ngân sách],
    FORMAT(CAST(SpentAmount AS BIGINT), 'N0') + ' ₫' as [Đã chi],
    FORMAT(CAST((BudgetAmount - SpentAmount) AS BIGINT), 'N0') + ' ₫' as [Còn lại],
    UpdatedAt as [Cập nhật lúc],
    CASE 
        WHEN SpentAmount >= BudgetAmount THEN '🔴 Vượt ngân sách'
        WHEN SpentAmount >= (BudgetAmount * 0.8) THEN '🟡 Gần vượt'
        WHEN SpentAmount > 0 THEN '🟢 Đang sử dụng'
        ELSE '⚪ Chưa sử dụng'
    END as [Trạng thái]
FROM Budgets 
WHERE IsActive = 1
ORDER BY UpdatedAt DESC;

-- 5. Tính toán manual để so sánh
PRINT '';
PRINT '5. TÍNH TOÁN MANUAL ĐỂ SO SÁNH:';

DECLARE @manualDaily BIGINT;
DECLARE @manualMonthly BIGINT;

-- Tính daily (hôm nay)
SELECT @manualDaily = ISNULL(SUM(CAST(Amount AS BIGINT)), 0)
FROM Transactions
WHERE UserID = @testUserId
  AND CategoryID = @testCategoryId
  AND Type = 'Expense'
  AND TransactionDate = CAST(GETDATE() AS DATE);

-- Tính monthly (tháng này)
SELECT @manualMonthly = ISNULL(SUM(CAST(Amount AS BIGINT)), 0)
FROM Transactions
WHERE UserID = @testUserId
  AND CategoryID = @testCategoryId
  AND Type = 'Expense'
  AND TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
  AND TransactionDate <= EOMONTH(GETDATE());

PRINT 'Tính toán manual:';
PRINT 'Daily (hôm nay): ' + FORMAT(@manualDaily, 'N0') + ' ₫';
PRINT 'Monthly (tháng này): ' + FORMAT(@manualMonthly, 'N0') + ' ₫';

-- 6. So sánh với database
PRINT '';
PRINT '6. SO SÁNH VỚI DATABASE:';
SELECT 
    b.BudgetName,
    b.Period,
    FORMAT(CAST(b.SpentAmount AS BIGINT), 'N0') + ' ₫' as [DB SpentAmount],
    CASE 
        WHEN b.Period = 'daily' THEN FORMAT(@manualDaily, 'N0') + ' ₫'
        WHEN b.Period = 'monthly' THEN FORMAT(@manualMonthly, 'N0') + ' ₫'
        ELSE 'N/A'
    END as [Manual Calculation],
    CASE 
        WHEN b.Period = 'daily' AND b.SpentAmount = @manualDaily THEN '✅ KHỚP'
        WHEN b.Period = 'monthly' AND b.SpentAmount = @manualMonthly THEN '✅ KHỚP'
        ELSE '❌ KHÔNG KHỚP'
    END as [Trạng thái]
FROM Budgets b
WHERE b.UserID = @testUserId 
  AND b.CategoryID = @testCategoryId
  AND b.IsActive = 1;

PRINT '';
PRINT '📋 KẾT LUẬN:';
PRINT '   - Nếu procedure cập nhật đúng → Vấn đề ở frontend cache';
PRINT '   - Nếu procedure không cập nhật → Vấn đề ở stored procedure';
PRINT '   - Kiểm tra UpdatedAt có thay đổi không';
