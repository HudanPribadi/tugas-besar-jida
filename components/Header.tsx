'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const router = useRouter();

  return (
    <header className="bg-white shadow-sm p-4 border-b border-gray-200">
      <div className="container flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 cursor-pointer" onClick={() => router.push('/')}>Form Builder</h1>
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard/forms" className="btn btn-ghost">My Forms</Link>
              <Link href="/dashboard/forms/create" className="btn btn-ghost">Create New Form</Link>
              <span className="text-sm hidden sm:inline">Hello, {session?.user?.name || session?.user?.email}!</span>
              <button onClick={() => signOut()} className="btn btn-danger">Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/" className="btn btn-primary">Sign In / Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}