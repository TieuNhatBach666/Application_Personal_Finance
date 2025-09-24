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
    
    echo ⏳ Chờ 2 giây để port được giải phóng...
    timeout /t 2 /nobreak >nul
) else (
    echo ✅ Port 5000 sẵn sàng!
)

echo.
echo 🚀 Khởi động backend server...
cd backend
npm start
