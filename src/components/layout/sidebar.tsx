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
    <aside className="w-64 bg-indigo-700 text-white flex flex-col">
      <div className="p-6 bg-indigo-800">
        <h1 className="text-2xl font-bold">My Budget App</h1>
      </div>
      <nav className="flex-grow space-y-2 p-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center py-2 px-4 rounded transition-colors ${
              pathname === item.href ? 'bg-indigo-600' : 'hover:bg-indigo-600'
            }`}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-6">
        {user && (
          <button 
            onClick={handleSignOut}
            className="w-full py-2 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded transition-colors"
          >
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
}