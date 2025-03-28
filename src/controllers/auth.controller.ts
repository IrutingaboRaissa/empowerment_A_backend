import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Password validation regex
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const authController = {
  // Register a new user
  async register(req: Request, res: Response) {
    try {
      const { email, password, displayName, avatar, age, category, parent_consent } = req.body;

      // Validate required fields
      if (!email || !password || !displayName) {
        return res.status(400).json({ error: 'Email, password, and display name are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      // Validate password strength
      if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({
          error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }

      // Validate age
      if (age && (age < 12 || age > 25)) {
        return res.status(400).json({ error: 'Age must be between 12 and 25' });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12); // Increased from 10 to 12 rounds

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          displayName,
          avatar: avatar || '', // Provide default empty string if no avatar
          age,
          category,
          parentConsent: age < 18 ? parent_consent : true // Require parent consent only for minors
        }
      });

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          displayName: user.displayName
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          age: user.age,
          category: user.category
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  },

  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Verify password with timing-safe comparison
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if user's age is still valid
      if (user.age && (user.age < 12 || user.age > 25)) {
        return res.status(403).json({ error: 'Account age restriction: must be between 12 and 25 years old' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          displayName: user.displayName
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Update last login timestamp
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() }
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          avatar: user.avatar,
          age: user.age,
          category: user.category
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  },

  // Get user profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
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
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  },

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { displayName, avatar, age, category, parent_consent } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          displayName,
          avatar,
          age,
          category,
          parentConsent: age && age < 18 ? parent_consent : true
        },
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

      res.json(user);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
}; 