'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useMemo } from 'react';
import { clearSession, UserRole } from '@/lib/auth';

interface DashboardShellProps {
  children: ReactNode;
  role: UserRole;
}

export function DashboardShell({ children, role }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = useMemo(() => {
    const base = [
      { href: '/tasks', label: 'My Tasks' },
      { href: '/profile', label: 'Profile' },
    ];

    if (role === 'ADMIN') {
      base.push({ href: '/audit', label: 'Audit Logs' });
    }

    return base;
  }, [role]);

  return (
    <div className="dashboard">
      <div className="dashboard-frame">
        <aside className="sidebar">
          <div className="sidebar-title">
            {role === 'ADMIN' ? 'Admin Dashboard' : 'User Dashboard'}
          </div>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${pathname.startsWith(link.href) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <div className="sidebar-footer">
            <button
              className="btn btn-ghost"
              onClick={() => {
                clearSession();
                router.replace('/login');
                router.refresh();
              }}
            >
              Logout
            </button>
          </div>
        </aside>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}