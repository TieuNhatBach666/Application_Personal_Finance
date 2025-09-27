# Database Setup for Personal Finance Manager

## Connection Information
- **Server Name:** TIEUNHATBACH\TIEUNHATBACH
- **Login:** sa
- **Password:** 123456
- **Database:** PersonalFinanceDB

## Setup Instructions

### 1. Install Dependencies
```bash
cd database
npm install
```

### 2. Test Database Connection
```bash
npm run test-connection
```

### 3. Kiểm tra và tạo Database

**Bước 1: Kiểm tra trạng thái database hiện tại**
1. Mở SQL Server Management Studio (SSMS)
2. Kết nối đến server: `TIEUNHATBACH666\TIEUNHATBACH` với tài khoản sa/123456
3. Mở và chạy file `check-database-status.sql` để kiểm tra database có tồn tại và có đầy đủ bảng không

**Bước 2: Tạo database hoàn chỉnh với tất cả fixes**
1. Trong SSMS, mở file `complete-database-export.sql`
2. Chạy (Execute) script này để tạo database hoàn chỉnh
3. Script sẽ tự động:
   - Xóa database cũ (nếu có) và tạo mới
   - Tạo tất cả 9 bảng cần thiết
   - Tạo indexes để tối ưu hiệu suất
   - Tạo stored procedures, functions và views
   - Chèn dữ liệu mẫu hoàn chỉnh
   - Tạo user test với email: `nguoidung@vidu.com`, mật khẩu: `123456`

**Bước 3: Khởi động lại backend**
Sau khi chạy script database, khởi động lại backend:
```bash
cd backend
npm start
```

> ✅ **Khuyến nghị**: Sử dụng file `complete-database-export.sql` thay vì `create-database.sql` để có database hoàn chỉnh với tất cả tính năng và không gặp lỗi.

> ⚠️ **Quan trọng**: Nếu gặp lỗi "Invalid object name 'Users'", có nghĩa là bảng chưa được tạo. Hãy chạy lại script `complete-database-export.sql` trong SSMS.

## Database Schema

### Tables Created:
1. **Users** - User accounts and authentication
2. **Categories** - Income and expense categories
3. **Transactions** - All financial transactions
4. **Budgets** - Budget allocations with various periods
5. **UserSettings** - User preferences and settings
6. **Notifications** - System notifications and alerts

### Default Categories:
**Income Categories:**
- Lương (Salary)
- Thưởng (Bonus)
- Phụ cấp (Allowance)
- Đầu tư (Investment)
- Kinh doanh (Business)
- Thu nhập khác (Other Income)

**Expense Categories:**
- Ăn uống (Food & Dining)
- Đi lại (Transportation)
- Học tập (Education)
- Giải trí (Entertainment)
- Y tế (Healthcare)
- Mua sắm (Shopping)
- Hóa đơn (Bills)
- Nhà ở (Housing)
- Quần áo (Clothing)
- Chi tiêu khác (Other Expenses)

### Stored Procedures:
- `sp_CreateDefaultCategoriesForUser` - Creates default categories for new users

### Functions:
- `fn_GetBudgetProgress` - Calculates budget progress and status

### Views:
- `vw_TransactionSummary` - Aggregated transaction data by month/category

## Performance Optimizations

### Indexes Created:
- `IX_Transactions_UserID_Date` - For transaction queries by user and date
- `IX_Transactions_CategoryID` - For category-based filtering
- `IX_Categories_UserID_Type` - For category management
- `IX_Budgets_UserID_Month_Year` - For budget queries
- `IX_UserSettings_UserID_Key` - For settings lookup
- `IX_Notifications_UserID_Read` - For notification queries

## Troubleshooting

### Common Connection Issues:

1. **Login Failed (ELOGIN)**
   - Check if SQL Server Authentication is enabled
   - Verify sa account is enabled and password is correct
   - Check if user has permission to access the database

2. **Connection Timeout (ETIMEOUT)**
   - Ensure SQL Server service is running
   - Check if TCP/IP protocol is enabled
   - Verify firewall settings

3. **Server Not Found (ENOTFOUND)**
   - Confirm server name: `TIEUNHATBACH\TIEUNHATBACH`
   - Ensure SQL Server Browser service is running
   - Check network connectivity

### SQL Server Configuration:
1. Enable SQL Server Authentication mode
2. Enable TCP/IP protocol
3. Start SQL Server Browser service
4. Configure firewall to allow SQL Server traffic

## Next Steps

After successful database setup:
1. Test the connection using `npm run test-connection`
2. Verify all tables are created
3. Check that default categories are inserted
4. Proceed to backend API development (Task 1.3)

## Xuất dữ liệu để chia sẻ trên GitHub

Nếu bạn cần xuất schema và dữ liệu database để chia sẻ trên GitHub, vui lòng tham khảo [Hướng dẫn Xuất dữ liệu](EXPORT-GUIDE.md) của chúng tôi cung cấp hướng dẫn chi tiết về:
- Xuất schema database không có dữ liệu
- Xuất database cùng với dữ liệu
- Xuất các bảng cụ thể
- Thực hành tốt khi chia sẻ trên GitHub

### Các lệnh xuất nhanh:
```bash
# Xuất chỉ schema
npm run export-schema

# Xuất với dữ liệu mẫu
npm run export-sample

# Xuất database hoàn chỉnh (sử dụng cẩn thận)
npm run export-full
```