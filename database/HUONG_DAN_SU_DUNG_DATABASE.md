# 🗄️ HƯỚNG DẪN SỬ DỤNG DATABASE - PERSONAL FINANCE MANAGER

**Tác giả:** Tiểu Nhất Bạch  
**Phiên bản:** 1.0  
**Ngày cập nhật:** 25/09/2025  

## 🎯 MỤC ĐÍCH

Thư mục này chứa các file SQL để thiết lập database cho ứng dụng Quản Lý Tài Chính Cá Nhân.

## 🚀 CÁCH SỬ DỤNG NHANH NHẤT

### ⭐ CÁCH 1: Sử dụng SSMS (KHUYẾN NGHỊ - LUÔN HOẠT ĐỘNG)

```sql
-- Mở SQL Server Management Studio (SSMS)
-- Kết nối với server: TIEUNHATBACH\TIEUNHATBACH
-- Login: sa / Password: 123456
-- Mở file: SETUP_HOAN_CHINH_DATABASE.sql
-- Nhấn F5 để chạy
```

### 🔧 CÁCH 2: Sử dụng Script tự động (Nếu có sqlcmd)

```bash
# Chạy file batch
CHAY_SETUP_DATABASE.bat

# Hoặc chạy PowerShell
CHAY_SETUP_DATABASE.ps1
```

### ⚠️ NẾU GẶP LỖI "sqlcmd is not recognized"

➡️ **Đọc file:** `CACH_CHAY_KHONG_CAN_SQLCMD.md` để biết cách khắc phục!

**File này sẽ:**
- ✅ Tạo database PersonalFinanceDB
- ✅ Tạo tất cả các bảng cần thiết
- ✅ Tạo indexes để tối ưu hiệu suất
- ✅ Chèn dữ liệu mẫu để test
- ✅ Tạo user demo với thông tin đăng nhập

## 📋 THÔNG TIN ĐĂNG NHẬP MẪU

Sau khi chạy file SQL, bạn có thể đăng nhập với:
- **Email:** `nguoidung@vidu.com`
- **Mật khẩu:** `123456`

## 📁 MÔ TẢ CÁC FILE

### 🌟 FILE CHÍNH (KHUYẾN NGHỊ)
- **`SETUP_HOAN_CHINH_DATABASE.sql`** - File tổng hợp hoàn chỉnh, chỉ cần chạy file này!

### 📚 CÁC FILE KHÁC (CHỈ THAM KHẢO)
- `create-database.sql` - File gốc tạo database cơ bản
- `complete-database-setup.sql` - Phiên bản setup khác
- `setup-default-data.sql` - Chèn dữ liệu mặc định
- `create_recurring_transactions.sql` - Tạo bảng giao dịch định kỳ
- `create_settings_tables.sql` - Tạo bảng cài đặt
- Các file khác - Các phiên bản cũ hoặc file fix lỗi

## 🔧 CẤU HÌNH KẾT NỐI

```
Server: TIEUNHATBACH\TIEUNHATBACH
Database: PersonalFinanceDB
Login: sa
Password: 123456
```

## 📊 CẤU TRÚC DATABASE

Sau khi chạy file setup, database sẽ có các bảng:

### 👥 Bảng chính
- **Users** - Thông tin người dùng
- **Categories** - Danh mục thu chi
- **Transactions** - Giao dịch tài chính
- **Budgets** - Ngân sách

### ⚙️ Bảng hỗ trợ
- **UserSettings** - Cài đặt người dùng
- **Notifications** - Thông báo hệ thống
- **RecurringTransactions** - Giao dịch định kỳ
- **RecurringTransactionHistory** - Lịch sử giao dịch định kỳ
- **BackupHistory** - Lịch sử sao lưu

## 🚀 KHỞI ĐỘNG ỨNG DỤNG

Sau khi setup database thành công:

```bash
# Khởi động Backend
cd backend
npm run dev

# Khởi động Frontend (terminal mới)
cd frontend
npm run dev
```

## ❗ LƯU Ý QUAN TRỌNG

1. **Chỉ cần chạy file `SETUP_HOAN_CHINH_DATABASE.sql`** - Đừng chạy nhiều file khác nhau!
2. Đảm bảo SQL Server đang chạy
3. Đảm bảo có quyền tạo database
4. File sẽ tự động xóa và tạo lại database nếu đã tồn tại

## 🆘 KHẮC PHỤC SỰ CỐ

### Nếu gặp lỗi khi chạy:
1. Kiểm tra kết nối SQL Server
2. Đảm bảo login `sa` có quyền sysadmin
3. Kiểm tra tên server có đúng không
4. Thử chạy từng phần của file để xác định lỗi

### Nếu muốn reset lại database:
Chỉ cần chạy lại file `SETUP_HOAN_CHINH_DATABASE.sql` - nó sẽ tự động xóa và tạo lại!

## 📞 HỖ TRỢ

Nếu gặp vấn đề, hãy kiểm tra:
- SQL Server có đang chạy không?
- Thông tin kết nối có đúng không?
- Có quyền tạo database không?

---

**💎 Bản quyền thuộc về Tiểu Nhất Bạch**  
**🎯 Mục tiêu: Làm cho việc setup database trở nên đơn giản nhất có thể!**
