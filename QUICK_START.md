# 📖 Quick Reference Guide

## 🚀 Start Here (5-10 minutes)

### 1. Clone & Install
```bash
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

### 2. Start MongoDB
```bash
# Docker (easiest)
docker run -d -p 27017:27017 mongo

# Or local MongoDB
mongod
```

### 3. Seed Demo Data
```bash
cd backend
npm run seed
```

### 4. Start Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 5. Open Browser
```
http://localhost:3000
```

### 6. Login
```
Email: admin@swifter.io
Password: AdminPassword123!
```

## 🎯 Common Tasks

### Create New User
1. Go to Users page (requires Admin role)
2. Click "New User"
3. Fill form with:
   - Email (must be unique)
   - First Name
   - Last Name
   - Role (Super Admin, Admin, Product Manager, Support User)
   - Password (min 8 characters)
4. Click "Create User"

### Create New Product
1. Go to Products page
2. Click "New Product"
3. Fill form with:
   - Product Name
   - Description
   - Version (e.g., 1.0.0)
   - Category
   - Status
   - Launch Date
4. Click "Create Product"

### Search & Filter
- **Products:** Search by name/description, filter by status or category
- **Users:** Search by email/name, filter by role
- Use pagination for large datasets

### Change User Role
1. Go to Users page
2. Click Edit icon on user row
3. Select new role from dropdown (Super Admin only)
4. Click "Update User"

### Manage Settings (Super Admin Only)
1. Go to Settings page
2. Click "New Setting"
3. Enter:
   - Setting Key (e.g., app_name)
   - Value (can be text, number, or JSON)
   - Description (optional)
4. Click "Create Setting"

## 🔐 Default Demo Accounts

```
Super Admin:     admin@swifter.io / AdminPassword123!
Admin:           manager@swifter.io / ManagerPassword123!
Product Manager: pm@swifter.io / PMPassword123!
Support User:    support@swifter.io / SupportPass123!
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/src/server.ts` | Backend entry point |
| `frontend/src/app/layout.tsx` | Frontend root layout |
| `backend/src/routes/auth.ts` | Login endpoints |
| `backend/src/models/User.ts` | User database schema |
| `frontend/src/store/authStore.ts` | Auth state management |
| `frontend/src/app/dashboard/page.tsx` | Dashboard page |

## 🛠️ Development Commands

### Backend
```bash
npm run dev      # Start dev server with hot reload
npm run build    # Build TypeScript to JavaScript
npm run start    # Run production build
npm run seed     # Populate database with demo data
npm run lint     # Run ESLint
```

### Frontend
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm start        # Run production server
npm run lint     # Run ESLint
```

## 🔌 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/swifter-admin
JWT_SECRET=change-this-to-something-strong
JWT_EXPIRATION=7d
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📡 Example API Requests

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@swifter.io",
    "password": "AdminPassword123!"
  }'
```

### List Products
```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "New App",
    "description": "Description here",
    "version": "1.0.0",
    "category": "Analytics",
    "launchDate": "2024-01-15",
    "features": [],
    "documentation": ""
  }'
```

## 📊 Role Permissions Quick Reference

| Action | Super Admin | Admin | PM | Support |
|--------|:----------:|:-----:|:---:|:------:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ✅ | ❌ | ❌ |
| Manage Products | ✅ | ✅ | ✅ | ❌ |
| Manage Settings | ✅ | ❌ | ❌ | ❌ |

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Connection refused" | Start MongoDB: `docker run -d -p 27017:27017 mongo` |
| "Port 5000 in use" | `lsof -i :5000 && kill -9 <PID>` |
| "Port 3000 in use" | `lsof -i :3000 && kill -9 <PID>` |
| "CORS error" | Check CORS_ORIGIN in backend .env |
| "Unauthorized error" | Token expired, login again |
| "Cannot find module" | Run `npm install` in appropriate folder |

## 📖 Documentation Map

- **[README.md](./README.md)** - Project overview
- **[SETUP.md](./SETUP.md)** - Complete setup guide
- **[SECURITY.md](./SECURITY.md)** - Security details
- **[FEATURES.md](./FEATURES.md)** - Features & permissions
- **[backend/README.md](./backend/README.md)** - API docs
- **[frontend/README.md](./frontend/README.md)** - UI docs
- **THIS FILE** - Quick reference

## 🔒 Security Reminders

⚠️ **Before Production:**
- Change JWT_SECRET to strong random string
- Set NODE_ENV=production
- Enable HTTPS
- Configure specific CORS origins
- Enable MongoDB authentication
- Update database backups strategy

## 💡 Tips & Tricks

1. **View Database:** Use MongoDB Compass to inspect collections
2. **Debug Frontend:** Use React DevTools browser extension
3. **API Testing:** Use Postman or Insomnia for API testing
4. **Logs:** Check browser console (Ctrl+Shift+K) for frontend logs
5. **Database Seed:** Run `npm run seed` anytime to reset demo data

## 🎯 Next Steps

1. ✅ Start both servers
2. ✅ Login with admin account
3. ✅ Create test product
4. ✅ Create test user (if Admin)
5. ✅ Test role-based access
6. ✅ Explore all pages
7. ✅ Deploy to production (see SETUP.md)

## 📞 Useful Links

- [MongoDB Compass](https://www.mongodb.com/products/compass) - GUI for MongoDB
- [Postman](https://www.postman.com/) - API testing tool
- [VS Code](https://code.visualstudio.com/) - Code editor
- [Git](https://git-scm.com/) - Version control

---

**Ready to get started? Run the Quick Start commands above!** 🚀
