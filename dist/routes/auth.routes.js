"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Register
router.post('/register', validation_middleware_1.validateRegistration, async (req, res) => {
    try {
        const { email, password, displayName, age, category = 'student', parentConsent = false } = req.body;
        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                message: 'Registration failed',
                errors: {
                    email: 'This email is already registered. Please use a different email or try logging in.'
                }
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                displayName,
                age: age !== undefined && age !== null
                    ? Number.isNaN(Number(age))
                        ? 0 // Fallback to 0 if invalid            taskkill /PID <PID> /F
                        : typeof age === 'string'
                            ? parseInt(age, 10) // Parse string to integer 
                            : Number(age) // Ensure numeric conversion
                    : 0, // Explicit 0 when no age provided
                category,
                parentConsent,
                avatar: 'default-avatar.png'
            }
        });
        // Generate tokens
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'amasimbi-super-secret-key-2024', { expiresIn: '24h' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET || 'amasimbi-refresh-secret-key-2024', { expiresIn: '7d' });
        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            message: 'Registration successful',
            data: {
                user: userWithoutPassword,
                token,
                refreshToken
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            message: 'Registration failed',
            errors: {
                general: 'An unexpected error occurred during registration. Please try again later.'
            }
        });
    }
});
// Login
router.post('/login', validation_middleware_1.validateLogin, async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({
                message: 'Login failed',
                errors: {
                    credentials: 'Invalid email or password. Please check your credentials and try again.'
                }
            });
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Login failed',
                errors: {
                    credentials: 'Invalid email or password. Please check your credentials and try again.'
                }
            });
        }
        // Generate tokens
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'amasimbi-super-secret-key-2024', { expiresIn: '24h' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET || 'amasimbi-refresh-secret-key-2024', { expiresIn: '7d' });
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token,
                refreshToken
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            message: 'Login failed',
            errors: {
                general: 'An unexpected error occurred during login. Please try again.'
            }
        });
    }
});
// Get current user
router.get('/me', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                displayName: true,
                avatar: true,
                age: true,
                category: true,
                parentConsent: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                errors: {
                    user: 'Could not find user data'
                }
            });
        }
        // Generate new tokens
        const token = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_SECRET || 'amasimbi-super-secret-key-2024', { expiresIn: '24h' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET || 'amasimbi-refresh-secret-key-2024', { expiresIn: '7d' });
        res.json({
            message: 'User data retrieved successfully',
            data: {
                user,
                token,
                refreshToken
            }
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            message: 'Failed to get user data',
            errors: {
                general: 'An unexpected error occurred while fetching user data'
            }
        });
    }
});
// Logout
router.post('/logout', auth_middleware_1.authenticateToken, (_req, res) => {
    res.json({
        message: 'Logout successful',
        data: {
            message: 'You have been successfully logged out'
        }
    });
});
exports.authRouter = router;
