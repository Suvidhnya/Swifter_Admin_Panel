import path from 'path';
import multer from 'multer';
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import User from '../models/User.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { isSuperAdmin, isAdminOrHigher } from '../middleware/roleCheck.js';
import { AWS_ACCESS_KEY_ID, AWS_REGION, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET } from '../config.js';

interface MulterAuthRequest extends AuthRequest {
  file?: Express.Multer.File;
}

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

let s3Client: S3Client | null = null;

const getS3Client = () => {
  if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS S3 configuration is incomplete');
  }
  if (!s3Client) {
    s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });
  }
  return s3Client;
};

const buildS3Url = (key: string) => `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`;

// Get all users with pagination and filtering
router.get('/', authenticate, isAdminOrHigher, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string;
    const search = req.query.search as string;

    let filter: any = { isActive: true };

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const usersData = users.map((user) => ({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      profileImageUrl: user.profileImageUrl || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    const total = await User.countDocuments(filter);

    res.json({
      users: usersData,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create user (Admin or higher)
router.post(
  '/',
  authenticate,
  isAdminOrHigher,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('role').isIn(['super_admin', 'admin', 'product_manager', 'support_user']),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Only Super Admin can create super_admin users
      if (role === 'super_admin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({ error: 'Only Super Admin can create super_admin users' });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      const newUser = new User({
        email,
        password,
        firstName,
        lastName,
        role
      });

      await newUser.save();

      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Get user by ID
router.get('/:id', authenticate, isAdminOrHigher, async (req: AuthRequest, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upload or update user avatar
router.post('/:id/avatar', authenticate, upload.single('avatar'), async (req: MulterAuthRequest, res) => {
  try {
    const userId = req.params.id;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (requesterId !== userId && !['super_admin', 'admin'].includes(requesterRole || '')) {
      return res.status(403).json({ error: 'Forbidden: cannot update this user avatar' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Avatar image file is required' });
    }

    if (!AWS_S3_BUCKET || !AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      return res.status(500).json({ error: 'AWS S3 configuration is missing' });
    }

    const extension = path.extname(req.file.originalname).toLowerCase() || '.jpg';
    const key = `avatars/${userId}-${Date.now()}${extension}`;

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: AWS_S3_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
      })
    );

    const profileImageUrl = buildS3Url(key);
    const user = await User.findByIdAndUpdate(
      userId,
      { profileImageUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Avatar uploaded successfully',
      profileImageUrl: user.profileImageUrl
    });
  } catch (error: any) {
    console.error('Avatar upload error:', error);
    const message = error?.message || 'Server error';
    res.status(500).json({ error: `Avatar upload failed: ${message}` });
  }
});

// Update user (Admin or higher)
router.put('/:id', authenticate, isAdminOrHigher, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, role, isActive, email, password } = req.body;

    // Fetch the target user to enforce immutable credentials for super_admin accounts
    const targetUser = await User.findById(req.params.id).select('-password');
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent changing email or password for super_admin accounts
    if (targetUser.role === 'super_admin' && (email || password)) {
      return res.status(403).json({ error: 'Cannot change email or password for super_admin accounts' });
    }

    // Only Super Admin can change roles. Allow unchanged role values from admins.
    if (role && role !== targetUser.role && req.user?.role !== 'super_admin') {
      return res.status(403).json({ error: 'Only Super Admin can change user roles' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(role && role !== targetUser.role ? { role } : {}),
        ...(typeof isActive === 'boolean' && { isActive })
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Deactivate user (Super Admin only)
router.post('/:id/deactivate', authenticate, isSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deactivated', user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (Super Admin only)
router.delete('/:id', authenticate, isSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
