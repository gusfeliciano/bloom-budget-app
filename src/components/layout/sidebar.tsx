'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/accounts', label: 'Accounts' },
  { href: '/budget', label: 'Budget' },
  { href: '/transactions', label: 'Transactions' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <aside className="w-64 bg-blue-700 text-white p-6 flex flex-col">
      <nav className="flex-grow space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block py-2 px-4 rounded ${
              pathname === item.href ? 'bg-blue-800' : 'hover:bg-blue-600'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        {user ? (
          <button 
            onClick={handleSignOut}
            className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        ) : (
          <Link 
            href="/auth"
            className="block w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600 text-center"
          >
            Sign In
          </Link>
        )}
      </div>
    </aside>
  );
}