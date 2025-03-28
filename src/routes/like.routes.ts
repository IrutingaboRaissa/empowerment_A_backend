import { Router } from 'express';
import { likeController } from '../controllers/like.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes are protected
router.post('/post/:postId', authenticateToken, likeController.likePost);
router.delete('/post/:postId', authenticateToken, likeController.unlikePost);
router.post('/comment/:commentId', authenticateToken, likeController.likeComment);
router.delete('/comment/:commentId', authenticateToken, likeController.unlikeComment);

export const likeRouter = router; 