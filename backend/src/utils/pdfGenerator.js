const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
    constructor() {
        this.doc = null;
    }

    createFinancialReport(userData, transactions, summary, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                this.doc = new PDFDocument({ margin: 50 });
                const chunks = [];

                this.doc.on('data', chunk => chunks.push(chunk));
                this.doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    resolve(pdfBuffer);
                });

                // Header
                this.addHeader(userData, options);
                
                // Summary Section
                this.addSummarySection(summary);
                
                // Transactions Table
                this.addTransactionsTable(transactions);
                
                // Footer
                this.addFooter();

                this.doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    addHeader(userData, options) {
        const { startDate, endDate } = options;
        
        // Title
        this.doc.fontSize(20)
               .font('Helvetica-Bold')
               .text('BÁO CÁO TÀI CHÍNH CÁ NHÂN', 50, 50);

        // User info
        this.doc.fontSize(12)
               .font('Helvetica')
               .text(`Người dùng: ${userData.firstName} ${userData.lastName}`, 50, 80)
               .text(`Email: ${userData.email}`, 50, 95);

        // Date range
        if (startDate && endDate) {
            this.doc.text(`Thời gian: ${startDate} - ${endDate}`, 50, 110);
        }

        // Date generated
        this.doc.text(`Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}`, 50, 125);

        // Line separator
        this.doc.moveTo(50, 150)
               .lineTo(550, 150)
               .stroke();
    }

    addSummarySection(summary) {
        let yPosition = 170;

        this.doc.fontSize(16)
               .font('Helvetica-Bold')
               .text('TỔNG QUAN TÀI CHÍNH', 50, yPosition);

        yPosition += 30;

        // Summary cards
        const summaryData = [
            { label: 'Tổng thu nhập:', value: this.formatCurrency(summary.totalIncome), color: '#27ae60' },
            { label: 'Tổng chi tiêu:', value: this.formatCurrency(summary.totalExpense), color: '#e74c3c' },
            { label: 'Tiết kiệm:', value: this.formatCurrency(summary.netSavings), color: summary.netSavings >= 0 ? '#3498db' : '#e74c3c' },
            { label: 'Số giao dịch:', value: summary.transactionCount.toString(), color: '#9b59b6' }
        ];

        summaryData.forEach((item, index) => {
            const xPosition = 50 + (index % 2) * 250;
            const yPos = yPosition + Math.floor(index / 2) * 40;

            this.doc.fontSize(12)
                   .font('Helvetica')
                   .fillColor('#333333')
                   .text(item.label, xPosition, yPos)
                   .font('Helvetica-Bold')
                   .fillColor(item.color)
                   .text(item.value, xPosition + 100, yPos);
        });

        return yPosition + 100;
    }

    addTransactionsTable(transactions) {
        let yPosition = 320;

        this.doc.fontSize(16)
               .font('Helvetica-Bold')
               .fillColor('#333333')
               .text('CHI TIẾT GIAO DỊCH', 50, yPosition);

        yPosition += 30;

        // Table headers
        const headers = ['Ngày', 'Mô tả', 'Danh mục', 'Loại', 'Số tiền'];
        const columnWidths = [80, 150, 100, 60, 100];
        let xPosition = 50;

        this.doc.fontSize(10)
               .font('Helvetica-Bold')
               .fillColor('#333333');

        headers.forEach((header, index) => {
            this.doc.text(header, xPosition, yPosition, { width: columnWidths[index] });
            xPosition += columnWidths[index];
        });

        // Table line
        yPosition += 20;
        this.doc.moveTo(50, yPosition)
               .lineTo(540, yPosition)
               .stroke();

        yPosition += 10;

        // Table rows
        this.doc.fontSize(9)
               .font('Helvetica');

        transactions.slice(0, 20).forEach((transaction, index) => {
            if (yPosition > 700) {
                this.doc.addPage();
                yPosition = 50;
            }

            xPosition = 50;
            const rowData = [
                new Date(transaction.Date || transaction.transactionDate).toLocaleDateString('vi-VN'),
                transaction.Description || transaction.description || '',
                transaction.CategoryName || transaction.categoryName || '',
                transaction.Type === 'Income' ? 'Thu' : 'Chi',
                this.formatCurrency(transaction.Amount || transaction.amount)
            ];

            const textColor = transaction.Type === 'Income' ? '#27ae60' : '#e74c3c';

            rowData.forEach((data, colIndex) => {
                this.doc.fillColor(colIndex === 4 ? textColor : '#333333')
                       .text(data, xPosition, yPosition, { width: columnWidths[colIndex] });
                xPosition += columnWidths[colIndex];
            });

            yPosition += 15;
        });

        if (transactions.length > 20) {
            yPosition += 10;
            this.doc.fontSize(10)
                   .fillColor('#666666')
                   .text(`... và ${transactions.length - 20} giao dịch khác`, 50, yPosition);
        }
    }

    addFooter() {
        const pageHeight = this.doc.page.height;
        
        this.doc.fontSize(8)
               .fillColor('#666666')
               .text('Báo cáo được tạo bởi Ứng dụng Quản lý Tài chính Cá nhân', 50, pageHeight - 50)
               .text(`Trang 1`, 500, pageHeight - 50);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    }
}

module.exports = PDFGenerator;
