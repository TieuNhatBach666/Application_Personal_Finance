# ========================================
# SCRIPT POWERSHELL XUẤT DATABASE
# Tác giả: Tiểu Nhất Bạch
# Ngày: 28/09/2025
# ========================================

param(
    [string]$ServerName = "TIEUNHATBACH666\TIEUNHATBACH",
    [string]$DatabaseName = "PersonalFinanceDB",
    [string]$Username = "sa",
    [string]$Password = "123456",
    [string]$OutputPath = ".\PersonalFinanceDB_Export.sql"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    XUẤT DATABASE PERSONALFINANCEDB" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Thông tin kết nối:" -ForegroundColor Yellow
Write-Host "Server: $ServerName" -ForegroundColor White
Write-Host "Database: $DatabaseName" -ForegroundColor White
Write-Host "Output: $OutputPath" -ForegroundColor White
Write-Host ""

try {
    # Import SQL Server module
    Import-Module SqlServer -ErrorAction SilentlyContinue
    
    if (-not (Get-Module -Name SqlServer)) {
        Write-Host "Đang cài đặt SQL Server PowerShell module..." -ForegroundColor Yellow
        Install-Module -Name SqlServer -Force -AllowClobber
        Import-Module SqlServer
    }

    # Tạo connection string
    $connectionString = "Server=$ServerName;Database=$DatabaseName;User Id=$Username;Password=$Password;TrustServerCertificate=True;"
    
    Write-Host "Đang kết nối đến database..." -ForegroundColor Yellow
    
    # Test connection
    $testQuery = "SELECT @@VERSION"
    $result = Invoke-Sqlcmd -ConnectionString $connectionString -Query $testQuery
    Write-Host "✅ Kết nối thành công!" -ForegroundColor Green
    Write-Host "SQL Server Version: $($result.Column1.Substring(0,50))..." -ForegroundColor Gray
    Write-Host ""

    # Tạo file output
    $outputContent = @"
-- ========================================
-- XUẤT TOÀN BỘ DATABASE PERSONALFINANCEDB
-- Ngày xuất: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")
-- Tác giả: Tiểu Nhất Bạch
-- ========================================

USE master;
GO

-- Tạo database nếu chưa tồn tại
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'$DatabaseName')
BEGIN
    CREATE DATABASE [$DatabaseName];
END
GO

USE [$DatabaseName];
GO

"@

    Write-Host "Đang xuất cấu trúc bảng..." -ForegroundColor Yellow
    
    # Lấy danh sách bảng
    $tables = Invoke-Sqlcmd -ConnectionString $connectionString -Query @"
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'
ORDER BY TABLE_NAME
"@

    foreach ($table in $tables) {
        $tableName = $table.TABLE_NAME
        Write-Host "  - Xuất bảng: $tableName" -ForegroundColor Cyan
        
        # Lấy cấu trúc bảng
        $createTableScript = Invoke-Sqlcmd -ConnectionString $connectionString -Query @"
DECLARE @sql NVARCHAR(MAX) = ''
SELECT @sql = @sql + 
    'CREATE TABLE [dbo].[$tableName] (' + CHAR(13) +
    STUFF((
        SELECT ', [' + COLUMN_NAME + '] ' + DATA_TYPE + 
               CASE 
                   WHEN CHARACTER_MAXIMUM_LENGTH IS NOT NULL 
                   THEN '(' + CAST(CHARACTER_MAXIMUM_LENGTH AS VARCHAR(10)) + ')'
                   WHEN NUMERIC_PRECISION IS NOT NULL 
                   THEN '(' + CAST(NUMERIC_PRECISION AS VARCHAR(10)) + ',' + CAST(NUMERIC_SCALE AS VARCHAR(10)) + ')'
                   ELSE ''
               END +
               CASE WHEN IS_NULLABLE = 'NO' THEN ' NOT NULL' ELSE ' NULL' END + CHAR(13)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = '$tableName' AND TABLE_SCHEMA = 'dbo'
        ORDER BY ORDINAL_POSITION
        FOR XML PATH('')
    ), 1, 2, '') + ');' + CHAR(13) + 'GO' + CHAR(13)
SELECT @sql as CreateScript
"@
        
        $outputContent += $createTableScript.CreateScript
        
        # Lấy dữ liệu bảng
        $data = Invoke-Sqlcmd -ConnectionString $connectionString -Query "SELECT * FROM [$tableName]"
        
        if ($data.Count -gt 0) {
            $outputContent += "`n-- Dữ liệu cho bảng $tableName`n"
            
            foreach ($row in $data) {
                $columns = ($row.PSObject.Properties | Where-Object { $_.Name -ne "RowError" -and $_.Name -ne "RowState" -and $_.Name -ne "Table" -and $_.Name -ne "ItemArray" -and $_.Name -ne "HasErrors" }).Name
                $values = @()
                
                foreach ($col in $columns) {
                    $value = $row.$col
                    if ($value -eq $null) {
                        $values += "NULL"
                    } elseif ($value -is [string]) {
                        $values += "'$($value.Replace("'", "''"))'"
                    } elseif ($value -is [datetime]) {
                        $values += "'$($value.ToString("yyyy-MM-dd HH:mm:ss"))'"
                    } elseif ($value -is [bool]) {
                        $values += if ($value) { "1" } else { "0" }
                    } else {
                        $values += "$value"
                    }
                }
                
                $columnList = "[" + ($columns -join "], [") + "]"
                $valueList = $values -join ", "
                $outputContent += "INSERT INTO [$tableName] ($columnList) VALUES ($valueList);`n"
            }
            $outputContent += "GO`n`n"
        }
    }

    Write-Host "Đang xuất stored procedures..." -ForegroundColor Yellow
    
    # Xuất stored procedures
    $procedures = Invoke-Sqlcmd -ConnectionString $connectionString -Query @"
SELECT ROUTINE_NAME, ROUTINE_DEFINITION
FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_TYPE = 'PROCEDURE' AND ROUTINE_SCHEMA = 'dbo'
"@

    if ($procedures) {
        $outputContent += "`n-- ========================================`n"
        $outputContent += "-- STORED PROCEDURES`n"
        $outputContent += "-- ========================================`n`n"
        
        foreach ($proc in $procedures) {
            Write-Host "  - Xuất procedure: $($proc.ROUTINE_NAME)" -ForegroundColor Cyan
            $outputContent += "$($proc.ROUTINE_DEFINITION)`nGO`n`n"
        }
    }

    Write-Host "Đang lưu file..." -ForegroundColor Yellow
    
    # Lưu file
    $outputContent | Out-File -FilePath $OutputPath -Encoding UTF8
    
    $fileSize = (Get-Item $OutputPath).Length
    $fileSizeKB = [math]::Round($fileSize / 1024, 2)
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "    XUẤT DATABASE HOÀN THÀNH!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "File: $OutputPath" -ForegroundColor White
    Write-Host "Kích thước: $fileSizeKB KB" -ForegroundColor White
    Write-Host "Số bảng: $($tables.Count)" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host "❌ Lỗi: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Chi tiết: $($_.Exception.InnerException)" -ForegroundColor Red
}

Read-Host "Nhấn Enter để thoát"
