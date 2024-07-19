'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, CreditCard, PiggyBank, Target } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/accounts', label: 'Accounts', icon: CreditCard },
  { href: '/transactions', label: 'Transactions', icon: PiggyBank },
  { href: '/budget', label: 'Budget', icon: Target }
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
            className={`flex items-center py-2 px-4 rounded ${
              pathname === item.href ? 'bg-blue-800' : 'hover:bg-blue-600'
            }`}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto">
        {user && (
          <button 
            onClick={handleSignOut}
            className="w-full py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}