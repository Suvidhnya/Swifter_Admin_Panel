# 🔐 Swifter Admin Panel - Security & Architecture Guide

## Security Overview

This document outlines the security features, best practices, and architecture decisions in the Swifter Admin Panel.

## 🔒 Security Features Implemented

### 1. Authentication & Authorization

#### JWT Token-Based Authentication
- Tokens expire after configurable period (default: 7 days)
- Tokens contain: user ID, email, role
- No session state on server (stateless)
- Token stored securely in browser localStorage
- Automatic redirect on 401 errors

```typescript
// Token structure
{
  id: string,
  email: string,
  role: UserRole,
  iat: number,
  exp: number
}
```

#### Role-Based Access Control (RBAC)
Four distinct roles with hierarchical permissions:

```
┌─────────────────────────────────────────────────────────┐
│ Super Admin (Highest)                                   │
│ - User management (create, edit, delete)               │
│ - Product management (all)                             │
│ - Settings management                                  │
│ - Full system access                                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ Admin                                                   │
│ - User management (view, edit, deactivate)            │
│ - Product management (all)                             │
│ - NO settings access                                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ Product Manager                                         │
│ - Product management (CRUD)                            │
│ - NO user management                                   │
│ - NO settings access                                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│ Support User (Lowest)                                   │
│ - Dashboard (read-only)                                │
│ - NO management access                                 │
└─────────────────────────────────────────────────────────┘
```

### 2. Password Security

#### Bcryptjs Hashing
- Algorithm: bcrypt
- Salt rounds: 10
- Never stored in plain text
- Automatic hashing on user creation/update

```typescript
const salt = await bcryptjs.genSalt(10);
const hashed = await bcryptjs.hash(plainPassword, salt);
```

#### Password Requirements
- Minimum 8 characters
- Enforced in backend validation
- Server-side only validation (not frontend)

### 3. HTTP Security

#### Helmet.js Middleware
```
- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- HSTS headers
- Referrer Policy
```

#### CORS Protection
- Configurable allowed origins
- Credentials support
- Method restrictions
- Header validation

```typescript
cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
})
```

### 4. Input Validation & Sanitization

#### Express-Validator
- Email format validation
- Password length validation
- Required field checks
- Regex pattern matching

Example:
```typescript
body('email').isEmail().normalizeEmail()
body('password').isLength({ min: 8 })
```

#### MongoDB Injection Protection
- Mongoose automatic sanitization
- No string concatenation in queries
- Parameterized queries only

### 5. Error Handling

#### Information Disclosure Prevention
- Generic error messages to clients
- Detailed logging on server only
- No stack traces in responses
- No database errors exposed

```typescript
// ✅ Good
res.status(401).json({ error: 'Invalid credentials' });

// ❌ Bad - Never do this
res.status(500).json({ error: err.message });
```

## 🏗️ Architecture Design

### Frontend Architecture

#### Component Structure
```
App
├── AuthProvider
│   ├── Layout
│   │   ├── Sidebar (protected)
│   │   └── Main Content
│   │       ├── Dashboard (protected)
│   │       ├── Products (protected)
│   │       ├── Users (admin+ required)
│   │       └── Settings (super_admin required)
│   └── Login (public)
```

#### State Management (Zustand)
- Minimal, focused store
- Persistent localStorage backup
- Single source of truth
- Async middleware for API calls

```typescript
const useAuthStore = create<AuthStore>()(
  persist((set, get) => ({
    // state
    user: null,
    token: null,
    isAuthenticated: false,
    
    // actions
    login: async (email, password) => { ... },
    logout: () => { ... },
    verifyToken: async () => { ... }
  }), {
    name: 'auth-store'
  })
);
```

#### Protected Route Pattern
```typescript
export const useProtectedRoute = () => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return isAuthenticated && !isLoading;
};
```

### Backend Architecture

#### Middleware Stack
```
Request
  ├── Morgan (logging)
  ├── Helmet (security headers)
  ├── CORS (cross-origin)
  ├── Body Parser (JSON)
  ├── Route Handler
  │   ├── authenticate (JWT validation)
  │   ├── requireRole (permission check)
  │   └── Route Logic
  │       └── Database Operation
  └── Error Handler
Response
```

#### Request-Response Flow
```
┌─────────────────────────────────┐
│  Client Request                 │
│  (with Authorization header)    │
└───────────┬─────────────────────┘
            │
┌───────────▼─────────────────────┐
│  Extract Bearer Token           │
└───────────┬─────────────────────┘
            │
┌───────────▼─────────────────────┐
│  Verify JWT Signature           │
└───────────┬─────────────────────┘
            │
┌───────────▼─────────────────────┐
│  Check Token Expiration         │
└───────────┬─────────────────────┘
            │
┌───────────▼─────────────────────┐
│  Extract User Data from Token   │
└───────────┬─────────────────────┘
            │
┌───────────▼─────────────────────┐
│  Check User Role/Permissions    │
└───────────┬─────────────────────┘
            │
┌───────────▼─────────────────────┐
│  Execute Route Handler          │
└───────────┬─────────────────────┘
            │
┌───────────▼─────────────────────┐
│  Database Operation             │
└───────────┬─────────────────────┘
            │
┌───────────▼─────────────────────┐
│  Respond to Client              │
└─────────────────────────────────┘
```

### Database Schema Design

#### Users Collection
```
{
  _id: ObjectId,
  email: string (unique, indexed),
  password: string (hashed),
  firstName: string,
  lastName: string,
  role: enum,
  isActive: boolean,
  lastLogin: date,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

Indexes:
- `email` - for login queries
- `role` - for role-based filtering
- `isActive` - for active users queries

#### Products Collection
```
{
  _id: ObjectId,
  name: string,
  description: string,
  version: string,
  status: enum,
  category: string (indexed),
  owner: string,
  features: [string],
  documentation: string,
  launchDate: date,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

Indexes:
- `category` - for category filtering
- `status` - for status filtering
- `createdAt` - for sorting

## 🛡️ Security Best Practices

### ✅ Implemented

1. **Never log sensitive data**
   - Passwords, tokens, API keys
   - Use appropriate log levels

2. **Validate all inputs**
   - Server-side validation (always)
   - Frontend validation (UX only)
   - Type checking with TypeScript

3. **Use environment variables**
   - Secrets never in source code
   - Different values per environment
   - .env files in .gitignore

4. **Implement rate limiting** (recommended for production)
   - Prevent brute force attacks
   - Use express-rate-limit

5. **Keep dependencies updated**
   - Regular npm audit
   - Security patches
   - Vulnerability scanning

6. **Use HTTPS in production**
   - SSL/TLS encryption
   - Secure cookie flags
   - HSTS headers

### ⚠️ Production Checklist

- [ ] Change JWT_SECRET to strong random string (40+ characters)
- [ ] Set NODE_ENV=production
- [ ] Use MongoDB authentication (username/password)
- [ ] Enable MongoDB SSL/TLS
- [ ] Configure CORS to specific domains only
- [ ] Enable HTTPS on frontend and backend
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add request logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Enable HSTS headers
- [ ] Configure security headers in Helmet
- [ ] Use Content Security Policy (CSP)
- [ ] Regular security audits
- [ ] Implement 2FA for admin accounts
- [ ] Add IP whitelisting for admin access (optional)

## 🔑 Environment Variables

### Backend (.env)
```
# Application
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/swifter-admin

# Security
JWT_SECRET=change-this-to-something-strong
JWT_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=debug
```

### Frontend (.env.local)
```
# API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🔍 Security Testing

### Manual Testing
1. Try accessing protected routes without token
2. Test with expired tokens
3. Try role-based access with lower role
4. Test input validation (SQL injection, XSS)
5. Verify CORS restrictions

### Automated Testing
```bash
# Backend
npm run lint
npm test

# Frontend
npm run lint
npm run build
```

## 📊 Audit Trail

All settings changes are tracked:
```typescript
{
  key: string,
  value: any,
  updatedBy: string,  // User email
  updatedAt: timestamp
}
```

## 🚨 Incident Response

### Compromised JWT Token
1. Implement token blacklist
2. Force re-authentication
3. Invalidate all active sessions
4. Audit affected users

### Database Breach
1. Force password reset for all users
2. Review access logs
3. Update security policies
4. Notify affected users

### Unauthorized Access Attempts
1. Lock account after 5 failed attempts
2. Log suspicious activities
3. Alert administrators
4. Review and update CORS/CSRF tokens

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Next.js Security](https://nextjs.org/docs/basic-features/environment-variables)

## 🔗 Related Documentation

- See [SETUP.md](./SETUP.md) for installation
- See [backend/README.md](./backend/README.md) for API docs
- See [frontend/README.md](./frontend/README.md) for UI docs
