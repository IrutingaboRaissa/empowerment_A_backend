"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeController = void 0;
const client_1 = require("@prisma/client");
const library_1 = require("@prisma/client/runtime/library");
const prisma = new client_1.PrismaClient();
exports.likeController = {
    // Like a post
    likePost: async (req, res) => {
        try {
            const { postId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    errors: { auth: 'You must be logged in to like a post' }
                });
            }
            // Verify post exists before creating like
            const postExists = await prisma.post.findUnique({
                where: { id: postId },
                select: { id: true }
            });
            if (!postExists) {
                return res.status(404).json({
                    message: 'Not Found',
                    errors: { post: 'The post you are trying to like does not exist' }
                });
            }
            // Check if like already exists using findFirst for type safety
            const existingLike = await prisma.like.findFirst({
                where: {
                    userId,
                    postId
                }
            });
            if (existingLike) {
                return res.status(400).json({
                    message: 'Already liked',
                    errors: { like: 'You have already liked this post' }
                });
            }
            // Create like using Prisma's create method
            const like = await prisma.like.create({
                data: {
                    userId,
                    postId
                },
                // Optionally select specific fields to return
                select: {
                    id: true,
                    userId: true,
                    postId: true,
                    createdAt: true
                }
            });
            res.status(201).json({
                message: 'Post liked successfully',
                data: { like }
            });
        }
        catch (error) {
            console.error('Like post error:', error);
            // Handle unique constraint violation (if applicable)
            if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2002') {
                return res.status(400).json({
                    message: 'Like Failed',
                    errors: { like: 'Unable to create like due to a constraint violation' }
                });
            }
            res.status(500).json({
                message: 'Failed to like post',
                errors: { general: 'An unexpected error occurred while liking the post' }
            });
        }
    },
    // Unlike a post
    unlikePost: async (req, res) => {
        try {
            const { postId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    errors: { auth: 'You must be logged in to unlike a post' }
                });
            }
            // Delete like with type-safe unique identifier
            await prisma.like.deleteMany({
                where: {
                    userId: userId,
                    postId: postId
                }
            });
            res.json({
                message: 'Post unliked successfully'
            });
        }
        catch (error) {
            console.error('Unlike post error:', error);
            res.status(500).json({
                message: 'Failed to unlike post',
                errors: { general: 'An unexpected error occurred while unliking the post' }
            });
        }
    },
    // Like a comment
    likeComment: async (req, res) => {
        try {
            const { commentId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    errors: { auth: 'You must be logged in to like a comment' }
                });
            }
            // Verify comment exists before creating like
            const commentExists = await prisma.comment.findUnique({
                where: { id: commentId },
                select: { id: true }
            });
            if (!commentExists) {
                return res.status(404).json({
                    message: 'Not Found',
                    errors: { comment: 'The comment you are trying to like does not exist' }
                });
            }
            // Check if like already exists using findFirst for type safety
            const existingLike = await prisma.like.findFirst({
                where: {
                    userId,
                    commentId
                }
            });
            if (existingLike) {
                return res.status(400).json({
                    message: 'Already liked',
                    errors: { like: 'You have already liked this comment' }
                });
            }
            // Create like
            const like = await prisma.like.create({
                data: {
                    userId,
                    commentId
                },
                // Optionally select specific fields to return
                select: {
                    id: true,
                    userId: true,
                    commentId: true,
                    createdAt: true
                }
            });
            res.status(201).json({
                message: 'Comment liked successfully',
                data: { like }
            });
        }
        catch (error) {
            console.error('Like comment error:', error);
            // Handle unique constraint violation (if applicable)
            if (error instanceof library_1.PrismaClientKnownRequestError && error.code === 'P2002') {
                return res.status(400).json({
                    message: 'Like Failed',
                    errors: { like: 'Unable to create like due to a constraint violation' }
                });
            }
            res.status(500).json({
                message: 'Failed to like comment',
                errors: { general: 'An unexpected error occurred while liking the comment' }
            });
        }
    },
    // Unlike a comment
    unlikeComment: async (req, res) => {
        try {
            const { commentId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    message: 'Unauthorized',
                    errors: { auth: 'You must be logged in to unlike a comment' }
                });
            }
            // Verify comment exists
            const commentExists = await prisma.comment.findUnique({
                where: { id: commentId },
                select: { id: true }
            });
            if (!commentExists) {
                return res.status(404).json({
                    message: 'Not Found',
                    errors: { comment: 'The comment you are trying to unlike does not exist' }
                });
            }
            // Check if like exists before attempting to delete
            const existingLike = await prisma.like.findFirst({
                where: {
                    userId,
                    commentId
                }
            });
            if (!existingLike) {
                return res.status(400).json({
                    message: 'Like Not Found',
                    errors: { like: 'You have not liked this comment' }
                });
            }
            // Delete like using deleteMany for type safety
            const deletedLike = await prisma.like.deleteMany({
                where: {
                    userId,
                    commentId
                }
            });
            // Confirm deletion
            if (deletedLike.count === 0) {
                return res.status(500).json({
                    message: 'Unlike Failed',
                    errors: { general: 'Unable to remove like' }
                });
            }
            res.json({
                message: 'Comment unliked successfully'
            });
        }
        catch (error) {
            console.error('Unlike comment error:', error);
            // Handle specific Prisma errors if needed
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                return res.status(500).json({
                    message: 'Database Error',
                    errors: { general: 'An error occurred while processing your request' }
                });
            }
            res.status(500).json({
                message: 'Failed to unlike comment',
                errors: { general: 'An unexpected error occurred while unliking the comment' }
            });
        }
    }
};
