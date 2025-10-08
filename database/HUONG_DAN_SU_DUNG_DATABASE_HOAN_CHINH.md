# 📊 HƯỚNG DẪN SỬ DỤNG DATABASE HOÀN CHỈNH
© Tiểu Nhất Bạch 2025

## 🎯 TỔNG QUAN
File SQL tổng hợp hoàn chỉnh: **`PERSONAL_FINANCE_COMPLETE_DATABASE_FINAL.sql`**  
Đây là file SQL duy nhất chứa đầy đủ mọi thứ cần thiết cho dự án Quản Lý Tài Chính Cá Nhân.

## 🚀 CÁCH SỬ DỤNG NHANH

### Bước 1: Kiểm tra SQL Server
```cmd
sqlcmd -L
```
Kết quả mong đợi: `TIEUNHATBACH666\TIEUNHATBACH`

### Bước 2: Chạy file SQL
```cmd
sqlcmd -S TIEUNHATBACH666\TIEUNHATBACH -U sa -P 123456 -i "PERSONAL_FINANCE_COMPLETE_DATABASE_FINAL.sql"
```

### Bước 3: Kiểm tra kết quả
- Database `PersonalFinanceDB` được tạo thành công
- 10 bảng chính được tạo với dữ liệu mẫu
- Views, Functions, Stored Procedures, Triggers hoạt động
- SQL Agent Job được thiết lập

## 📋 CẤU TRÚC DATABASE

### 🗄️ 10 BẢNG CHÍNH

#### 1. Users - Người dùng
```sql
UserID (PK)         -- ID người dùng
Username            -- Tên đăng nhập (unique)
Email               -- Email (unique)
PasswordHash        -- Mật khẩu đã mã hóa
FullName            -- Họ tên đầy đủ
Avatar              -- Đường dẫn avatar
Phone               -- Số điện thoại
DateOfBirth         -- Ngày sinh
IsActive            -- Trạng thái hoạt động
CreatedAt           -- Ngày tạo
UpdatedAt           -- Ngày cập nhật
```

#### 2. Categories - Danh mục
```sql
CategoryID (PK)     -- ID danh mục
UserID (FK)         -- ID người dùng
Name                -- Tên danh mục
Type                -- Loại (Income/Expense)
Icon                -- Icon danh mục
Color               -- Màu sắc
Description         -- Mô tả
IsDefault           -- Danh mục mặc định
CreatedAt           -- Ngày tạo
```

#### 3. Transactions - Giao dịch
```sql
TransactionID (PK)  -- ID giao dịch
UserID (FK)         -- ID người dùng
CategoryID (FK)     -- ID danh mục
Amount              -- Số tiền
Type                -- Loại (Income/Expense)
Description         -- Mô tả
TransactionDate     -- Ngày giao dịch
Location            -- Địa điểm
PaymentMethod       -- Phương thức thanh toán
Receipt             -- Hóa đơn
Tags                -- Thẻ gắn
CreatedAt           -- Ngày tạo
UpdatedAt           -- Ngày cập nhật
```

#### 4. Budgets - Ngân sách
```sql
BudgetID (PK)       -- ID ngân sách
UserID (FK)         -- ID người dùng
CategoryID (FK)     -- ID danh mục
Amount              -- Số tiền ngân sách
SpentAmount         -- Số tiền đã chi
Period              -- Kỳ (Monthly/Weekly/Yearly)
StartDate           -- Ngày bắt đầu
EndDate             -- Ngày kết thúc
AlertThreshold      -- Ngưỡng cảnh báo (%)
IsActive            -- Trạng thái hoạt động
CreatedAt           -- Ngày tạo
UpdatedAt           -- Ngày cập nhật
```

#### 5. UserSettings - Cài đặt người dùng
```sql
SettingID (PK)      -- ID cài đặt
UserID (FK)         -- ID người dùng
Currency            -- Đơn vị tiền tệ
Language            -- Ngôn ngữ
Timezone            -- Múi giờ
Theme               -- Giao diện (Light/Dark)
NotificationEnabled -- Bật thông báo
EmailNotification   -- Thông báo email
AutoBackup          -- Tự động sao lưu
CreatedAt           -- Ngày tạo
UpdatedAt           -- Ngày cập nhật
```

#### 6. Notifications - Thông báo
```sql
NotificationID (PK) -- ID thông báo
UserID (FK)         -- ID người dùng
Title               -- Tiêu đề
Message             -- Nội dung
Type                -- Loại thông báo
Priority            -- Mức độ ưu tiên
IsRead              -- Đã đọc
CreatedAt           -- Ngày tạo
ReadAt              -- Ngày đọc
```

#### 7. RecurringTransactions - Giao dịch định kỳ
```sql
RecurringID (PK)    -- ID giao dịch định kỳ
UserID (FK)         -- ID người dùng
CategoryID (FK)     -- ID danh mục
Amount              -- Số tiền
Type                -- Loại (Income/Expense)
Description         -- Mô tả
Frequency           -- Tần suất
StartDate           -- Ngày bắt đầu
EndDate             -- Ngày kết thúc
NextExecutionDate   -- Ngày thực hiện tiếp theo
IsActive            -- Trạng thái hoạt động
CreatedAt           -- Ngày tạo
UpdatedAt           -- Ngày cập nhật
```

#### 8. RecurringTransactionHistory - Lịch sử giao dịch định kỳ
```sql
HistoryID (PK)      -- ID lịch sử
RecurringID (FK)    -- ID giao dịch định kỳ
TransactionID (FK)  -- ID giao dịch được tạo
ExecutedAt          -- Thời gian thực hiện
Status              -- Trạng thái (Success/Failed)
ErrorMessage        -- Thông báo lỗi (nếu có)
```

#### 9. BackupHistory - Lịch sử sao lưu
```sql
BackupID (PK)       -- ID sao lưu
UserID (FK)         -- ID người dùng
BackupType          -- Loại sao lưu
FilePath            -- Đường dẫn file
FileSize            -- Kích thước file
Status              -- Trạng thái
CreatedAt           -- Ngày tạo
```

#### 10. AuditLog - Nhật ký audit
```sql
LogID (PK)          -- ID log
UserID (FK)         -- ID người dùng
Action              -- Hành động
TableName           -- Tên bảng
RecordID            -- ID bản ghi
OldValues           -- Giá trị cũ
NewValues           -- Giá trị mới
IPAddress           -- Địa chỉ IP
UserAgent           -- User Agent
CreatedAt           -- Thời gian
```

### 🔍 3 VIEWS

#### 1. vw_TransactionSummary
Tổng hợp giao dịch theo người dùng và danh mục
```sql
SELECT * FROM vw_TransactionSummary WHERE UserID = 1;
```

#### 2. vw_BudgetProgress
Tiến độ ngân sách theo thời gian thực
```sql
SELECT * FROM vw_BudgetProgress WHERE UserID = 1;
```

#### 3. vw_MonthlyIncomeExpense
Thu chi theo tháng của người dùng
```sql
SELECT * FROM vw_MonthlyIncomeExpense WHERE UserID = 1;
```

### ⚙️ 2 FUNCTIONS

#### 1. fn_GetBudgetProgress
Tính phần trăm tiến độ ngân sách
```sql
SELECT dbo.fn_GetBudgetProgress(1) AS BudgetProgress;
```

#### 2. fn_GetIncomeExpenseSummary
Tổng hợp thu chi theo kỳ
```sql
SELECT dbo.fn_GetIncomeExpenseSummary(1, '2025-01-01', '2025-01-31') AS Summary;
```

### 🔧 4 STORED PROCEDURES

#### 1. sp_CreateDefaultCategoriesForUser
Tạo danh mục mặc định cho người dùng mới
```sql
EXEC sp_CreateDefaultCategoriesForUser @UserID = 1;
```

#### 2. sp_ProcessRecurringTransactions
Xử lý giao dịch định kỳ (chạy tự động hàng ngày)
```sql
EXEC sp_ProcessRecurringTransactions;
```

#### 3. sp_UpdateBudgetSpentAmount
Cập nhật số tiền đã chi trong ngân sách
```sql
EXEC sp_UpdateBudgetSpentAmount @BudgetID = 1;
```

#### 4. sp_CreateNotification
Tạo thông báo cho người dùng
```sql
EXEC sp_CreateNotification 
    @UserID = 1, 
    @Title = N'Cảnh báo ngân sách', 
    @Message = N'Bạn đã chi vượt 80% ngân sách tháng này',
    @Type = 'Budget',
    @Priority = 'High';
```

### 🎯 2 TRIGGERS

#### 1. tr_Users_UpdatedAt
Tự động cập nhật thời gian khi thay đổi thông tin người dùng

#### 2. tr_Transactions_UpdateBudget
Tự động cập nhật ngân sách khi có giao dịch mới

## 🚀 TÍNH NĂNG NÂNG CAO

### 📊 20+ Indexes
Tối ưu hiệu suất truy vấn cho:
- Tìm kiếm giao dịch theo người dùng
- Lọc theo danh mục và thời gian
- Thống kê ngân sách
- Báo cáo tài chính

### 🤖 SQL Agent Job
**Tên:** PersonalFinance_ProcessRecurringTransactions  
**Lịch chạy:** Hàng ngày lúc 00:01  
**Chức năng:** Tự động tạo giao dịch định kỳ  

### 🔒 Bảo mật
- Mật khẩu được mã hóa bằng bcrypt
- Foreign key constraints đảm bảo tính toàn vẹn
- Audit log theo dõi mọi thay đổi
- Cascade delete tự động dọn dẹp dữ liệu

## 📝 DỮ LIỆU MẪU

### Tài khoản test:
- **Email:** nguoidung@vidu.com
- **Mật khẩu:** 123456
- **UserID:** 1

### Danh mục mặc định:
- Thu nhập: Lương, Thưởng, Đầu tư, Khác
- Chi tiêu: Ăn uống, Di chuyển, Mua sắm, Giải trí, Hóa đơn, Y tế, Giáo dục, Khác

### Giao dịch mẫu:
- Lương tháng 1: +15,000,000 VND
- Ăn sáng: -50,000 VND
- Xăng xe: -200,000 VND
- Mua sắm: -500,000 VND

### Ngân sách mẫu:
- Ăn uống: 2,000,000 VND/tháng
- Di chuyển: 1,000,000 VND/tháng
- Giải trí: 500,000 VND/tháng

## 🔧 TROUBLESHOOTING

### Lỗi kết nối SQL Server
```cmd
# Kiểm tra SQL Server service
services.msc -> SQL Server (TIEUNHATBACH)

# Kiểm tra SQL Server Configuration Manager
SQLServerManager15.msc
```

### Lỗi quyền truy cập
```sql
-- Cấp quyền cho user sa
ALTER LOGIN sa ENABLE;
ALTER LOGIN sa WITH PASSWORD = '123456';
```

### Lỗi Agent Job
```sql
-- Kiểm tra SQL Server Agent
SELECT @@SERVERNAME;
EXEC msdb.dbo.sp_help_job @job_name = 'PersonalFinance_ProcessRecurringTransactions';
```

## 📞 HỖ TRỢ
**Tác giả:** Tiểu Nhất Bạch  
**Email:** support@tieunhatbach.dev  
**Bản quyền:** © Tiểu Nhất Bạch 2025  

---
*Database đã được test và validate hoàn toàn, sẵn sàng cho production!*