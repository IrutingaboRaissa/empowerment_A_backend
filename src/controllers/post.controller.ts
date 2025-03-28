import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

export const postController = {
  // Create a new post
  async createPost(req: Request, res: Response) {
    try {
      const { title, content, category } = req.body;
      const userId = req.user?.id;
  
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
  
      if (!title || !content || !category) {
        return res.status(400).json({ error: 'Title, content, and category are required' });
      }
  
      const post = await prisma.post.create({
        data: {
          title,
          content,
          category,
          authorId: userId
        },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              avatar: true
            }
          }
        }
      });
  
      res.status(201).json(post);
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  },
  
  // Get all posts with pagination
  async getPosts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
  
      const [posts, total] = await Promise.all([
        prisma.post.findMany({
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            author: {
              select: {
                id: true,
                displayName: true,
                avatar: true
              }
            },
            _count: {
              select: {
                comments: true
              }
            }
          }
        }),
        prisma.post.count()
      ]);
  
      // Fetch likes count separately for each post
      const postsWithLikes = await Promise.all(posts.map(async (post) => {
        const likeCount = await prisma.like.count({
          where: { postId: post.id }
        });
        return { ...post, likeCount }; // Add like count to post
      }));
  
      res.json({
        posts: postsWithLikes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({ error: 'Failed to get posts' });
    }
  },

  // Get a single post by ID
  async getPost(req: Request, res: Response) {
    try {
      const { id } = req.params;
  
      // Fetch the post and its comments
      const post = await prisma.post.findUnique({
        where: { id },
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
            }
          }
        }
      });
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Fetch the like count for the post
      const likeCount = await prisma.like.count({
        where: { postId: id }
      });
  
      // Prepare the response with comments and like count
      const responsePost = {
        ...post,
        likeCount
      };
  
      res.json(responsePost);
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({ error: 'Failed to get post' });
    }
  },

  // Update a post
  async updatePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const post = await prisma.post.findUnique({
        where: { id }
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (post.authorId !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this post' });
      }

      const updatedPost = await prisma.post.update({
        where: { id },
        data: { content },
        include: {
          author: {
            select: {
              id: true,
              displayName: true,
              avatar: true
            }
          }
        }
      });

      res.json(updatedPost);
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  },

  // Delete a post
  async deletePost(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const post = await prisma.post.findUnique({
        where: { id }
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      if (post.authorId !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this post' });
      }

      await prisma.post.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  },

  // Like a post
  async like(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if already liked
      const existingLike = await prisma.like.findFirst({
        where: {
          postId: id,
          userId,
        },
      });

      if (existingLike) {
        return res.status(400).json({ error: 'Post already liked' });
      }

      const like = await prisma.like.create({
        data: {
          post: {
            connect: { id },
          },
          user: {
            connect: { id: userId },
          },
        },
      });

      return res.status(201).json(like);
    } catch (error) {
      console.error('Like post error:', error);
      return res.status(500).json({ error: 'Failed to like post' });
    }
  },

  // Unlike a post
  async unlike(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find and delete the like
      const like = await prisma.like.findFirst({
        where: {
          postId: id,
          userId,
        },
      });

      if (!like) {
        return res.status(404).json({ error: 'Like not found' });
      }

      await prisma.like.delete({
        where: { id: like.id },
      });

      return res.status(204).send();
    } catch (error) {
      console.error('Unlike post error:', error);
      return res.status(500).json({ error: 'Failed to unlike post' });
    }
  },
}; 