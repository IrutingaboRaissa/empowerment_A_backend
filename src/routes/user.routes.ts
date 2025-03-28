import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        displayName: true,
        phoneNumber: true,
        address: true,
        bio: true,
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
          user: 'The requested user account could not be found'
        }
      });
    }

    res.json({
      message: 'User profile retrieved successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      message: 'Failed to fetch user profile',
      errors: {
        general: 'An unexpected error occurred while fetching the user profile. Please try again later.'
      }
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { displayName, email, phoneNumber, address, bio } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: 'Unauthorized',
        errors: {
          auth: 'You must be logged in to update your profile'
        }
      });
    }

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        return res.status(400).json({
          message: 'Email already in use',
          errors: {
            email: 'This email address is already registered'
          }
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        displayName,
        email,
        phoneNumber,
        address,
        bio,
        updatedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        phoneNumber: true,
        address: true,
        bio: true,
        age: true,
        category: true,
        parentConsent: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      errors: {
        general: 'An unexpected error occurred while updating your profile. Please try again later.'
      }
    });
  }
});

// Delete user account
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user exists and is the authenticated user
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
        errors: {
          user: 'The requested user account could not be found'
        }
      });
    }

    if (user.id !== req.user?.id) {
      return res.status(403).json({
        message: 'Access denied',
        errors: {
          auth: 'You can only delete your own account'
        }
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({
      message: 'User account deleted successfully',
      data: {
        message: 'Your account has been permanently deleted'
      }
    });
  } catch (error) {
    console.error('Delete user account error:', error);
    res.status(500).json({
      message: 'Failed to delete user account',
      errors: {
        general: 'An unexpected error occurred while deleting your account. Please try again later.'
      }
    });
  }
});

export const userRouter = router; 