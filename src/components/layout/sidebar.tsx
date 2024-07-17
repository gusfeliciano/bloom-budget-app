'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/accounts', label: 'Accounts' },
  { href: '/budget', label: 'Budget' },
  { href: '/transactions', label: 'Transactions' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-blue-700 text-white p-6">
      <nav className="space-y-2">
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
    </aside>
  )
}