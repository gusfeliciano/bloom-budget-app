'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/auth') {
        router.push('/auth');
      } else if (user && !user.email_confirmed_at && pathname !== '/verify-email') {
        router.push('/verify-email');
      }
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user && pathname !== '/auth') {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {user && user.email_confirmed_at && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {user && user.email_confirmed_at && <Header />}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}