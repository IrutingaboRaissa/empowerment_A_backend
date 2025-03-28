import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { postRouter } from './routes/post.routes';
import { commentRouter } from './routes/comment.routes';
import { likeRouter } from './routes/like.routes';
import { errorHandler } from './middleware/error.middleware';
import rateLimit from 'express-rate-limit';
import { config } from './config';

// Load environment variables
console.log('Loading environment variables...');
dotenv.config();
console.log('Environment variables loaded');

// Initialize Express app
const app = express();

// Initialize Prisma client
const prisma = new PrismaClient();

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests
});

// Middleware
app.use(express.json({ limit: config.upload.maxFileSize }));
app.use(limiter);

// Routes
console.log('Setting up routes...');
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/likes', likeRouter);
console.log('Routes setup complete');

// Error handling
app.use(errorHandler);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'Not Found' });
});

// Start server
const start = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Connected to database');

    // Start server
    const port = config.server.port;
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
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
console.log("just checking")

export { app }; 