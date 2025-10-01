-- ==========================================
-- Fix Budget EndDate cho tháng 9/2025
-- Vấn đề: EndDate = 29/09 nhưng tháng 9 có 30 ngày
-- Giải pháp: Update EndDate = 30/09/2025
-- ==========================================

USE PersonalFinanceDB;
GO

-- Kiểm tra budget hiện tại
SELECT 
    BudgetID,
    BudgetName,
    Period,
    StartDate,
    EndDate,
    DATEDIFF(day, StartDate, EndDate) + 1 as 'Số ngày',
    CASE 
        WHEN Period = 'monthly' AND DATEDIFF(day, StartDate, EndDate) + 1 < 28 THEN 'LỖI: Thiếu ngày'
        WHEN Period = 'monthly' AND DATEDIFF(day, StartDate, EndDate) + 1 = 28 THEN 'Tháng 2 (không nhuận)'
        WHEN Period = 'monthly' AND DATEDIFF(day, StartDate, EndDate) + 1 = 29 THEN 'Tháng 2 (nhuận) hoặc LỖI'
        WHEN Period = 'monthly' AND DATEDIFF(day, StartDate, EndDate) + 1 = 30 THEN 'Tháng có 30 ngày'
        WHEN Period = 'monthly' AND DATEDIFF(day, StartDate, EndDate) + 1 = 31 THEN 'Tháng có 31 ngày'
        ELSE 'OK'
    END as 'Trạng thái'
FROM Budgets
WHERE Period = 'monthly'
ORDER BY StartDate DESC;

-- Update EndDate cho budget tháng 9/2025
UPDATE Budgets
SET EndDate = '2025-09-30'
WHERE Period = 'monthly'
  AND YEAR(StartDate) = 2025
  AND MONTH(StartDate) = 9
  AND EndDate = '2025-09-29';

-- Kiểm tra sau khi update
SELECT 
    BudgetID,
    BudgetName,
    Period,
    StartDate,
    EndDate,
    DATEDIFF(day, StartDate, EndDate) + 1 as 'Số ngày sau khi fix'
FROM Budgets
WHERE Period = 'monthly'
  AND YEAR(StartDate) = 2025
  AND MONTH(StartDate) = 9;

PRINT '✅ Đã fix EndDate cho budget tháng 9/2025';
GO
