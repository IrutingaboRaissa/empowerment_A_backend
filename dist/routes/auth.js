"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const prisma_1 = __importDefault(require("../lib/prisma"));
const router = (0, express_1.Router)();
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
router.post('/register', async (req, res) => {
    try {
        const { email, password, displayName, avatar, age, category, parentConsent } = req.body;
        console.log("Request body:", req.body);
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const hashedPassword = password;
        const token = jsonwebtoken_1.default.sign({ id: (0, uuid_1.v4)(), email }, SECRET_KEY, {
            expiresIn: '1h',
        });
        const newUser = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                displayName,
                avatar,
                age,
                category,
                parentConsent: age > 18 ? parentConsent : true,
                tokens: { set: [token] }
            }
        });
        res.status(201).json({
            user: {
                id: newUser.id,
                email: newUser.email,
                displayName: newUser.displayName,
                avatar: newUser.avatar
            },
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.default.user.findUnique({
            where: { email }
        });
        if (!user || user.password !== password) { // Note: Use proper password comparison in production
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email }, SECRET_KEY, {
            expiresIn: '1h',
        });
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { tokens: { push: token } } // Use `push` to add token to the array
        });
        res.status(200).json({
            user: { id: user.id, email: user.email },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Malformed token' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        const user = await prisma_1.default.user.findFirst({
            where: {
                id: decoded.id,
                tokens: { has: token } // Ensure token exists in the user's tokens array
            }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        return res.status(200).json({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            avatar: user.avatar,
        });
    }
    catch (error) {
        console.error('Auth verification error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
});
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            return res.status(401).json({ error: 'Malformed token' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        await prisma_1.default.user.update({
            where: { id: decoded.id },
            data: { tokens: { set: [] } }
        });
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.authRouter = router;
