/**
 * Export Service - Xuất báo cáo dưới nhiều định dạng
 * Tác giả: Tiểu Nhất Bạch
 */

import * as XLSX from 'xlsx';

export interface ReportData {
  title: string;
  period: string;
  dateRange: string;
  summary: {
    totalIncome: number;
    totalExpense: number;
    netSavings: number;
    transactionCount: number;
  };
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  generatedAt: string;
  generatedBy: string;
}

/**
 * Xuất báo cáo dưới định dạng JSON
 */
export const exportToJSON = (data: ReportData, filename: string) => {
  try {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    downloadFile(dataBlob, `${filename}.json`);
    console.log('📊 JSON report exported successfully');
  } catch (error) {
    console.error('❌ Failed to export JSON:', error);
    throw new Error('Không thể xuất báo cáo JSON');
  }
};

/**
 * Xuất báo cáo dưới định dạng CSV
 */
export const exportToCSV = (data: ReportData, filename: string) => {
  try {
    let csvContent = '';
    
    // Header
    csvContent += `Báo Cáo Thống Kê,${data.title}\n`;
    csvContent += `Thời gian,${data.period}\n`;
    csvContent += `Khoảng thời gian,${data.dateRange}\n`;
    csvContent += `Tạo lúc,${data.generatedAt}\n`;
    csvContent += `Tạo bởi,${data.generatedBy}\n\n`;
    
    // Summary
    csvContent += `TỔNG QUAN\n`;
    csvContent += `Tổng thu nhập,${data.summary.totalIncome}\n`;
    csvContent += `Tổng chi tiêu,${data.summary.totalExpense}\n`;
    csvContent += `Tiết kiệm ròng,${data.summary.netSavings}\n`;
    csvContent += `Số giao dịch,${data.summary.transactionCount}\n\n`;
    
    // Category breakdown
    csvContent += `CHI TIẾT THEO DANH MỤC\n`;
    csvContent += `Danh mục,Số tiền,Phần trăm\n`;
    data.categoryBreakdown.forEach(cat => {
      csvContent += `${cat.category},${cat.amount},${cat.percentage}%\n`;
    });
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(dataBlob, `${filename}.csv`);
    console.log('📊 CSV report exported successfully');
  } catch (error) {
    console.error('❌ Failed to export CSV:', error);
    throw new Error('Không thể xuất báo cáo CSV');
  }
};

/**
 * Xuất báo cáo dưới định dạng Excel XLSX
 */
export const exportToExcel = (data: ReportData, filename: string) => {
  try {
    // Tạo workbook mới
    const wb = XLSX.utils.book_new();
    
    // Sheet 1: Tổng quan
    const summaryData = [
      ['BÁO CÁO THỐNG KÊ TÀI CHÍNH'],
      [''],
      ['Tiêu đề:', data.title],
      ['Thời gian:', data.period],
      ['Khoảng thời gian:', data.dateRange],
      ['Tạo lúc:', data.generatedAt],
      ['Tạo bởi:', data.generatedBy],
      [''],
      ['TỔNG QUAN'],
      ['Tổng thu nhập:', data.summary.totalIncome],
      ['Tổng chi tiêu:', data.summary.totalExpense],
      ['Tiết kiệm ròng:', data.summary.netSavings],
      ['Số giao dịch:', data.summary.transactionCount],
    ];
    
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Định dạng cột
    wsSummary['!cols'] = [
      { wch: 25 }, // Column A
      { wch: 20 }  // Column B
    ];
    
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng Quan');
    
    // Sheet 2: Chi tiết theo danh mục
    const categoryHeaders = ['Danh mục', 'Số tiền', 'Phần trăm (%)'];
    const categoryRows = data.categoryBreakdown.map(cat => [
      cat.category,
      cat.amount,
      cat.percentage
    ]);
    
    const categoryData = [categoryHeaders, ...categoryRows];
    const wsCategory = XLSX.utils.aoa_to_sheet(categoryData);
    
    // Định dạng cột cho sheet danh mục
    wsCategory['!cols'] = [
      { wch: 30 }, // Danh mục
      { wch: 20 }, // Số tiền
      { wch: 15 }  // Phần trăm
    ];
    
    XLSX.utils.book_append_sheet(wb, wsCategory, 'Chi Tiết Danh Mục');
    
    // Xuất file
    XLSX.writeFile(wb, `${filename}.xlsx`);
    console.log('📊 Excel report exported successfully');
  } catch (error) {
    console.error('❌ Failed to export Excel:', error);
    throw new Error('Không thể xuất báo cáo Excel');
  }
};

/**
 * Xuất báo cáo dưới định dạng HTML (có thể in thành PDF)
 */
export const exportToHTML = (data: ReportData, filename: string) => {
  try {
    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 40px;
            color: #333;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #3498db;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2c3e50;
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            color: #7f8c8d;
            margin: 5px 0;
            font-size: 1.1em;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        .summary-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #495057;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .summary-card .value {
            font-size: 1.8em;
            font-weight: bold;
            color: #2c3e50;
        }
        .income { border-left: 5px solid #27ae60; }
        .expense { border-left: 5px solid #e74c3c; }
        .savings { border-left: 5px solid #3498db; }
        .transactions { border-left: 5px solid #f39c12; }
        
        .breakdown {
            margin-top: 40px;
        }
        .breakdown h2 {
            color: #2c3e50;
            border-bottom: 2px solid #ecf0f1;
            padding-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #ecf0f1;
        }
        th {
            background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        tr:hover {
            background-color: #f8f9fa;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #7f8c8d;
            font-size: 0.9em;
            border-top: 1px solid #ecf0f1;
            padding-top: 20px;
        }
        @media print {
            body { margin: 20px; }
            .summary { grid-template-columns: repeat(2, 1fr); }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.title}</h1>
        <p><strong>Thời gian:</strong> ${data.period}</p>
        <p><strong>Khoảng thời gian:</strong> ${data.dateRange}</p>
        <p><strong>Tạo lúc:</strong> ${data.generatedAt}</p>
    </div>

    <div class="summary">
        <div class="summary-card income">
            <h3>Tổng Thu Nhập</h3>
            <div class="value">${data.summary.totalIncome.toLocaleString('vi-VN')} ₫</div>
        </div>
        <div class="summary-card expense">
            <h3>Tổng Chi Tiêu</h3>
            <div class="value">${data.summary.totalExpense.toLocaleString('vi-VN')} ₫</div>
        </div>
        <div class="summary-card savings">
            <h3>Tiết Kiệm Ròng</h3>
            <div class="value">${data.summary.netSavings.toLocaleString('vi-VN')} ₫</div>
        </div>
        <div class="summary-card transactions">
            <h3>Số Giao Dịch</h3>
            <div class="value">${data.summary.transactionCount}</div>
        </div>
    </div>

    <div class="breakdown">
        <h2>📊 Chi Tiết Theo Danh Mục</h2>
        <table>
            <thead>
                <tr>
                    <th>Danh Mục</th>
                    <th>Số Tiền</th>
                    <th>Phần Trăm</th>
                </tr>
            </thead>
            <tbody>
                ${data.categoryBreakdown.map(cat => `
                    <tr>
                        <td>${cat.category}</td>
                        <td>${cat.amount.toLocaleString('vi-VN')} ₫</td>
                        <td>${cat.percentage.toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>© 2025 ${data.generatedBy} - Tác giả: Tiểu Nhất Bạch</p>
        <p>Báo cáo này được tạo tự động từ dữ liệu thực tế của bạn</p>
    </div>
</body>
</html>`;

    const dataBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    downloadFile(dataBlob, `${filename}.html`);
    console.log('📊 HTML report exported successfully');
  } catch (error) {
    console.error('❌ Failed to export HTML:', error);
    throw new Error('Không thể xuất báo cáo HTML');
  }
};

/**
 * Helper function để download file
 */
const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Xuất báo cáo với nhiều lựa chọn định dạng
 */
export const exportReport = async (
  data: ReportData, 
  format: 'json' | 'csv' | 'excel' | 'html' = 'json',
  customFilename?: string
) => {
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = customFilename || `bao-cao-thong-ke-${data.period.toLowerCase()}-${timestamp}`;
  
  try {
    switch (format) {
      case 'excel':
        exportToExcel(data, filename);
        break;
      case 'csv':
        exportToCSV(data, filename);
        break;
      case 'html':
        exportToHTML(data, filename);
        break;
      case 'json':
      default:
        exportToJSON(data, filename);
        break;
    }
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
};
