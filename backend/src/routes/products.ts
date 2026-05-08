import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Product from '../models/Product.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { canManageProducts } from '../middleware/roleCheck.js';

const router = Router();

// Get all products with pagination, filtering, and sorting
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;

    let filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(filter)
      .limit(limit)
      .skip((page - 1) * limit)
      .sort({ [sortBy]: sortOrder });

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get product by ID
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create product
router.post(
  '/',
  authenticate,
  canManageProducts,
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('version').trim().notEmpty(),
  body('category').trim().notEmpty(),
  body('launchDate').isISO8601(),
  async (req: AuthRequest, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, version, category, owner, features, documentation, launchDate } = req.body;

      const product = new Product({
        name,
        description,
        version,
        category,
        owner: owner || req.user?.email,
        features: features || [],
        documentation: documentation || '',
        launchDate
      });

      await product.save();
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }
);

// Update product
router.put('/:id', authenticate, canManageProducts, async (req: AuthRequest, res) => {
  try {
    const { name, description, version, status, category, owner, features, documentation, launchDate } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(description && { description }),
        ...(version && { version }),
        ...(status && { status }),
        ...(category && { category }),
        ...(owner && { owner }),
        ...(features && { features }),
        ...(documentation && { documentation }),
        ...(launchDate && { launchDate })
      },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete product
router.delete('/:id', authenticate, canManageProducts, async (req: AuthRequest, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
