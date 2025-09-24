@echo off
echo Stopping existing Node.js processes...
taskkill /f /im node.exe >nul 2>&1

echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo Starting backend server...
cd /d "d:\Đồ Án Kết Thúc Môn\Quản Lý Tài Chính Cá Nhân\backend"
npm start
