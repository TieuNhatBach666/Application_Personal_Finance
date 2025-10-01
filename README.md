# 💰 Personal Finance Manager

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0.0-3178C6.svg)

**Ứng dụng Quản Lý Tài Chính Cá Nhân Thông Minh**

[Tính Năng](#-tính-năng-nổi-bật) • [Cài Đặt](#-cài-đặt) • [Sử Dụng](#-sử-dụng) • [API](#-api-documentation) • [Database](#-database-schema)

</div>

---

## 📖 Giới Thiệu

Personal Finance Manager là ứng dụng web hiện đại giúp người dùng quản lý tài chính cá nhân một cách hiệu quả. Ứng dụng cung cấp giao diện trực quan, dễ sử dụng với các tính năng quản lý thu chi, ngân sách, thống kê và cảnh báo thông minh.

### 🎯 Mục Đích Dự Án

- Giúp người dùng theo dõi thu chi hàng ngày
- Quản lý ngân sách theo danh mục
- Phân tích và thống kê chi tiêu
- Cảnh báo khi vượt ngân sách
- Sao lưu và khôi phục dữ liệu

---

## ✨ Tính Năng Nổi Bật

### 🏠 Dashboard
- Tổng quan tài chính realtime
- Biểu đồ trực quan (Pie Chart, Bar Chart)
- Thống kê thu/chi tháng này
- Top danh mục chi tiêu

### 💸 Quản Lý Giao Dịch
- Thêm/sửa/xóa giao dịch
- Phân loại thu nhập và chi tiêu
- Tìm kiếm và lọc giao dịch
- Gắn thẻ (tags) cho giao dịch

### 📊 Quản Lý Ngân Sách
- Tạo ngân sách theo danh mục
- Theo dõi phần trăm sử dụng
- Cảnh báo vượt ngân sách (80%, 100%, 150%)
- Hiển thị trực quan với progress bar

### 📈 Thống Kê & Báo Cáo
- Biểu đồ theo thời gian
- Phân tích xu hướng chi tiêu
- So sánh các khoản thu/chi
- Export dữ liệu

### 🔔 Thông Báo
- Cảnh báo ngân sách
- Gợi ý tiết kiệm
- Báo cáo hàng tuần
- Thông báo thành tựu

### 🎨 Cài Đặt
- Chế độ sáng/tối
- Ngôn ngữ (Tiếng Việt/English)
- Sao lưu/khôi phục tự động
- Cài đặt thông báo
- Tùy chỉnh giao diện

### 👤 Quản Lý Tài Khoản
- Đăng ký/đăng nhập
- Quản lý thông tin cá nhân
- Chọn avatar (emoji hoặc upload ảnh)
- Bảo mật JWT

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React 18** - UI Library
- **TypeScript** - Type Safety
- **Material-UI (MUI)** - Component Library
- **Redux Toolkit** - State Management
- **React Router** - Routing
- **Chart.js** - Data Visualization
- **Axios** - HTTP Client

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **SQL Server** - Database
- **JWT** - Authentication
- **bcrypt** - Password Hashing
- **mssql** - SQL Server Driver

### DevOps & Tools
- **Vite** - Build Tool
- **Git** - Version Control
- **Postman** - API Testing

---

## 📦 Cài Đặt

### Yêu Cầu Hệ Thống

- Node.js >= 16.0.0
- npm >= 8.0.0
- SQL Server 2019 trở lên
- Git

### 1. Clone Repository

```bash
git clone https://github.com/TieuNhatBach666/personal-finance-manager.git
cd personal-finance-manager
```

### 2. Cài Đặt Backend

```bash
cd backend
npm install
```

**Cấu hình Database:**

1. Mở SQL Server Management Studio
2. Kết nối với server
3. Chạy script tạo database:
   ```bash
   cd ../database
   # Chạy file: khoi-phuc-database-day-du.sql
   ```

**Cấu hình Environment:**

Tạo file `.env` trong thư mục `backend`:

```env
PORT=5000
NODE_ENV=development

# SQL Server Configuration
DB_SERVER=localhost\\SQLEXPRESS
DB_DATABASE=PersonalFinanceDB
DB_USER=sa
DB_PASSWORD=your_password
DB_PORT=1433

# JWT Configuration
JWT_SECRET=your_super_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Cài Đặt Frontend

```bash
cd ../frontend
npm install
```

**Cấu hình Environment:**

Tạo file `.env` trong thư mục `frontend`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Sử Dụng

### Chạy Development

**Backend:**
```bash
cd backend
npm start
# Server chạy tại: http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm run dev
# App chạy tại: http://localhost:5173
```

### Build Production

**Backend:**
```bash
cd backend
npm run build
```

**Frontend:**
```bash
cd frontend
npm run build
# Output: dist/
```

---

## 📁 Cấu Trúc Dự Án

```
personal-finance-manager/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Cấu hình
│   │   │   └── database.js    # Kết nối SQL Server
│   │   ├── middleware/        # Middleware
│   │   │   └── auth.js        # Authentication JWT
│   │   ├── routes/            # API Routes
│   │   │   ├── auth.js        # Auth endpoints
│   │   │   ├── transactions.js # Giao dịch
│   │   │   ├── budgets.js     # Ngân sách
│   │   │   ├── categories.js  # Danh mục
│   │   │   ├── statistics.js  # Thống kê
│   │   │   ├── notifications.js # Thông báo
│   │   │   └── settings.js    # Cài đặt
│   │   └── server.js          # Entry point
│   ├── package.json
│   └── .env
│
├── frontend/                   # Frontend React
│   ├── src/
│   │   ├── components/        # Reusable components
│   │   │   ├── Charts/        # Chart components
│   │   │   └── Layout/        # Layout components
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard/
│   │   │   ├── Transactions/
│   │   │   ├── Budget/
│   │   │   ├── Statistics/
│   │   │   ├── Notifications/
│   │   │   ├── Settings/
│   │   │   └── About/
│   │   ├── store/             # Redux store
│   │   │   └── slices/        # Redux slices
│   │   ├── utils/             # Utilities
│   │   ├── hooks/             # Custom hooks
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── .env
│
├── database/                   # Database scripts
│   ├── khoi-phuc-database-day-du.sql
│   ├── fix-avatar-column-size.sql
│   └── create-budget-notification.sql
│
├── TieuNhatBach/              # Bộ nhớ tạm dự án
│   ├── ke-hoach-chuc-nang.md
│   ├── ke-hoach-giao-dien.md
│   └── cong-nghe-trien-khai.md
│
└── README.md
```

---

## 🔌 API Documentation

### Authentication

#### Đăng Ký
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Nguyen",
  "lastName": "Van A"
}
```

#### Đăng Nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Transactions

#### Lấy danh sách giao dịch
```http
GET /api/transactions?page=1&limit=10&type=Expense
Authorization: Bearer {token}
```

#### Tạo giao dịch mới
```http
POST /api/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "categoryId": "uuid",
  "amount": 50000,
  "type": "Expense",
  "description": "Ăn sáng",
  "transactionDate": "2025-10-01"
}
```

### Budgets

#### Lấy danh sách ngân sách
```http
GET /api/budgets
Authorization: Bearer {token}
```

#### Tạo ngân sách mới
```http
POST /api/budgets
Authorization: Bearer {token}
Content-Type: application/json

{
  "budgetName": "Ngân sách tháng 10",
  "categoryId": "uuid",
  "budgetAmount": 5000000,
  "period": "monthly",
  "startDate": "2025-10-01"
}
```

### Notifications

#### Lấy thông báo
```http
GET /api/notifications?type=warning
Authorization: Bearer {token}
```

#### Đánh dấu đã đọc
```http
PUT /api/notifications/{id}/read
Authorization: Bearer {token}
```

**[Xem đầy đủ API Documentation](./docs/API.md)**

---

## 🗄️ Database Schema

### Bảng Chính

#### Users
```sql
- UserID (PK, uniqueidentifier)
- Email (unique, nvarchar)
- PasswordHash (nvarchar)
- FirstName (nvarchar)
- LastName (nvarchar)
- AvatarURL (nvarchar(max))
- CreatedAt (datetime)
```

#### Categories
```sql
- CategoryID (PK, uniqueidentifier)
- CategoryName (nvarchar)
- Type (Income/Expense)
- Icon (nvarchar)
- Color (nvarchar)
```

#### Transactions
```sql
- TransactionID (PK, uniqueidentifier)
- UserID (FK)
- CategoryID (FK)
- Amount (decimal)
- Type (Income/Expense)
- Description (nvarchar)
- TransactionDate (datetime)
- Tags (nvarchar)
```

#### Budgets
```sql
- BudgetID (PK, uniqueidentifier)
- UserID (FK)
- CategoryID (FK)
- BudgetName (nvarchar)
- BudgetAmount (decimal)
- SpentAmount (decimal)
- Period (monthly/yearly)
- StartDate (datetime)
- EndDate (datetime)
- WarningThreshold (int)
```

#### Notifications
```sql
- NotificationID (PK, uniqueidentifier)
- UserID (FK)
- Title (nvarchar)
- Message (nvarchar)
- Type (info/warning/error)
- IsRead (bit)
- CreatedAt (datetime)
```

### Stored Procedures

- `sp_UpdateBudgetSpentAmount` - Cập nhật số tiền đã chi
- `sp_GetMonthlyStatistics` - Thống kê theo tháng
- `sp_GetCategoryBreakdown` - Phân tích theo danh mục

**[Xem đầy đủ Database Schema](./database/SCHEMA.md)**

---

## 🧪 Testing

### Backend API Testing

```bash
cd backend
npm test
```

### Frontend Testing

```bash
cd frontend
npm run test
```

### Manual Testing

Sử dụng file test tự động:
```bash
node test_budget_functionality.js
```

---

## 🎓 Quy Trình Phát Triển

### Giai Đoạn 1: Phân Tích & Thiết Kế (Tuần 1-2)
- Phân tích yêu cầu
- Thiết kế database
- Thiết kế UI/UX mockups
- Lập kế hoạch dự án

### Giai Đoạn 2: Database & Backend API (Tuần 3-4)
- Tạo database schema
- Viết stored procedures
- Xây dựng RESTful API
- Implement authentication

### Giai Đoạn 3: Frontend UI/UX (Tuần 5-6)
- Setup React + TypeScript
- Xây dựng components
- Implement Redux store
- Tích hợp Material-UI

### Giai Đoạn 4: Tích Hợp & Testing (Tuần 7-8)
- Kết nối Frontend - Backend
- Testing tính năng
- Fix bugs
- Tối ưu performance

### Giai Đoạn 5: Hoàn Thiện & Deploy (Tuần 9-10)
- Hoàn thiện tính năng
- Viết documentation
- Chuẩn bị demo
- Deploy production

---

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Để đóng góp:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📝 License

Dự án này được cấp phép theo giấy phép MIT. Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 👨‍💻 Tác Giả

**Tiểu Nhất Bạch**

- GitHub: [@TieuNhatBach666](https://github.com/TieuNhatBach666)
- Email: tieunhatbach@dev.com
- Project Link: [Personal Finance Manager](https://github.com/TieuNhatBach666/personal-finance-manager)

### Vai Trò Trong Dự Án

- 🎯 Project Lead
- 💾 Database Design & Development
- 🔧 Backend API Development
- ⚛️ Frontend Development
- 🎨 UI/UX Design
- 📝 Documentation

---

## 🙏 Lời Cảm Ơn

- [Material-UI](https://mui.com/) - Component library tuyệt vời
- [React](https://reactjs.org/) - UI framework mạnh mẽ
- [Node.js](https://nodejs.org/) - Runtime environment
- [SQL Server](https://www.microsoft.com/sql-server) - Database system

---

## 📞 Liên Hệ & Hỗ Trợ

Nếu bạn gặp vấn đề hoặc có câu hỏi, vui lòng:

- Mở [Issue](https://github.com/TieuNhatBach666/personal-finance-manager/issues)
- Email: tieunhatbach@dev.com
- [Discussion](https://github.com/TieuNhatBach666/personal-finance-manager/discussions)

---

<div align="center">

**⭐ Nếu dự án hữu ích, hãy cho một Star! ⭐**

Made with ❤️ by **Tiểu Nhất Bạch**

© 2025 Personal Finance Manager. All Rights Reserved.

</div>
