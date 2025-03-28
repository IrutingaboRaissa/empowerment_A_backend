"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                message: 'Authentication required',
                errors: {
                    auth: 'No authentication token provided'
                }
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'amasimbi-super-secret-key-2024');
        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true }
        });
        if (!user) {
            return res.status(401).json({
                message: 'Authentication failed',
                errors: {
                    auth: 'User not found'
                }
            });
        }
        // Set user in request
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            message: 'Authentication failed',
            errors: {
                auth: 'Invalid or expired token'
            }
        });
    }
};
exports.authenticateToken = authenticateToken;
