@echo off
chcp 65001 >nul
echo.
echo ===============================================
echo 🚀 PERSONAL FINANCE MANAGER - SETUP DATABASE
echo ===============================================
echo 👤 Tác giả: Tiểu Nhất Bạch
echo 📅 Ngày: %date% %time%
echo.

echo 🔍 Kiểm tra sqlcmd...
where sqlcmd >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ sqlcmd không được tìm thấy!
    echo 📋 Bạn có 2 lựa chọn:
    echo.
    echo 🔧 CÁCH 1: Cài đặt SQL Server Command Line Utilities
    echo    - Tải từ: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility
    echo    - Hoặc cài SQL Server Management Studio ^(SSMS^)
    echo.
    echo 🖱️ CÁCH 2: Chạy thủ công trong SSMS ^(KHUYẾN NGHỊ^)
    echo    1. Mở SQL Server Management Studio
    echo    2. Kết nối với server: TIEUNHATBACH\TIEUNHATBACH
    echo    3. Login: sa / Password: 123456
    echo    4. Mở file: SETUP_HOAN_CHINH_DATABASE.sql
    echo    5. Nhấn F5 để chạy
    echo.
    echo 💡 CÁCH 3: Sử dụng PowerShell Script
    echo    - Chạy file: CHAY_SETUP_DATABASE.ps1
    echo.
    pause
    exit /b 1
)

echo ✅ sqlcmd đã sẵn sàng!
echo.

echo 🔍 Kiểm tra kết nối SQL Server...
sqlcmd -S "TIEUNHATBACH\TIEUNHATBACH" -U sa -P 123456 -Q "SELECT @@VERSION" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Không thể kết nối đến SQL Server!
    echo 🔧 Vui lòng kiểm tra:
    echo    - SQL Server có đang chạy không?
    echo    - Server name: TIEUNHATBACH\TIEUNHATBACH
    echo    - Login: sa / Password: 123456
    echo.
    echo 💡 Thử chạy thủ công trong SSMS thay thế!
    echo.
    pause
    exit /b 1
)

echo ✅ Kết nối SQL Server thành công!
echo.

echo 🗄️ Đang chạy setup database...
echo 📁 File: SETUP_HOAN_CHINH_DATABASE.sql
echo.

sqlcmd -S "TIEUNHATBACH\TIEUNHATBACH" -U sa -P 123456 -i "SETUP_HOAN_CHINH_DATABASE.sql"

if %errorlevel% equ 0 (
    echo.
    echo ===============================================
    echo 🎉 SETUP DATABASE THÀNH CÔNG!
    echo ===============================================
    echo.
    echo 📋 Thông tin đăng nhập mẫu:
    echo    📧 Email: nguoidung@vidu.com
    echo    🔑 Mật khẩu: 123456
    echo.
    echo 🚀 Bước tiếp theo:
    echo    1. Mở terminal mới và chạy: cd backend ^&^& npm run dev
    echo    2. Mở terminal khác và chạy: cd frontend ^&^& npm run dev
    echo.
    echo 🎯 Ứng dụng sẽ chạy tại: http://localhost:3000
    echo.
) else (
    echo.
    echo ❌ CÓ LỖI XẢY RA KHI SETUP DATABASE!
    echo 🔧 Vui lòng kiểm tra lại file SQL hoặc quyền truy cập.
    echo.
)

echo 💎 Bản quyền thuộc về Tiểu Nhất Bạch
echo.
pause
