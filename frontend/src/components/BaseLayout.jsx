'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/map-events', label: 'Map Events' }
];

export default function BaseLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="app-shell">
      <header>
        <p className="brand">TryMapFeature</p>
        <nav>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={active ? 'active' : ''}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
