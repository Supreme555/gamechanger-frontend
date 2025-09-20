'use client';

import { useAuthContext } from '@/lib/auth';
import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuthContext();

  if (isLoading) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return null; // Middleware перенаправит на логин
  }

  return <>{children}</>;
}
