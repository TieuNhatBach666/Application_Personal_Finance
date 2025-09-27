# 🚀 CÁCH CHẠY DATABASE KHÔNG CẦN SQLCMD

**Vấn đề:** Máy tính không có `sqlcmd` hoặc SQL Server Command Line Utilities

## 🎯 GIẢI PHÁP ĐƠN GIẢN NHẤT (KHUYẾN NGHỊ)

### ✅ Cách 1: Sử dụng SQL Server Management Studio (SSMS)

1. **Mở SSMS:**
   - Tìm "SQL Server Management Studio" trong Start Menu
   - Hoặc tải về từ: https://docs.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms

2. **Kết nối với SQL Server:**
   - Server name: `TIEUNHATBACH\TIEUNHATBACH`
   - Authentication: `SQL Server Authentication`
   - Login: `sa`
   - Password: `123456`
   - Nhấn **Connect**

3. **Chạy file SQL:**
   - Nhấn **Ctrl+O** hoặc **File > Open > File**
   - Chọn file: `SETUP_HOAN_CHINH_DATABASE.sql`
   - Nhấn **F5** hoặc **Execute**
   - Đợi script chạy xong (khoảng 1-2 phút)

4. **Kiểm tra kết quả:**
   - Xem tab **Messages** để đọc thông báo
   - Nếu thấy "🎉 THIẾT LẬP DATABASE HOÀN TẤT!" là thành công!

---

### 🔧 Cách 2: Sử dụng PowerShell (Nếu có SQL Server Module)

```powershell
# Chạy PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Cài đặt SQL Server Module (nếu chưa có)
Install-Module -Name SqlServer -Force

# Chạy script
cd "d:\Đồ Án Kết Thúc Môn\Quản Lý Tài Chính Cá Nhân\database"
.\CHAY_SETUP_DATABASE.ps1
```

---

### 🖥️ Cách 3: Sử dụng Azure Data Studio

1. **Tải Azure Data Studio:**
   - https://docs.microsoft.com/en-us/sql/azure-data-studio/download-azure-data-studio

2. **Kết nối và chạy tương tự như SSMS**

---

### 📋 Cách 4: Copy-Paste từng phần (Nếu file quá lớn)

Nếu file SQL quá lớn, bạn có thể copy-paste từng phần:

1. **Mở file `SETUP_HOAN_CHINH_DATABASE.sql`** bằng Notepad
2. **Copy từ dòng 1 đến dòng 100** và paste vào SSMS, chạy
3. **Copy từ dòng 101 đến 200** và paste vào SSMS, chạy
4. **Tiếp tục** cho đến hết file

---

## 🔍 KIỂM TRA KẾT QUẢ

Sau khi chạy thành công, kiểm tra:

```sql
-- Kiểm tra database đã được tạo
SELECT name FROM sys.databases WHERE name = 'PersonalFinanceDB';

-- Kiểm tra các bảng
USE PersonalFinanceDB;
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES;

-- Kiểm tra dữ liệu mẫu
SELECT COUNT(*) as UserCount FROM Users;
SELECT COUNT(*) as CategoryCount FROM Categories;
SELECT COUNT(*) as TransactionCount FROM Transactions;
```

## 🎯 THÔNG TIN ĐĂNG NHẬP MẪU

Sau khi setup thành công:
- **Email:** `nguoidung@vidu.com`
- **Mật khẩu:** `123456`

## 🚀 BƯỚC TIẾP THEO

```bash
# Terminal 1: Khởi động Backend
cd backend
npm install
npm run dev

# Terminal 2: Khởi động Frontend  
cd frontend
npm install
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

---

**💡 Lời khuyên:** Cách 1 (SSMS) là đơn giản và tin cậy nhất!

**💎 Tác giả: Tiểu Nhất Bạch**
