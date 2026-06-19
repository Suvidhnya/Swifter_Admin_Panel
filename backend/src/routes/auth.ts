import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { JWT_SECRET, JWT_EXPIRATION } from '../config.js';

const router = Router();

// Login
router.post(
  '/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email, isActive: true });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        JWT_SECRET as jwt.Secret,
        { expiresIn: JWT_EXPIRATION } as jwt.SignOptions
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Verify token
router.get('/verify', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
