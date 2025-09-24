# Personal Finance Backend API

## Overview
Backend API server for Personal Finance Manager built with Express.js and SQL Server.

## Features
- ✅ User authentication (register, login, JWT tokens)
- ✅ Category management (CRUD operations)
- ✅ SQL Server integration with existing schema
- ✅ Input validation and error handling
- ✅ Security middleware (helmet, CORS, rate limiting)
- ✅ Comprehensive logging and monitoring

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

### 3. Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 4. Test API
```bash
node test-api.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - Logout user

### Categories
- `GET /api/categories` - Get all user categories
- `GET /api/categories/type/:type` - Get categories by type (Income/Expense)
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Health Check
- `GET /health` - Server health status

## Database Schema Mapping

The API works with existing SQL Server schema using UNIQUEIDENTIFIER for IDs:

### Users Table
- `UserID` (UNIQUEIDENTIFIER) - Primary key
- `Email` (NVARCHAR) - User email
- `PasswordHash` (NVARCHAR) - Hashed password
- `FirstName`, `LastName` (NVARCHAR) - User names
- `PhoneNumber` (NVARCHAR) - Optional phone
- `Currency`, `Language`, `TimeZone` - User preferences
- `IsActive` (BIT) - Account status

### Categories Table
- `CategoryID` (UNIQUEIDENTIFIER) - Primary key
- `UserID` (UNIQUEIDENTIFIER) - Foreign key to Users
- `Name` (NVARCHAR) - Category name
- `Type` (NVARCHAR) - 'Income' or 'Expense'
- `Icon` (NVARCHAR) - Icon identifier
- `Color` (NVARCHAR) - Hex color code
- `IsActive` (BIT) - Category status

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Nguyễn",
  "lastName": "Văn A",
  "phoneNumber": "0123456789"
}
```

Response:
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "firstName": "Nguyễn",
      "lastName": "Văn A"
    },
    "accessToken": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  }
}
```

### Create Category
```bash
POST /api/categories
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "name": "Cà phê",
  "type": "Expense",
  "icon": "coffee",
  "color": "#8B4513"
}
```

Response:
```json
{
  "success": true,
  "message": "Danh mục đã được tạo thành công",
  "data": {
    "id": "uuid-here",
    "name": "Cà phê",
    "type": "Expense",
    "icon": "coffee",
    "color": "#8B4513",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description in Vietnamese",
  "errors": [
    {
      "field": "email",
      "message": "Email không hợp lệ"
    }
  ]
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds 12
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Joi schema validation
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Configured for frontend origin
- **Security Headers**: Helmet.js middleware

## Development

### Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database configuration
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication
│   │   ├── validation.js        # Input validation
│   │   └── errorHandler.js      # Error handling
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   └── categories.js        # Category routes
│   └── server.js                # Main server file
├── .env                         # Environment variables
├── package.json                 # Dependencies
└── README.md                    # This file
```

### Adding New Routes

1. Create route file in `src/routes/`
2. Add validation schemas in `src/middleware/validation.js`
3. Import and use in `src/server.js`
4. Add tests in test files

### Database Queries

Use the SCHEMA_INFO object for consistent column mapping:

```javascript
const { getPool, SCHEMA_INFO } = require('../config/database');

const pool = getPool();
const result = await pool.request()
    .input('userId', userId)
    .query(`
        SELECT ${SCHEMA_INFO.COLUMNS.USERS.EMAIL}
        FROM ${SCHEMA_INFO.TABLES.USERS}
        WHERE ${SCHEMA_INFO.COLUMNS.USERS.ID} = @userId
    `);
```

## Testing

Run the test script to verify all endpoints:

```bash
node test-api.js
```

This will test:
- Health check
- User registration
- User login
- Get user profile
- Get categories
- Create category

## Deployment

1. Set `NODE_ENV=production` in environment
2. Configure production database credentials
3. Set secure JWT secret
4. Configure CORS for production frontend URL
5. Use process manager like PM2

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check SQL Server is running
   - Verify connection credentials in `.env`
   - Ensure SQL Server Authentication is enabled

2. **JWT Token Errors**
   - Check JWT_SECRET is set in `.env`
   - Verify token format in Authorization header

3. **CORS Errors**
   - Update CORS_ORIGIN in `.env` to match frontend URL

4. **Validation Errors**
   - Check request body matches validation schema
   - Ensure required fields are provided

## Next Steps

After backend is running:
1. Setup React frontend (Task 1.2)
2. Add transaction management routes (Task 5.1)
3. Add budget management routes (Task 7.1)
4. Add statistics and reporting routes (Task 6.1)