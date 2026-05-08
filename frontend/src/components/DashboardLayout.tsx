'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useProtectedRoute } from '@/hooks/useAuth';

export const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const isProtected = useProtectedRoute();

  if (!isProtected) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
