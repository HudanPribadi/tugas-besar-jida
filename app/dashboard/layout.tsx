// --- File: app/dashboard/layout.tsx ---
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  

  return (
    <>
      {children}
    </>
  );
}