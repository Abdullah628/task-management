import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { DashboardShell } from '@/components/DashboardShell';
import { UserRole } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Dashboard | Task Management',
  description: 'Manage tasks, profile details, and admin audit logs.',
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('tm_token')?.value;
  const roleCookie = cookieStore.get('tm_role')?.value;

  if (!token) {
    redirect('/login');
  }

  const role: UserRole = roleCookie === 'ADMIN' ? 'ADMIN' : 'USER';
  return <DashboardShell role={role}>{children}</DashboardShell>;
}
