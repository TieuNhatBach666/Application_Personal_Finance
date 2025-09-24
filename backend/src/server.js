const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const transactionRoutes = require('./routes/transactions');
const statisticsRoutes = require('./routes/statistics');
const budgetRoutes = require('./routes/budgets');
const notificationRoutes = require('./routes/notifications');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

// Rate limiting - More lenient for development
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limit each IP to 1000 requests per minute
    message: {
        success: false,
        message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Only apply rate limiting in production
if (process.env.NODE_ENV === 'production') {
    app.use(limiter);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Personal Finance API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
    try {
        // Connect to database
        await connectDB();
        
        // Start HTTP server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
            console.log(`📚 API Base URL: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 SIGTERM received, shutting down gracefully...');
    const { closeDB } = require('./config/database');
    await closeDB();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 SIGINT received, shutting down gracefully...');
    const { closeDB } = require('./config/database');
    await closeDB();
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

// Start the server
if (require.main === module) {
    startServer();
}

module.exports = app;