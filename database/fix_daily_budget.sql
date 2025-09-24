-- Sửa budget daily - cập nhật tất cả periods
USE PersonalFinanceDB;
GO

PRINT '🔧 SỬA BUDGET DAILY - CẬP NHẬT TẤT CẢ PERIODS';
PRINT '==============================================';

-- 1. Hiển thị budgets hiện có
PRINT '1. BUDGETS HIỆN CÓ:';
SELECT 
    BudgetName,
    Period,
    BudgetAmount,
    SpentAmount,
    CASE Period
        WHEN 'daily' THEN 'Hàng ngày'
        WHEN 'monthly' THEN 'Hàng tháng'
        WHEN 'quarterly' THEN 'Hàng quý'
        WHEN 'yearly' THEN 'Hàng năm'
        ELSE Period
    END as [Chu Kỳ Hiển Thị]
FROM Budgets 
WHERE IsActive = 1;

PRINT '';

-- 2. Cập nhật DAILY budgets (tính theo ngày hôm nay)
PRINT '2. Cập nhật DAILY budgets...';

UPDATE b
SET b.SpentAmount = ISNULL(expense_total.total, 0),
    b.UpdatedAt = GETUTCDATE()
FROM Budgets b
LEFT JOIN (
    SELECT 
        t.UserID,
        t.CategoryID,
        SUM(t.Amount) as total
    FROM Transactions t
    WHERE t.Type = 'Expense'
      AND t.TransactionDate = CAST(GETDATE() AS DATE) -- Chỉ hôm nay
    GROUP BY t.UserID, t.CategoryID
) expense_total ON b.UserID = expense_total.UserID AND b.CategoryID = expense_total.CategoryID
WHERE b.IsActive = 1 
  AND b.CategoryID IS NOT NULL
  AND b.Period = 'daily';

DECLARE @dailyUpdated INT = @@ROWCOUNT;
PRINT 'Cập nhật ' + CAST(@dailyUpdated AS NVARCHAR(10)) + ' daily budgets';

-- 3. Cập nhật MONTHLY budgets (tính theo tháng này)
PRINT '3. Cập nhật MONTHLY budgets...';

UPDATE b
SET b.SpentAmount = ISNULL(expense_total.total, 0),
    b.UpdatedAt = GETUTCDATE()
FROM Budgets b
LEFT JOIN (
    SELECT 
        t.UserID,
        t.CategoryID,
        SUM(t.Amount) as total
    FROM Transactions t
    WHERE t.Type = 'Expense'
      AND t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
      AND t.TransactionDate <= EOMONTH(GETDATE())
    GROUP BY t.UserID, t.CategoryID
) expense_total ON b.UserID = expense_total.UserID AND b.CategoryID = expense_total.CategoryID
WHERE b.IsActive = 1 
  AND b.CategoryID IS NOT NULL
  AND b.Period = 'monthly';

DECLARE @monthlyUpdated INT = @@ROWCOUNT;
PRINT 'Cập nhật ' + CAST(@monthlyUpdated AS NVARCHAR(10)) + ' monthly budgets';

-- 4. Cập nhật QUARTERLY budgets (tính theo quý này)
PRINT '4. Cập nhật QUARTERLY budgets...';

DECLARE @currentDate DATE = GETDATE();
DECLARE @quarter INT = CEILING(MONTH(@currentDate) / 3.0);
DECLARE @quarterStartMonth INT = (@quarter - 1) * 3 + 1;
DECLARE @quarterStart DATE = DATEFROMPARTS(YEAR(@currentDate), @quarterStartMonth, 1);
DECLARE @quarterEnd DATE = EOMONTH(DATEADD(MONTH, 2, @quarterStart));

UPDATE b
SET b.SpentAmount = ISNULL(expense_total.total, 0),
    b.UpdatedAt = GETUTCDATE()
FROM Budgets b
LEFT JOIN (
    SELECT 
        t.UserID,
        t.CategoryID,
        SUM(t.Amount) as total
    FROM Transactions t
    WHERE t.Type = 'Expense'
      AND t.TransactionDate >= @quarterStart
      AND t.TransactionDate <= @quarterEnd
    GROUP BY t.UserID, t.CategoryID
) expense_total ON b.UserID = expense_total.UserID AND b.CategoryID = expense_total.CategoryID
WHERE b.IsActive = 1 
  AND b.CategoryID IS NOT NULL
  AND b.Period = 'quarterly';

DECLARE @quarterlyUpdated INT = @@ROWCOUNT;
PRINT 'Cập nhật ' + CAST(@quarterlyUpdated AS NVARCHAR(10)) + ' quarterly budgets';

-- 5. Cập nhật YEARLY budgets (tính theo năm này)
PRINT '5. Cập nhật YEARLY budgets...';

UPDATE b
SET b.SpentAmount = ISNULL(expense_total.total, 0),
    b.UpdatedAt = GETUTCDATE()
FROM Budgets b
LEFT JOIN (
    SELECT 
        t.UserID,
        t.CategoryID,
        SUM(t.Amount) as total
    FROM Transactions t
    WHERE t.Type = 'Expense'
      AND t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), 1, 1)
      AND t.TransactionDate <= DATEFROMPARTS(YEAR(GETDATE()), 12, 31)
    GROUP BY t.UserID, t.CategoryID
) expense_total ON b.UserID = expense_total.UserID AND b.CategoryID = expense_total.CategoryID
WHERE b.IsActive = 1 
  AND b.CategoryID IS NOT NULL
  AND b.Period = 'yearly';

DECLARE @yearlyUpdated INT = @@ROWCOUNT;
PRINT 'Cập nhật ' + CAST(@yearlyUpdated AS NVARCHAR(10)) + ' yearly budgets';

PRINT '';

-- 6. Hiển thị kết quả
PRINT '📊 KẾT QUẢ SAU KHI CẬP NHẬT:';

SELECT 
    b.BudgetName as [Tên Ngân Sách],
    ISNULL(c.CategoryName, 'Tất cả danh mục') as [Danh Mục],
    CASE b.Period
        WHEN 'daily' THEN 'Hàng ngày'
        WHEN 'monthly' THEN 'Hàng tháng'
        WHEN 'quarterly' THEN 'Hàng quý'
        WHEN 'yearly' THEN 'Hàng năm'
        ELSE b.Period
    END as [Chu Kỳ],
    FORMAT(b.BudgetAmount, 'N0') + ' ₫' as [Ngân Sách],
    FORMAT(b.SpentAmount, 'N0') + ' ₫' as [Đã Chi],
    FORMAT(b.BudgetAmount - b.SpentAmount, 'N0') + ' ₫' as [Còn Lại],
    CAST(ROUND((b.SpentAmount * 100.0 / NULLIF(b.BudgetAmount, 0)), 1) AS DECIMAL(5,1)) as [Tỷ Lệ %],
    CASE 
        WHEN b.SpentAmount >= b.BudgetAmount THEN '🔴 Vượt ngân sách'
        WHEN b.SpentAmount >= (b.BudgetAmount * ISNULL(b.WarningThreshold, 80) / 100.0) THEN '🟡 Gần vượt'
        WHEN b.SpentAmount > 0 THEN '🟢 Đang sử dụng'
        ELSE '⚪ Chưa sử dụng'
    END as [Trạng Thái]
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.IsActive = 1
ORDER BY b.SpentAmount DESC, b.BudgetName;

-- 7. Hiển thị chi tiết cho budget "Donate"
PRINT '';
PRINT '📋 CHI TIẾT BUDGET "DONATE":';

SELECT 
    'Budget Info' as [Loại],
    b.BudgetName as [Tên],
    FORMAT(b.BudgetAmount, 'N0') + ' ₫' as [Số Tiền],
    b.Period as [Chu Kỳ],
    'N/A' as [Ngày]
FROM Budgets b 
WHERE b.BudgetName = 'Donate'

UNION ALL

SELECT 
    'Transactions' as [Loại],
    'Chi tiêu ' + c.CategoryName as [Tên],
    FORMAT(t.Amount, 'N0') + ' ₫' as [Số Tiền],
    'N/A' as [Chu Kỳ],
    CAST(t.TransactionDate AS NVARCHAR(10)) as [Ngày]
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
INNER JOIN Budgets b ON t.UserID = b.UserID AND t.CategoryID = b.CategoryID
WHERE b.BudgetName = 'Donate' 
  AND t.Type = 'Expense'
  AND t.TransactionDate = CAST(GETDATE() AS DATE) -- Chỉ hôm nay cho daily budget
ORDER BY [Loại], [Ngày] DESC;

PRINT '';
PRINT '🎉 HOÀN THÀNH! Budget daily đã được cập nhật!';
PRINT '';
PRINT '📋 LƯU Ý:';
PRINT '   - Daily budget chỉ tính giao dịch HÔM NAY';
PRINT '   - Monthly budget tính giao dịch THÁNG NÀY';
PRINT '   - Nếu muốn đổi daily → monthly, cần sửa trong ứng dụng';
