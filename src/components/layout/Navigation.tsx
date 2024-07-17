'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function Navigation() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li><Link href="/">Home</Link></li>
        {user ? (
          <>
            <li><Link href="/accounts">Accounts</Link></li>
            <li><button onClick={handleSignOut}>Sign Out</button></li>
          </>
        ) : (
          <li><Link href="/auth">Sign In</Link></li>
        )}
      </ul>
    </nav>
  );
}