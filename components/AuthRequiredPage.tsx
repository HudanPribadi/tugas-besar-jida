'use client';

import { signIn } from 'next-auth/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AuthRequiredPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-white rounded-lg shadow-md p-8">
      <DocumentTextIcon className="h-24 w-24 text-gray-400 mb-6" />
      <h2 className="h2 mb-4">Authentication Required</h2>
      <p className="text-lg text-center mb-8">Please sign in to create forms, edit them, or view responses.</p>
      <button onClick={() => signIn('google')} className="btn btn-primary">Sign In with Google</button>
      <Link href="/" className="btn btn-ghost mt-4">Back to Home</Link>
    </div>
  );
}