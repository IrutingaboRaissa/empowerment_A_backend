import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const commentController = {
  // Create a new comment
  async createComment(req: Request, res: Response) {
    try {
      const { content } = req.body;
      const { postId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: postId }
      });

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          authorId: userId,
          postId
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

      res.status(201).json(comment);
    } catch (error) {
      console.error('Create comment error:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  },

  // Get comments for a post
  async getComments(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where: { postId },
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
            }
          }
        }),
        prisma.comment.count({
          where: { postId }
        })
      ]);

      // Fetch likes count separately
      const commentsWithLikes = await Promise.all(comments.map(async comment => {
        const likeCount = await prisma.like.count({
          where: { commentId: comment.id }
        });
        return { ...comment, likeCount };
      }));

      res.json({
        comments: commentsWithLikes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get comments error:', error);
      res.status(500).json({ error: 'Failed to get comments' });
    }
  },


  // Update a comment
  async updateComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const comment = await prisma.comment.findUnique({
        where: { id }
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.authorId !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this comment' });
      }

      const updatedComment = await prisma.comment.update({
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

      res.json(updatedComment);
    } catch (error) {
      console.error('Update comment error:', error);
      res.status(500).json({ error: 'Failed to update comment' });
    }
  },

  // Delete a comment
  async deleteComment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const comment = await prisma.comment.findUnique({
        where: { id }
      });

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      if (comment.authorId !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
      }

      await prisma.comment.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error) {
      console.error('Delete comment error:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }
}; 