import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: req.params.postId },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      message: 'Comments retrieved successfully',
      data: { comments }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      message: 'Failed to fetch comments',
      errors: {
        general: 'An unexpected error occurred while fetching comments. Please try again later.'
      }
    });
  }
});

// Create comment
router.post('/post/:postId', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.postId;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
        errors: {
          post: 'The post you are trying to comment on does not exist'
        }
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user!.id,
        postId,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            category: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Comment created successfully',
      data: { comment }
    });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      message: 'Failed to create comment',
      errors: {
        general: 'An unexpected error occurred while creating the comment. Please try again later.'
      }
    });
  }
});

// Update comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    // Check if comment exists and is owned by the authenticated user
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id }
    });

    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found',
        errors: {
          comment: 'The requested comment could not be found'
        }
      });
    }

    if (comment.authorId !== req.user?.id) {
      return res.status(403).json({
        message: 'Access denied',
        errors: {
          auth: 'You can only update your own comments'
        }
      });
    }

    const updatedComment = await prisma.comment.update({
      where: { id: req.params.id },
      data: {
        content,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            category: true
          }
        }
      }
    });

    res.json({
      message: 'Comment updated successfully',
      data: { comment: updatedComment }
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      message: 'Failed to update comment',
      errors: {
        general: 'An unexpected error occurred while updating the comment. Please try again later.'
      }
    });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if comment exists and is owned by the authenticated user
    const comment = await prisma.comment.findUnique({
      where: { id: req.params.id }
    });

    if (!comment) {
      return res.status(404).json({
        message: 'Comment not found',
        errors: {
          comment: 'The requested comment could not be found'
        }
      });
    }

    if (comment.authorId !== req.user?.id) {
      return res.status(403).json({
        message: 'Access denied',
        errors: {
          auth: 'You can only delete your own comments'
        }
      });
    }

    await prisma.comment.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'Comment deleted successfully',
      data: {
        message: 'The comment has been permanently deleted'
      }
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      message: 'Failed to delete comment',
      errors: {
        general: 'An unexpected error occurred while deleting the comment. Please try again later.'
      }
    });
  }
});

export const commentRouter = router;