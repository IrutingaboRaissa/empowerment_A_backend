import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';

const router = Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, avatar, age, category, parentConsent } = req.body;

    console.log("Request body:", req.body);
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = password; 
    const token = jwt.sign({ id: uuidv4(), email }, SECRET_KEY, {
      expiresIn: '1h',
    });

    const newUser = await prisma.user.create({
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
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.password !== password) { // Note: Use proper password comparison in production
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email }, SECRET_KEY, {
      expiresIn: '1h',
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { tokens: { push: token } } // Use `push` to add token to the array
    });

    res.status(200).json({
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
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

    const decoded = jwt.verify(token, SECRET_KEY) as { id: string; email: string };
    
    const user = await prisma.user.findFirst({
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
  } catch (error) {
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

    const decoded = jwt.verify(token, SECRET_KEY) as { id: string };

    await prisma.user.update({
      where: { id: decoded.id },
      data: { tokens: { set: [] } } 
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const authRouter = router;
