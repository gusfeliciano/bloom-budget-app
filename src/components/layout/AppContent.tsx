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
    if (!loading && !user && pathname !== '/auth') {
      router.push('/auth');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user && pathname !== '/auth') {
    return null;
  }

  return (
    <div className="flex h-screen">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col">
        {user && <Header />}
        <main className="flex-1 p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}