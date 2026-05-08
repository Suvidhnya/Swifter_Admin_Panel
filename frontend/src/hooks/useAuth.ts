import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  return useAuthStore();
};

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

export const useRequireRole = (allowedRoles: string[]) => {
  const router = useRouter();
  const { user, isLoading, hasRole } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !hasRole(allowedRoles)) {
      router.push('/dashboard');
    }
  }, [user, isLoading, allowedRoles, hasRole, router]);

  return hasRole(allowedRoles) && !isLoading;
};
