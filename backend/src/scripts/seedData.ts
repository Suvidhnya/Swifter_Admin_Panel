import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User, { UserRole } from '../models/User.js';
import Product from '../models/Product.js';
import Setting from '../models/Setting.js';

dotenv.config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/swifter-admin');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Setting.deleteMany({});

    // Create Super Admin
    const superAdmin = new User({
      email: 'admin@swifter.io',
      password: 'AdminPassword123!',
      firstName: 'Super',
      lastName: 'Admin',
      role: UserRole.SUPER_ADMIN,
      isActive: true
    });
    await superAdmin.save();
    console.log('✅ Super Admin created: admin@swifter.io');

    // Create Admin
    const admin = new User({
      email: 'manager@swifter.io',
      password: 'ManagerPassword123!',
      firstName: 'John',
      lastName: 'Manager',
      role: UserRole.ADMIN,
      isActive: true
    });
    await admin.save();
    console.log('✅ Admin created: manager@swifter.io');

    // Create Product Manager
    const pm = new User({
      email: 'pm@swifter.io',
      password: 'PMPassword123!',
      firstName: 'Sarah',
      lastName: 'ProductMgr',
      role: UserRole.PRODUCT_MANAGER,
      isActive: true
    });
    await pm.save();
    console.log('✅ Product Manager created: pm@swifter.io');

    // Create Support User
    const supportUser = new User({
      email: 'support@swifter.io',
      password: 'SupportPass123!',
      firstName: 'Alex',
      lastName: 'Support',
      role: UserRole.SUPPORT_USER,
      isActive: true
    });
    await supportUser.save();
    console.log('✅ Support User created: support@swifter.io');

    // Create sample products
    const products = [
      {
        name: 'Swift Dashboard',
        description: 'Real-time analytics and reporting dashboard',
        version: '2.0.1',
        status: 'active',
        category: 'Analytics',
        owner: 'manager@swifter.io',
        features: ['Real-time data', 'Custom reports', 'Export to PDF'],
        documentation: 'https://docs.swifter.io/dashboard',
        launchDate: new Date('2024-01-15')
      },
      {
        name: 'Swift API',
        description: 'RESTful API for integrations',
        version: '3.1.0',
        status: 'active',
        category: 'Integration',
        owner: 'pm@swifter.io',
        features: ['WebHooks', 'Rate limiting', 'API versioning'],
        documentation: 'https://docs.swifter.io/api',
        launchDate: new Date('2023-06-20')
      },
      {
        name: 'Swift Mobile App',
        description: 'Mobile application for iOS and Android',
        version: '1.5.2',
        status: 'active',
        category: 'Mobile',
        owner: 'manager@swifter.io',
        features: ['Offline mode', 'Push notifications', 'Sync'],
        documentation: 'https://docs.swifter.io/mobile',
        launchDate: new Date('2024-02-10')
      },
      {
        name: 'Swift Enterprise',
        description: 'Enterprise solution for large organizations',
        version: '1.0.0',
        status: 'inactive',
        category: 'Enterprise',
        owner: 'pm@swifter.io',
        features: ['Custom branding', 'Advanced security', 'Support'],
        documentation: 'https://docs.swifter.io/enterprise',
        launchDate: new Date('2024-03-01')
      }
    ];

    await Product.insertMany(products);
    console.log('✅ Sample products created');

    // Create settings
    const settings = [
      {
        key: 'app_name',
        value: 'Swifter Admin',
        description: 'Application name',
        updatedBy: 'admin@swifter.io'
      },
      {
        key: 'app_version',
        value: '1.0.0',
        description: 'Current application version',
        updatedBy: 'admin@swifter.io'
      },
      {
        key: 'maintenance_mode',
        value: false,
        description: 'Enable maintenance mode',
        updatedBy: 'admin@swifter.io'
      },
      {
        key: 'max_users',
        value: 1000,
        description: 'Maximum number of users',
        updatedBy: 'admin@swifter.io'
      }
    ];

    await Setting.insertMany(settings);
    console.log('✅ Settings created');

    console.log('\n✨ Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedData();
