import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Tasks | Task Management',
  description: 'View, create, and update assigned tasks.',
};

export default function TasksLayout({ children }: { children: ReactNode }) {
  return children;
}