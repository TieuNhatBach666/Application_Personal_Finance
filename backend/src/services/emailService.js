const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendBudgetAlert(userEmail, budgetData) {
        const { budgetName, spentAmount, budgetAmount, percentage } = budgetData;
        
        const subject = `🚨 Cảnh báo ngân sách: ${budgetName}`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">⚠️ Cảnh báo ngân sách</h1>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 16px; color: #2c3e50;">
                        Xin chào,<br><br>
                        Ngân sách "<strong>${budgetName}</strong>" của bạn đã vượt quá giới hạn cho phép.
                    </p>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e74c3c;">
                        <h3 style="color: #e74c3c; margin-top: 0;">Chi tiết ngân sách:</h3>
                        <p><strong>Ngân sách:</strong> ${this.formatCurrency(budgetAmount)}</p>
                        <p><strong>Đã chi:</strong> ${this.formatCurrency(spentAmount)}</p>
                        <p><strong>Vượt:</strong> ${this.formatCurrency(spentAmount - budgetAmount)}</p>
                        <p><strong>Tỷ lệ:</strong> ${percentage.toFixed(1)}%</p>
                    </div>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <h4 style="color: #856404; margin-top: 0;">💡 Gợi ý:</h4>
                        <ul style="color: #856404;">
                            <li>Xem lại các khoản chi tiêu không cần thiết</li>
                            <li>Điều chỉnh ngân sách cho phù hợp</li>
                            <li>Tìm cách tăng thu nhập</li>
                        </ul>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL}/budget" 
                           style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Xem chi tiết ngân sách
                        </a>
                    </div>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
                    <p style="font-size: 12px; color: #6c757d; text-align: center;">
                        Email này được gửi tự động từ Ứng dụng Quản lý Tài chính Cá nhân.<br>
                        Nếu bạn không muốn nhận email này, vui lòng cập nhật cài đặt thông báo.
                    </p>
                </div>
            </div>
        `;

        return this.sendEmail(userEmail, subject, html);
    }

    async sendWeeklyReport(userEmail, reportData) {
        const { totalIncome, totalExpense, netSavings, topCategories } = reportData;
        
        const subject = `📊 Báo cáo tài chính tuần này`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">📊 Báo cáo tài chính tuần</h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9;">Tổng quan tình hình tài chính của bạn</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #27ae60;">
                            <h3 style="margin: 0; color: #27ae60;">Thu nhập</h3>
                            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${this.formatCurrency(totalIncome)}</p>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid #e74c3c;">
                            <h3 style="margin: 0; color: #e74c3c;">Chi tiêu</h3>
                            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${this.formatCurrency(totalExpense)}</p>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-left: 4px solid ${netSavings >= 0 ? '#3498db' : '#e74c3c'};">
                            <h3 style="margin: 0; color: ${netSavings >= 0 ? '#3498db' : '#e74c3c'};">Tiết kiệm</h3>
                            <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold;">${this.formatCurrency(netSavings)}</p>
                        </div>
                    </div>
                    
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="margin-top: 0; color: #2c3e50;">Top danh mục chi tiêu:</h3>
                        ${topCategories.map(cat => `
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                                <span>${cat.name}</span>
                                <strong style="color: #e74c3c;">${this.formatCurrency(cat.amount)}</strong>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL}/statistics" 
                           style="background: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Xem báo cáo chi tiết
                        </a>
                    </div>
                </div>
            </div>
        `;

        return this.sendEmail(userEmail, subject, html);
    }

    async sendEmail(to, subject, html) {
        try {
            const mailOptions = {
                from: `"Quản lý Tài chính" <${process.env.SMTP_USER}>`,
                to,
                subject,
                html
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Email sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('❌ Failed to send email:', error);
            return { success: false, error: error.message };
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    }
}

module.exports = new EmailService();
