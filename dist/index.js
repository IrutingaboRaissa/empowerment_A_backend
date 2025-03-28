"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_routes_1 = require("./routes/auth.routes");
const user_routes_1 = require("./routes/user.routes");
const post_routes_1 = require("./routes/post.routes");
const comment_routes_1 = require("./routes/comment.routes");
const like_routes_1 = require("./routes/like.routes");
const error_middleware_1 = require("./middleware/error.middleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
// Load environment variables
console.log('Loading environment variables...');
dotenv_1.default.config();
console.log('Environment variables loaded');
// Initialize Express app
const app = (0, express_1.default)();
exports.app = app;
// Initialize Prisma client
const prisma = new client_1.PrismaClient();
// CORS configuration
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.maxRequests
});
// Middleware
app.use(express_1.default.json({ limit: config_1.config.upload.maxFileSize }));
app.use(limiter);
// Routes
console.log('Setting up routes...');
app.use('/api/auth', auth_routes_1.authRouter);
app.use('/api/users', user_routes_1.userRouter);
app.use('/api/posts', post_routes_1.postRouter);
app.use('/api/comments', comment_routes_1.commentRouter);
app.use('/api/likes', like_routes_1.likeRouter);
console.log('Routes setup complete');
// Error handling
app.use(error_middleware_1.errorHandler);
// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ message: 'Not Found' });
});
// Start server
const start = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('Connected to database');
        // Start server
        const port = config_1.config.server.port;
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
        // Handle shutdown gracefully
        process.on('SIGTERM', async () => {
            console.log('SIGTERM received. Closing HTTP server...');
            await prisma.$disconnect();
            process.exit(0);
        });
        // Handle errors
        process.on('uncaughtException', (error) => {
            console.error('Uncaught Exception:', error);
            process.exit(1);
        });
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            console.error('Unhandled Rejection at:', promise, 'reason:', reason);
            process.exit(1);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
start();
