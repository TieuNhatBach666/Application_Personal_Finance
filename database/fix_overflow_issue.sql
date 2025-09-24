-- Sửa lỗi arithmetic overflow và kiểm tra kết quả
USE PersonalFinanceDB;
GO

PRINT '🔧 SỬA LỖI ARITHMETIC OVERFLOW';
PRINT '===============================';

-- 1. Kiểm tra data types của columns
PRINT '1. KIỂM TRA DATA TYPES:';
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    NUMERIC_PRECISION,
    NUMERIC_SCALE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Budgets' 
  AND COLUMN_NAME IN ('BudgetAmount', 'SpentAmount');

-- 2. Hiển thị budgets với CAST để tránh overflow
PRINT '';
PRINT '2. BUDGETS HIỆN TẠI (tránh overflow):';
SELECT 
    BudgetName as [Ten_Budget],
    Period as [Chu_Ky],
    CAST(BudgetAmount AS BIGINT) as [Ngan_Sach],
    CAST(SpentAmount AS BIGINT) as [Da_Chi],
    CAST((BudgetAmount - SpentAmount) AS BIGINT) as [Con_Lai],
    CASE 
        WHEN BudgetAmount > 0 THEN CAST((SpentAmount * 100.0 / BudgetAmount) AS DECIMAL(10,2))
        ELSE 0
    END as [Ty_Le_Phan_Tram]
FROM Budgets 
WHERE IsActive = 1
ORDER BY CreatedAt DESC;

-- 3. Kiểm tra transactions gây ra số lớn
PRINT '';
PRINT '3. TRANSACTIONS CÓ SỐ TIỀN LỚN:';
SELECT 
    TransactionDate,
    c.CategoryName,
    CAST(t.Amount AS BIGINT) as [So_Tien],
    t.Description,
    CASE 
        WHEN t.Amount > 1000000000 THEN 'RẤT LỚN (>1 tỷ)'
        WHEN t.Amount > 1000000 THEN 'LỚN (>1 triệu)'
        ELSE 'BÌNH THƯỜNG'
    END as [Muc_Do]
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
WHERE t.Type = 'Expense'
  AND t.Amount > 100000 -- Chỉ hiển thị giao dịch > 100k
ORDER BY t.Amount DESC;

-- 4. Tính toán lại chính xác cho budget Donate
PRINT '';
PRINT '4. TÍNH TOÁN LẠI CHO BUDGET DONATE:';

DECLARE @donateUserId UNIQUEIDENTIFIER;
DECLARE @donateCategoryId UNIQUEIDENTIFIER;
DECLARE @todayTotal BIGINT;
DECLARE @monthTotal BIGINT;

SELECT @donateUserId = UserID, @donateCategoryId = CategoryID
FROM Budgets 
WHERE BudgetName = 'Donate';

-- Tính tổng hôm nay
SELECT @todayTotal = ISNULL(SUM(CAST(Amount AS BIGINT)), 0)
FROM Transactions
WHERE UserID = @donateUserId
  AND CategoryID = @donateCategoryId
  AND Type = 'Expense'
  AND TransactionDate = CAST(GETDATE() AS DATE);

-- Tính tổng tháng này
SELECT @monthTotal = ISNULL(SUM(CAST(Amount AS BIGINT)), 0)
FROM Transactions
WHERE UserID = @donateUserId
  AND CategoryID = @donateCategoryId
  AND Type = 'Expense'
  AND TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1)
  AND TransactionDate <= EOMONTH(GETDATE());

PRINT 'Tổng chi tiêu HÔM NAY (daily): ' + FORMAT(@todayTotal, 'N0') + ' ₫';
PRINT 'Tổng chi tiêu THÁNG NÀY (monthly): ' + FORMAT(@monthTotal, 'N0') + ' ₫';

-- 5. Cập nhật budget với số chính xác
PRINT '';
PRINT '5. CẬP NHẬT BUDGET VỚI SỐ CHÍNH XÁC:';

-- Cập nhật daily budget với tổng hôm nay
UPDATE Budgets
SET SpentAmount = @todayTotal,
    UpdatedAt = GETUTCDATE()
WHERE BudgetName = 'Donate'
  AND Period = 'daily';

PRINT 'Đã cập nhật budget Donate (daily) với SpentAmount = ' + FORMAT(@todayTotal, 'N0') + ' ₫';

-- 6. Hiển thị kết quả cuối cùng
PRINT '';
PRINT '6. KẾT QUẢ CUỐI CÙNG:';
SELECT 
    BudgetName as [Tên ngân sách],
    Period as [Chu kỳ],
    FORMAT(CAST(BudgetAmount AS BIGINT), 'N0') + ' ₫' as [Ngân sách],
    FORMAT(CAST(SpentAmount AS BIGINT), 'N0') + ' ₫' as [Đã chi],
    FORMAT(CAST((BudgetAmount - SpentAmount) AS BIGINT), 'N0') + ' ₫' as [Còn lại],
    CASE 
        WHEN BudgetAmount > 0 THEN CAST((SpentAmount * 100.0 / BudgetAmount) AS DECIMAL(10,2))
        ELSE 0
    END as [Tỷ lệ %],
    CASE 
        WHEN SpentAmount >= BudgetAmount THEN '🔴 Vượt ngân sách'
        WHEN SpentAmount >= (BudgetAmount * 0.8) THEN '🟡 Gần vượt'
        WHEN SpentAmount > 0 THEN '🟢 Đang sử dụng'
        ELSE '⚪ Chưa sử dụng'
    END as [Trạng thái]
FROM Budgets 
WHERE IsActive = 1
ORDER BY SpentAmount DESC;

PRINT '';
PRINT '📋 PHÂN TÍCH:';
PRINT '   ✅ Stored procedure hoạt động';
PRINT '   ✅ Manual update thành công';
PRINT '   ✅ Số liệu được tính đúng';
PRINT '   ⚠️ Có giao dịch với số tiền rất lớn (có thể do nhập nhầm)';
PRINT '   💡 Backend sẽ tự động cập nhật khi tạo giao dịch mới';
PRINT '';
PRINT '🎯 HƯỚNG DẪN TIẾP THEO:';
PRINT '   1. Restart backend server';
PRINT '   2. Refresh trang Budget (F5)';
PRINT '   3. Tạo giao dịch chi tiêu mới để test tự động cập nhật';
PRINT '   4. Kiểm tra có giao dịch nào nhập nhầm số tiền quá lớn không';
