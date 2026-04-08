import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Audit Logs | Task Management',
  description: 'Review audit history for task lifecycle events.',
};

export default function AuditLayout({ children }: { children: ReactNode }) {
  return children;
}