-- ==========================================
-- Tạo Notification cho Budget Vượt Mức
-- ==========================================

USE PersonalFinanceDB;
GO

DECLARE @userId UNIQUEIDENTIFIER = '72871371-800B-44BD-AA71-C00F97A9343F';
DECLARE @budgetName NVARCHAR(255) = 'TEST tháng 10';
DECLARE @percentage DECIMAL(10,2) = 998888.78;
DECLARE @spentAmount DECIMAL(18,2) = 8989990000.00;
DECLARE @budgetAmount DECIMAL(18,2) = 900000.00;
DECLARE @overAmount DECIMAL(18,2) = @spentAmount - @budgetAmount;

-- Tạo notification vượt ngân sách nghiêm trọng
INSERT INTO Notifications (NotificationID, UserID, Title, Message, Type, IsRead, CreatedAt)
VALUES (
    NEWID(),
    @userId,
    N'🔥 NGUY HIỂM: Vượt Ngân Sách Nghiêm Trọng!',
    CONCAT(
        N'Ngân sách "', @budgetName, N'" đã vượt ', 
        CAST(@percentage AS NVARCHAR(20)), N'%! ',
        N'Bạn đã chi vượt ', FORMAT(@overAmount, 'N0', 'vi-VN'), N' ₫. ',
        N'Cần hành động ngay lập tức!'
    ),
    'error',
    0,
    GETDATE()
);

PRINT '✅ Đã tạo notification vượt ngân sách nghiêm trọng!';

-- Kiểm tra notification vừa tạo
SELECT TOP 5
    NotificationID,
    Title,
    Message,
    Type,
    IsRead,
    CreatedAt
FROM Notifications
WHERE UserID = @userId
ORDER BY CreatedAt DESC;

GO
