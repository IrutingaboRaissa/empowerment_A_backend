import { Request, Response, NextFunction } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

// Define a structured error response interface
interface ErrorResponse {
  message: string;
  errors: Record<string, string | string[]>;
}

// Custom error type for more specific error handling
interface CustomError extends Error {
  status?: number;
  errors?: Record<string, string>;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error for internal tracking
  console.error('Error details:', {
    message: err.message,
    name: err.name,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Prisma-specific error handling
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(400).json({
          message: 'Unique Constraint Violation',
          errors: {
            field: 'A unique constraint would be violated on one or more fields'
          }
        });
      
      case 'P2025':
        return res.status(404).json({
          message: 'Not Found',
          errors: {
            general: 'The requested record could not be found'
          }
        });
      
      default:
        // Handle other Prisma-specific errors
        return res.status(500).json({
          message: 'Database Error',
          errors: {
            database: 'An unexpected database error occurred'
          }
        });
    }
  }

  // Authentication and Authorization Errors
  const authErrorMap: Record<string, { status: number; message: string }> = {
    'UnauthorizedError': { 
      status: 401, 
      message: 'Unauthorized' 
    },
    'JsonWebTokenError': { 
      status: 401, 
      message: 'Invalid Token' 
    },
    'TokenExpiredError': { 
      status: 401, 
      message: 'Token Expired' 
    }
  };

  const authErrorHandler = authErrorMap[err.name];
  if (authErrorHandler) {
    return res.status(authErrorHandler.status).json({
      message: authErrorHandler.message,
      errors: {
        auth: err.message || 'Authentication failed'
      }
    });
  }

  // Validation Error Handling
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation Error',
      errors: typeof err.errors === 'object' 
        ? err.errors 
        : { general: err.message || 'Invalid input' }
    });
  }

  // Default Error Response
  const statusCode = err.status || 500;
  const responseBody: ErrorResponse = {
    message: 'Internal Server Error',
    errors: {
      general: process.env.NODE_ENV === 'development' 
        ? err.message || 'Unexpected error occurred' 
        : 'Something went wrong'
    }
  };

  res.status(statusCode).json(responseBody);
};