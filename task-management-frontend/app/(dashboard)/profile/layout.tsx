import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Profile | Task Management',
  description: 'Manage your profile and update your password.',
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}