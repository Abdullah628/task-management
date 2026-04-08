import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Login | Task Management',
  description: 'Sign in to access your task dashboard.',
};

export default function LoginLayout({ children }: { children: ReactNode }) {
  return children;
}