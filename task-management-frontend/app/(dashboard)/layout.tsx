'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { clearSession, getSessionFromStorage, UserRole } from '@/lib/auth';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const session = getSessionFromStorage();

    if (!session.token) {
      router.replace('/login');
      return;
    }

    setRole(session.role ?? 'USER');
    setIsReady(true);
  }, [router]);

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

  if (!isReady) {
    return (
      <main className="shell">
        <p className="info">Loading dashboard...</p>
      </main>
    );
  }

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
