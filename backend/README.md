# Swifter Admin Panel - Backend

A secure, role-based admin panel backend for managing Swifter products and internal operations.

## Features

✅ **Authentication & Security**
- JWT-based token authentication
- Password hashing with bcryptjs
- Secure CORS configuration
- Helmet security headers

✅ **Role-Based Access Control (RBAC)**
- Super Admin: Full system access
- Admin: User and product management
- Product Manager: Product management
- Support User: Read-only access

✅ **User Management**
- Create, update, deactivate users
- Role assignment and management
- Last login tracking
- User search and filtering

✅ **Product Management**
- Full CRUD operations
- Status tracking (active, inactive, archived)
- Product categories and versioning
- Search, filter, and sort capabilities

✅ **Settings Management**
- System-wide configuration
- Settings versioning and audit trails
- Super Admin-only access

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Language:** TypeScript
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** bcryptjs, Helmet, CORS

## Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/swifter-admin
   JWT_SECRET=your-secret-key-change-this
   JWT_EXPIRATION=7d
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Ensure MongoDB is running:**
   ```bash
   # MongoDB should be accessible at mongodb://localhost:27017
   ```

## Running the Server

**Development mode (with hot reload):**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

**Seed sample data:**
```bash
npm run seed
```

This creates:
- 4 demo users with different roles
- 4 sample products
- 4 system settings

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/verify` - Verify JWT token and get user info

### Users (Admin/Super Admin)
- `GET /api/users` - List all users (with pagination, search, role filter)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user (Super Admin only)
- `PUT /api/users/:id` - Update user (Admin or higher)
- `POST /api/users/:id/deactivate` - Deactivate user (Super Admin only)
- `DELETE /api/users/:id` - Delete user (Super Admin only)

### Products
- `GET /api/products` - List products (with pagination, search, filter, sort)
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Product Manager or Admin)
- `PUT /api/products/:id` - Update product (Product Manager or Admin)
- `DELETE /api/products/:id` - Delete product (Product Manager or Admin)

### Settings (Super Admin)
- `GET /api/settings` - Get all settings
- `GET /api/settings/:key` - Get specific setting
- `POST /api/settings` - Create setting (Super Admin only)
- `PUT /api/settings/:key` - Update setting (Super Admin only)
- `DELETE /api/settings/:key` - Delete setting (Super Admin only)

## Demo Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@swifter.io | AdminPassword123! |
| Admin | manager@swifter.io | ManagerPassword123! |
| Product Manager | pm@swifter.io | PMPassword123! |
| Support User | support@swifter.io | SupportPass123! |

## Request Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@swifter.io",
    "password": "AdminPassword123!"
  }'
```

Response:
```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "admin@swifter.io",
    "firstName": "Super",
    "lastName": "Admin",
    "role": "super_admin"
  }
}
```

### Create Product (with token)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "New Product",
    "description": "Product description",
    "version": "1.0.0",
    "category": "Analytics",
    "status": "active",
    "launchDate": "2024-01-15"
  }'
```

## Project Structure

```
backend/
├── src/
│   ├── models/
│   │   ├── User.ts          # User model and schema
│   │   ├── Product.ts       # Product model and schema
│   │   └── Setting.ts       # Settings model and schema
│   ├── routes/
│   │   ├── auth.ts          # Authentication routes
│   │   ├── users.ts         # User management routes
│   │   ├── products.ts      # Product management routes
│   │   └── settings.ts      # Settings routes
│   ├── middleware/
│   │   ├── auth.ts          # JWT authentication middleware
│   │   └── roleCheck.ts     # Role-based access control
│   ├── scripts/
│   │   └── seedData.ts      # Database seeding script
│   └── server.ts            # Main server entry point
├── .env.example             # Example environment variables
├── package.json             # Project dependencies
└── tsconfig.json            # TypeScript configuration
```

## Security Best Practices

✅ **Implemented:**
- JWT token-based authentication
- Password hashing with bcryptjs (salt rounds: 10)
- CORS protection with configurable origins
- Helmet security headers
- Request validation with express-validator
- Role-based access control on all protected endpoints
- Error messages that don't reveal sensitive info
- MongoDB injection protection via Mongoose

⚠️ **For Production:**
- Change JWT_SECRET to a strong, random value
- Use HTTPS only
- Configure proper CORS origins
- Enable MongoDB authentication
- Set NODE_ENV=production
- Use environment-specific databases
- Implement rate limiting
- Add comprehensive logging
- Set up error monitoring (Sentry, etc.)

## Troubleshooting

**MongoDB Connection Error:**
```
Make sure MongoDB is running locally or update MONGODB_URI in .env
```

**JWT Token Expired:**
```
Tokens expire based on JWT_EXPIRATION (default: 7d)
User needs to login again to get a new token
```

**CORS Error:**
```
Update CORS_ORIGIN in .env to match your frontend URL
```

## Development Notes

- TypeScript strict mode is enabled
- All routes require authentication except login
- Password minimum length: 8 characters
- Email validation using express-validator
- Timestamps (createdAt, updatedAt) are automatically managed by MongoDB

## License

MIT

## Support

For issues or questions, contact the development team at dev@swifter.io
