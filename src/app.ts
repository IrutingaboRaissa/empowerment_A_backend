import express from 'express';
import cors from 'cors';
import { config } from './config';
import { authRouter } from './routes/auth'; // Ensure this file exists
import { postRouter } from './routes/post.routes'; // Use named import
import { commentRouter } from './routes/comment.routes';
import { likeRouter } from './routes/like.routes';
import { userRouter } from './routes/user.routes';

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: config.upload.maxFileSize }));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/likes', likeRouter);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export { app };