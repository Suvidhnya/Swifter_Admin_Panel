# Swifter Admin Panel - Frontend

A modern, responsive Next.js frontend for the Swifter internal admin panel. Features a clean UI built with Tailwind CSS and real-time state management with Zustand.

## Features

✅ **User Interface**
- Modern, professional design with Tailwind CSS
- Fully responsive (mobile, tablet, desktop)
- Dark-aware color scheme
- Smooth transitions and animations

✅ **Authentication**
- Secure JWT-based login
- Protected routes with role-based access
- Persistent token storage
- Automatic session management

✅ **Dashboard**
- Real-time statistics and analytics
- Recent activity overview
- Quick access to main features
- User role display

✅ **User Management**
- List, search, and filter users
- Create and edit users
- Assign roles and permissions
- Deactivate/activate users
- Pagination support

✅ **Product Management**
- Full product CRUD operations
- Search, filter, and sort products
- Product status tracking
- Category management
- Pagination support

✅ **Settings Management**
- System-wide configuration
- Setting key-value pairs
- Audit trail with update tracking
- Super Admin-only access

✅ **Navigation & Sidebar**
- Responsive sidebar navigation
- Mobile-friendly menu toggle
- Role-based menu visibility
- Active page highlighting

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Date Formatting:** date-fns

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure API URL (optional):**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

## Running the Frontend

**Development mode:**
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

**Production build:**
```bash
npm run build
npm start
```

**Linting:**
```bash
npm run lint
```

## Demo Credentials

Use these credentials to test different roles:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@swifter.io | AdminPassword123! |
| Admin | manager@swifter.io | ManagerPassword123! |
| Product Manager | pm@swifter.io | PMPassword123! |
| Support User | support@swifter.io | SupportPass123! |

## Page Structure

```
/
├── /login               # Login page
├── /dashboard           # Main dashboard
├── /products            # Product management
├── /users               # User management (Admin+)
└── /settings            # System settings (Super Admin only)
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout with provider
│   │   ├── page.tsx             # Home redirect
│   │   ├── globals.css          # Global styles
│   │   ├── login/
│   │   │   └── page.tsx         # Login page
│   │   ├── dashboard/
│   │   │   └── page.tsx         # Dashboard page
│   │   ├── products/
│   │   │   └── page.tsx         # Products page
│   │   ├── users/
│   │   │   └── page.tsx         # Users management page
│   │   └── settings/
│   │       └── page.tsx         # Settings page
│   ├── components/
│   │   ├── AuthProvider.tsx     # Auth context provider
│   │   ├── DashboardLayout.tsx  # Dashboard layout wrapper
│   │   └── Sidebar.tsx          # Navigation sidebar
│   ├── hooks/
│   │   └── useAuth.ts           # Auth and route protection hooks
│   ├── lib/
│   │   └── api.ts               # Axios API client
│   ├── store/
│   │   └── authStore.ts         # Zustand auth store
│   └── types/
│       └── index.ts             # TypeScript types
├── public/                      # Static files
├── .env.example                 # Example environment variables
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── tailwind.config.ts           # Tailwind CSS config
└── postcss.config.js            # PostCSS config
```

## Key Components

### AuthProvider
Initializes authentication on app load and verifies stored tokens.

```tsx
<AuthProvider>
  <YourApp />
</AuthProvider>
```

### useAuth Hook
Access authentication state and methods:

```tsx
const { user, token, login, logout, isAuthenticated, hasRole } = useAuth();
```

### useProtectedRoute Hook
Automatically redirect unauthenticated users to login:

```tsx
const isProtected = useProtectedRoute();
```

### useRequireRole Hook
Enforce role-based access with automatic redirects:

```tsx
useRequireRole(['super_admin', 'admin']);
```

### DashboardLayout
Wrapper providing sidebar and layout structure:

```tsx
<DashboardLayout>
  <YourContent />
</DashboardLayout>
```

## API Integration

All API calls use a centralized Axios instance with:
- Automatic Bearer token injection
- 401 error handling with auto-redirect to login
- Configurable base URL via environment variable

```tsx
import api from '@/lib/api';

const response = await api.get('/products');
const created = await api.post('/products', data);
```

## State Management (Zustand)

Authentication state is managed with Zustand and persisted to localStorage:

```tsx
import { useAuthStore } from '@/store/authStore';

const { user, token, login, logout } = useAuthStore();
```

## Styling

Built entirely with Tailwind CSS:
- Utility-first CSS framework
- Custom color scheme (primary blue)
- Responsive design patterns
- Dark mode ready

## Features by Role

### Super Admin
- ✅ Dashboard access
- ✅ User management (create, edit, delete, deactivate)
- ✅ Product management (all operations)
- ✅ System settings management

### Admin
- ✅ Dashboard access
- ✅ User management (view, edit)
- ✅ Product management (all operations)
- ❌ Settings access

### Product Manager
- ✅ Dashboard access
- ✅ Product management (all operations)
- ❌ User management
- ❌ Settings access

### Support User
- ✅ Dashboard access (read-only stats)
- ❌ User management
- ❌ Product management
- ❌ Settings access

## Common Tasks

### Add a New Page

1. Create `src/app/newpage/page.tsx`
2. Wrap with `DashboardLayout`
3. Use `useProtectedRoute()` or `useRequireRole()`
4. Import and use hooks as needed

### Add API Call

```tsx
import api from '@/lib/api';

const response = await api.get('/products', {
  params: { page: 1, limit: 10 }
});
```

### Update User State

```tsx
import { useAuthStore } from '@/store/authStore';

const { user, setError } = useAuthStore();
setError('Custom error message');
```

### Check User Role

```tsx
const { hasRole } = useAuth();

if (hasRole(['admin', 'super_admin'])) {
  // Show admin-only content
}
```

## Troubleshooting

**API Connection Error:**
```
Check NEXT_PUBLIC_API_URL in .env.local
Ensure backend is running on port 5000
```

**Token Expired:**
```
User is automatically redirected to login
Previous token is cleared from localStorage
```

**Login Fails:**
```
Verify credentials match backend database
Check backend is running and accessible
Look for CORS errors in browser console
```

**Protected Route Redirect:**
```
Make sure useProtectedRoute() is called
Check token is stored in localStorage
```

## Performance Optimizations

✅ Implemented:
- Server-side rendering with Next.js
- Client-side caching with Zustand
- Lazy loading of components
- Optimized images
- CSS-in-JS with Tailwind

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Tips

- Use React DevTools for debugging component state
- Check Network tab for API requests
- Use Zustand DevTools browser extension
- Check console for TypeScript type errors

## Building for Production

```bash
npm run build
npm start
```

The `next build` command:
- Compiles TypeScript
- Optimizes for production
- Creates static exports where possible
- Bundles and minifies assets

## License

MIT

## Support

For issues or questions, contact the development team at dev@swifter.io
