'use client';

import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const verifyToken = useAuthStore((state) => state.verifyToken);

  useEffect(() => {
    verifyToken();
  }, [verifyToken]);

  return <>{children}</>;
};
