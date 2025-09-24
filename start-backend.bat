@echo off
echo 🚀 KHỞI ĐỘNG BACKEND SERVER
echo ========================

echo 🔍 Kiểm tra port 5000...
netstat -ano | findstr :5000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Port 5000 đang được sử dụng!
    echo 💀 Đang kill các process cũ...

    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        if not "%%a"=="0" (
            taskkill /PID %%a /F >nul 2>&1
            echo ✅ Đã kill PID %%a
        )
    )

    echo ⏳ Chờ 3 giây để port được giải phóng...
    timeout /t 3 /nobreak >nul

    REM Kiểm tra lại
    netstat -ano | findstr :5000 >nul 2>&1
    if %errorlevel% equ 0 (
        echo ❌ Vẫn còn process sử dụng port 5000, thử kill tất cả node.exe
        taskkill /f /im node.exe >nul 2>&1
        timeout /t 2 /nobreak >nul
    )
) else (
    echo ✅ Port 5000 sẵn sàng!
)

echo.
echo 🚀 Khởi động backend server...
if not exist "backend" (
    echo ❌ Thư mục backend không tồn tại!
    echo 📁 Đang ở thư mục: %CD%
    pause
    exit /b 1
)

cd backend
echo 📂 Chuyển vào thư mục backend: %CD%
npm start
