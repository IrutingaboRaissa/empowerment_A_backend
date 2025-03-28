"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const auth_1 = require("./routes/auth"); // Ensure this file exists
const post_routes_1 = require("./routes/post.routes"); // Use named import
const comment_routes_1 = require("./routes/comment.routes");
const like_routes_1 = require("./routes/like.routes");
const user_routes_1 = require("./routes/user.routes");
const app = (0, express_1.default)();
exports.app = app;
// Middleware
app.use((0, cors_1.default)({
    origin: config_1.config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json({ limit: config_1.config.upload.maxFileSize }));
// Routes
app.use('/api/auth', auth_1.authRouter);
app.use('/api/users', user_routes_1.userRouter);
app.use('/api/posts', post_routes_1.postRouter);
app.use('/api/comments', comment_routes_1.commentRouter);
app.use('/api/likes', like_routes_1.likeRouter);
// Health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
