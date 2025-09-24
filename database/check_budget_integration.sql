-- Kiểm tra tình trạng tích hợp ngân sách
USE PersonalFinanceDB;
GO

PRINT '🔍 KIỂM TRA TÌNH TRẠNG TÍCH HỢP NGÂN SÁCH';
PRINT '==========================================';

-- 1. Kiểm tra stored procedure có tồn tại không
PRINT '1. Kiểm tra Stored Procedure:';
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateBudgetSpentAmount')
    PRINT '   ✅ sp_UpdateBudgetSpentAmount đã tồn tại'
ELSE
    PRINT '   ❌ sp_UpdateBudgetSpentAmount CHƯA tồn tại - CẦN TẠO!';

PRINT '';

-- 2. Hiển thị dữ liệu ngân sách hiện tại
PRINT '2. Dữ liệu ngân sách hiện tại:';
SELECT 
    b.BudgetName as [Tên Ngân Sách],
    c.CategoryName as [Danh Mục],
    b.BudgetAmount as [Ngân Sách],
    b.SpentAmount as [Đã Chi],
    b.Period as [Chu Kỳ],
    b.IsActive as [Hoạt Động]
FROM Budgets b
LEFT JOIN Categories c ON b.CategoryID = c.CategoryID
WHERE b.IsActive = 1
ORDER BY b.CreatedAt DESC;

PRINT '';

-- 3. Hiển thị giao dịch chi tiêu gần đây
PRINT '3. Giao dịch chi tiêu gần đây:';
SELECT TOP 10
    t.TransactionDate as [Ngày],
    c.CategoryName as [Danh Mục],
    t.Amount as [Số Tiền],
    t.Description as [Mô Tả]
FROM Transactions t
INNER JOIN Categories c ON t.CategoryID = c.CategoryID
WHERE t.Type = 'Expense'
ORDER BY t.TransactionDate DESC, t.CreatedAt DESC;

PRINT '';

-- 4. Kiểm tra liên kết giữa ngân sách và giao dịch
PRINT '4. Phân tích liên kết Budget-Transaction:';
SELECT 
    b.BudgetName as [Ngân Sách],
    c1.CategoryName as [Danh Mục Ngân Sách],
    COUNT(t.TransactionID) as [Số Giao Dịch Liên Quan],
    SUM(t.Amount) as [Tổng Tiền Thực Tế],
    b.SpentAmount as [SpentAmount Trong DB]
FROM Budgets b
LEFT JOIN Categories c1 ON b.CategoryID = c1.CategoryID
LEFT JOIN Transactions t ON (
    t.CategoryID = b.CategoryID 
    AND t.Type = 'Expense' 
    AND t.UserID = b.UserID
    AND t.TransactionDate >= DATEFROMPARTS(YEAR(GETDATE()), MONTH(GETDATE()), 1) -- This month
    AND t.TransactionDate <= EOMONTH(GETDATE())
)
WHERE b.IsActive = 1
GROUP BY b.BudgetID, b.BudgetName, c1.CategoryName, b.SpentAmount
ORDER BY b.BudgetName;

PRINT '';
PRINT '📋 HƯỚNG DẪN TIẾP THEO:';
PRINT '   1. Nếu stored procedure chưa tồn tại → Chạy fix_budget_integration.sql';
PRINT '   2. Nếu SpentAmount = 0 dù có giao dịch → Cần cập nhật manual';
PRINT '   3. Kiểm tra CategoryID có khớp giữa Budget và Transaction không';
