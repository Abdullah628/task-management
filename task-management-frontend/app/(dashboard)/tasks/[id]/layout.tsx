import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Task Details | Task Management',
  description: 'Inspect task details and update task status.',
};

export default function TaskDetailsLayout({ children }: { children: ReactNode }) {
  return children;
}