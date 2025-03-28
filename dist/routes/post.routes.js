"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRouter = void 0;
const express_1 = require("express");
const prisma_1 = __importDefault(require("../lib/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await prisma_1.default.post.findMany({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Error fetching posts' });
    }
});
// Get single post
router.get('/:id', async (req, res) => {
    try {
        const post = await prisma_1.default.post.findUnique({
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
    }
    catch (error) {
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
router.post('/', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { title, content, category = 'GENERAL' } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        const post = await prisma_1.default.post.create({
            data: {
                title,
                content,
                category,
                authorId: req.user.id,
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
    }
    catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Error creating post' });
    }
});
// Update post
router.put('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { title, content, category } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        const post = await prisma_1.default.post.update({
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
    }
    catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: 'Error updating post' });
    }
});
// Delete post
router.delete('/:id', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        await prisma_1.default.post.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    }
    catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Error deleting post' });
    }
});
exports.postRouter = router;
