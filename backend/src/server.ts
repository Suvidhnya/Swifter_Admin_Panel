import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PORT, MONGODB_URI, CORS_ORIGIN } from './config.js';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import productsRoutes from './routes/products.js';
import settingsRoutes from './routes/settings.js';
import User, { UserRole } from './models/User.js';

const app = express();

// Security middleware
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'http://127.0.0.1:3000',
  'https://127.0.0.1:3000'
];

const configuredOrigin = process.env.CORS_ORIGIN || '';
if (configuredOrigin) {
  allowedOrigins.push(configuredOrigin);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  },
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Database connection
let mongoConnected = false;

const ensureDefaultUsers = async () => {
  try {
    const existingUserCount = await User.countDocuments({});
    if (existingUserCount > 0) {
      console.log(`📦 Found ${existingUserCount} existing users in MongoDB`);
      return;
    }

    const defaultUsers = [
      {
        email: 'admin@swifter.io',
        password: 'AdminPassword123!',
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.SUPER_ADMIN,
        isActive: true
      },
      {
        email: 'manager@swifter.io',
        password: 'ManagerPassword123!',
        firstName: 'John',
        lastName: 'Manager',
        role: UserRole.ADMIN,
        isActive: true
      },
      {
        email: 'pm@swifter.io',
        password: 'PMPassword123!',
        firstName: 'Sarah',
        lastName: 'ProductMgr',
        role: UserRole.PRODUCT_MANAGER,
        isActive: true
      },
      {
        email: 'support@swifter.io',
        password: 'SupportPass123!',
        firstName: 'Alex',
        lastName: 'Support',
        role: UserRole.SUPPORT_USER,
        isActive: true
      }
    ];

    await User.insertMany(defaultUsers);
    console.log('✅ Seeded default demo users for production login');
  } catch (error) {
    console.warn('⚠️ Failed to ensure default users:', (error as Error).message);
  }
};

const connectDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    mongoConnected = true;
    console.log('✅ Connected to MongoDB');
    await ensureDefaultUsers();
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed:', (err as Error).message);
    console.warn('⚠️ Server will run in limited mode without database');
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const startServer = async () => {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Swifter Admin Backend running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    if (!mongoConnected) {
      console.warn('⚠️ Backend started without MongoDB connection. Some endpoints will not work.');
    }
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
