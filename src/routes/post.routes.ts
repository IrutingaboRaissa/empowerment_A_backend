import { Router } from 'express';
import prisma from '../lib/prisma';
import {authenticateToken} from '../middleware/auth.middleware';

const router = Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true
          }
        },
        comments: true
      }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            avatar: true
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        message: 'Post not found',
        errors: {
          post: 'The requested post could not be found'
        }
      });
    }

    res.json({
      message: 'Post retrieved successfully',
      data: { post }
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      message: 'Failed to fetch post',
      errors: {
        general: 'An unexpected error occurred while fetching the post. Please try again later.'
      }
    });
  }
});

// Create post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, category = 'GENERAL' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        category,
        authorId: req.user!.id,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Error creating post' });
  }
});

// Update post
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, content, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const post = await prisma.post.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        category,
        updatedAt: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            displayName: true,
            avatar: true
          }
        }
      }
    });
    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Error updating post' });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.post.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Error deleting post' });
  }
});

export const postRouter = router;