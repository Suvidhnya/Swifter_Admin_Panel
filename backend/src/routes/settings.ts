import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Setting from '../models/Setting.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { isSuperAdmin, isAdminOrHigher } from '../middleware/roleCheck.js';

const router = Router();

// Get all settings
router.get('/', authenticate, isAdminOrHigher, async (req: AuthRequest, res) => {
  try {
    const settings = await Setting.find();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get setting by key
router.get('/:key', authenticate, isAdminOrHigher, async (req: AuthRequest, res) => {
  try {
    const setting = await Setting.findOne({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update setting (Super Admin only)
router.post(
  '/',
  authenticate,
  isSuperAdmin,
  body('key').trim().notEmpty(),
  body('value').notEmpty(),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { key, value, description } = req.body;

      let setting = await Setting.findOne({ key });

      if (setting) {
        setting.value = value;
        setting.description = description || setting.description;
        setting.updatedBy = req.user?.email || 'unknown';
      } else {
        setting = new Setting({
          key,
          value,
          description: description || '',
          updatedBy: req.user?.email || 'unknown'
        });
      }

      await setting.save();
      res.status(201).json(setting);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update setting (Super Admin only)
router.put('/:key', authenticate, isSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const { value, description } = req.body;

    const setting = await Setting.findOneAndUpdate(
      { key: req.params.key },
      {
        ...(value !== undefined && { value }),
        ...(description && { description }),
        updatedBy: req.user?.email || 'unknown'
      },
      { new: true }
    );

    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete setting (Super Admin only)
router.delete('/:key', authenticate, isSuperAdmin, async (req: AuthRequest, res) => {
  try {
    const setting = await Setting.findOneAndDelete({ key: req.params.key });
    if (!setting) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
