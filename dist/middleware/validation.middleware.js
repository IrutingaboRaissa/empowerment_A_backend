"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegistration = void 0;
const validateRegistration = (req, res, next) => {
    const { email, password, displayName, age } = req.body;
    // Check for missing required fields
    const errors = {};
    if (!email)
        errors.email = 'Email is required';
    if (!password)
        errors.password = 'Password is required';
    if (!displayName)
        errors.displayName = 'Display name is required';
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: 'Missing required fields',
            errors
        });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: 'Invalid email format',
            errors: {
                email: 'Please enter a valid email address'
            }
        });
    }
    // Validate password strength
    if (password.length < 6) {
        return res.status(400).json({
            message: 'Password does not meet requirements',
            errors: {
                password: 'Password must be at least 6 characters long'
            }
        });
    }
    // Validate age if provided
    if (age !== undefined) {
        const ageNum = parseInt(age.toString());
        if (isNaN(ageNum)) {
            return res.status(400).json({
                message: 'Invalid age format',
                errors: {
                    age: 'Age must be a number'
                }
            });
        }
        if (ageNum < 12) {
            return res.status(400).json({
                message: 'Age requirement not met',
                errors: {
                    age: 'You must be at least 12 years old to register'
                }
            });
        }
        if (ageNum > 100) {
            return res.status(400).json({
                message: 'Invalid age',
                errors: {
                    age: 'Please enter a valid age'
                }
            });
        }
    }
    next();
};
exports.validateRegistration = validateRegistration;
const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    // Check for missing fields
    const errors = {};
    if (!email)
        errors.email = 'Email is required';
    if (!password)
        errors.password = 'Password is required';
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({
            message: 'Missing required fields',
            errors
        });
    }
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            message: 'Invalid email format',
            errors: {
                email: 'Please enter a valid email address'
            }
        });
    }
    next();
};
exports.validateLogin = validateLogin;
