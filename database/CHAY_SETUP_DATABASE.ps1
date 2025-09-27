# PowerShell Script để setup database
# Tác giả: Tiểu Nhất Bạch

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "🚀 PERSONAL FINANCE MANAGER - SETUP DATABASE" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "👤 Tác giả: Tiểu Nhất Bạch" -ForegroundColor Yellow
Write-Host "📅 Ngày: $(Get-Date)" -ForegroundColor Yellow
Write-Host ""

# Kiểm tra SQL Server Module
Write-Host "🔍 Kiểm tra SQL Server PowerShell Module..." -ForegroundColor Blue

try {
    Import-Module SqlServer -ErrorAction Stop
    Write-Host "✅ SQL Server Module đã sẵn sàng!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ SQL Server PowerShell Module chưa được cài đặt!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Bạn có các lựa chọn sau:" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 CÁCH 1: Cài đặt SQL Server PowerShell Module" -ForegroundColor Cyan
    Write-Host "   Install-Module -Name SqlServer -Force" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🖱️ CÁCH 2: Chạy thủ công trong SSMS (KHUYẾN NGHỊ)" -ForegroundColor Cyan
    Write-Host "   1. Mở SQL Server Management Studio" -ForegroundColor Gray
    Write-Host "   2. Kết nối với server: TIEUNHATBACH\TIEUNHATBACH" -ForegroundColor Gray
    Write-Host "   3. Login: sa / Password: 123456" -ForegroundColor Gray
    Write-Host "   4. Mở file: SETUP_HOAN_CHINH_DATABASE.sql" -ForegroundColor Gray
    Write-Host "   5. Nhấn F5 để chạy" -ForegroundColor Gray
    Write-Host ""
    Read-Host "Nhấn Enter để thoát"
    exit 1
}

# Thông tin kết nối
$ServerInstance = "TIEUNHATBACH\TIEUNHATBACH"
$Username = "sa"
$Password = "123456"
$SqlFile = "SETUP_HOAN_CHINH_DATABASE.sql"

Write-Host "🔍 Kiểm tra kết nối SQL Server..." -ForegroundColor Blue

try {
    # Test connection
    $TestQuery = "SELECT @@VERSION"
    Invoke-Sqlcmd -ServerInstance $ServerInstance -Username $Username -Password $Password -Query $TestQuery -ErrorAction Stop | Out-Null
    Write-Host "✅ Kết nối SQL Server thành công!" -ForegroundColor Green
} catch {
    Write-Host "❌ Không thể kết nối đến SQL Server!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Vui lòng kiểm tra:" -ForegroundColor Yellow
    Write-Host "   - SQL Server có đang chạy không?" -ForegroundColor Gray
    Write-Host "   - Server name: $ServerInstance" -ForegroundColor Gray
    Write-Host "   - Login: $Username / Password: $Password" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Thử chạy thủ công trong SSMS thay thế!" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Nhấn Enter để thoát"
    exit 1
}

Write-Host ""
Write-Host "🗄️ Đang chạy setup database..." -ForegroundColor Blue
Write-Host "📁 File: $SqlFile" -ForegroundColor Gray
Write-Host ""

try {
    # Chạy SQL script
    if (Test-Path $SqlFile) {
        Invoke-Sqlcmd -ServerInstance $ServerInstance -Username $Username -Password $Password -InputFile $SqlFile -Verbose
        
        Write-Host ""
        Write-Host "===============================================" -ForegroundColor Cyan
        Write-Host "🎉 SETUP DATABASE THÀNH CÔNG!" -ForegroundColor Green
        Write-Host "===============================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Thông tin đăng nhập mẫu:" -ForegroundColor Yellow
        Write-Host "   📧 Email: nguoidung@vidu.com" -ForegroundColor White
        Write-Host "   🔑 Mật khẩu: 123456" -ForegroundColor White
        Write-Host ""
        Write-Host "🚀 Bước tiếp theo:" -ForegroundColor Yellow
        Write-Host "   1. Mở terminal mới và chạy: cd backend && npm run dev" -ForegroundColor Gray
        Write-Host "   2. Mở terminal khác và chạy: cd frontend && npm run dev" -ForegroundColor Gray
        Write-Host ""
        Write-Host "🎯 Ứng dụng sẽ chạy tại: http://localhost:3000" -ForegroundColor Cyan
        Write-Host ""
    } else {
        Write-Host "❌ Không tìm thấy file: $SqlFile" -ForegroundColor Red
        Write-Host "🔧 Vui lòng đảm bảo file SQL tồn tại trong thư mục hiện tại." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ CÓ LỖI XẢY RA KHI SETUP DATABASE!" -ForegroundColor Red
    Write-Host "🔧 Chi tiết lỗi: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Thử chạy thủ công trong SSMS để xem chi tiết lỗi." -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "💎 Bản quyền thuộc về Tiểu Nhất Bạch" -ForegroundColor Magenta
Write-Host ""
Read-Host "Nhấn Enter để thoát"
