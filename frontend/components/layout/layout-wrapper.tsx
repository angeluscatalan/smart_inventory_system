'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MainLayout } from './main-layout';
import { Spinner } from '@/components/ui/spinner';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Check if current path is login page
  const isLoginPage = pathname === '/login';

  useEffect(() => {
    // If user is on login page and authenticated, redirect to dashboard
    if (isLoginPage && isAuthenticated && !isLoading) {
      router.push('/');
    }
    // If user is not on login page and not authenticated, redirect to login
    if (!isLoginPage && !isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, isLoginPage, router, pathname]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Spinner />
      </div>
    );
  }

  // If on login page, render without MainLayout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If authenticated, render with MainLayout
  if (isAuthenticated) {
    return <MainLayout>{children}</MainLayout>;
  }

  // Fallback (should not reach here due to redirect)
  return null;
}
