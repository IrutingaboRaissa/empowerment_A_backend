"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Database operation failed'
        });
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'fail',
            message: 'Invalid token'
        });
    }
    // Handle other errors
    console.error('Error:', err);
    return res.status(500).json({
        status: 'error',
        message: 'Internal server error'
    });
};
exports.errorHandler = errorHandler;
