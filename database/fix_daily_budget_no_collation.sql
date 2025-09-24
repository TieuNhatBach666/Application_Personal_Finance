-- Sửa budget daily - không có UNION ALL để tránh collation conflict
USE PersonalFinanceDB;
GO

PRINT '🔧 SỬA BUDGET DAILY - TRÁNH COLLATION CONFLICT';
PRINT '==============================================';

-- 1. Hiển thị budgets hiện có
PRINT '1. BUDGETS HIỆN CÓ:';
SELECT 
    BudgetName,
    Period,
    BudgetAmount,
    SpentAmount
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
    b.BudgetName as [Ten_Ngan_Sach],
    ISNULL(c.CategoryName, 'Tat_ca_danh_muc') as [Danh_Muc],
    b.Period as [Chu_Ky],
    FORMAT(b.BudgetAmount, 'N0') + ' VND' as [Ngan_Sach],
    FORMAT(b.SpentAmount, 'N0') + ' VND' as [Da_Chi],
    FORMAT(b.BudgetAmount - b.SpentAmount, 'N0') + ' VND' as [Con_Lai],
    CAST(ROUND((b.SpentAmount * 100.0 / NULLIF(b.BudgetAmount, 0)), 1) AS DECIMAL(5,1)) as [Ty_Le_Phan_Tram],
    CASE 
        WHEN b.SpentAmount >= b.BudgetAmount THEN 'Vuot_ngan_sach'
        WHEN b.SpentAmount >= (b.BudgetAmount * ISNULL(b.WarningThreshold, 80) / 100.0) THEN 'Gan_vuot'
        WHEN b.SpentAmount > 0 THEN 'Dang_su_dung'
        ELSE 'Chua_su_dung'
    END as [Trang_Thai]
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.IsActive = 1
ORDER BY b.SpentAmount DESC, b.BudgetName;

-- 7. Hiển thị chi tiết cho budget "Donate"
PRINT '';
PRINT '📋 CHI TIẾT BUDGET DONATE:';

SELECT 
    b.BudgetName,
    b.Period,
    b.BudgetAmount,
    b.SpentAmount,
    CASE 
        WHEN b.Period = 'daily' THEN 'Chi tiêu hôm nay'
        WHEN b.Period = 'monthly' THEN 'Chi tiêu tháng này'
        WHEN b.Period = 'quarterly' THEN 'Chi tiêu quý này'
        WHEN b.Period = 'yearly' THEN 'Chi tiêu năm này'
        ELSE 'Không xác định'
    END as [Giai_Thich]
FROM Budgets b 
WHERE b.BudgetName = 'Donate';

-- 8. Hiển thị transactions liên quan
PRINT '';
PRINT '📋 TRANSACTIONS LIÊN QUAN ĐẾN BUDGET DONATE:';

SELECT 
    t.TransactionDate,
    c.CategoryName,
    t.Amount,
    CASE 
        WHEN t.TransactionDate = CAST(GETDATE() AS DATE) THEN 'Hom_nay'
        WHEN t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1) THEN 'Thang_nay'
        ELSE 'Thang_khac'
    END as [Thoi_Gian]
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
INNER JOIN Budgets b ON t.UserID = b.UserID AND t.CategoryID = b.CategoryID
WHERE b.BudgetName = 'Donate' 
  AND t.Type = 'Expense'
ORDER BY t.TransactionDate DESC;

PRINT '';
PRINT '🎉 HOÀN THÀNH! Budget daily đã được cập nhật!';
PRINT '';
PRINT '📋 LƯU Ý QUAN TRỌNG:';
PRINT '   - Daily budget CHỈ tính giao dịch HÔM NAY (23/09/2025)';
PRINT '   - Monthly budget tính giao dịch THÁNG 9/2025';
PRINT '   - Nếu budget Donate là daily mà SpentAmount vẫn = 0';
PRINT '   - Có nghĩa là KHÔNG có giao dịch Ăn uống nào HÔM NAY';
PRINT '   - Hãy tạo giao dịch Ăn uống với ngày hôm nay để test!';
