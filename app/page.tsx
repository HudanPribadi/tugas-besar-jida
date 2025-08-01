'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import ClientSignInButton from '@/components/ClientSignInButton';
import ClientRegisterButton from '@/components/ClientRegisterButton';
import ClientLoginForm from '@/components/ClientLoginForm';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();
  const [showCredentialsLogin, setShowCredentialsLogin] = useState(false);

  if (status === 'authenticated' && session) {
    redirect('/dashboard');
  }

  if (status === 'loading') {
    return (
      <div className="text-center py-8 bg-white rounded-lg shadow-md p-6">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-sm w-full mx-auto">
        <h2 className="h2 text-center mb-6">
          {showCredentialsLogin ? 'Sign In' : 'Welcome!'}
        </h2>

        {showCredentialsLogin ? (
          <ClientLoginForm />
        ) : (
          <div className="flex flex-col gap-4">
            <ClientSignInButton />
            <p className="text-sm text-center text-gray-500">or</p>
            <button onClick={() => setShowCredentialsLogin(true)} className="btn btn-secondary w-full">
              Sign In with Email
            </button>
            <p className="text-sm text-center text-gray-500">
              Don't have an account? <Link href="/register" className="text-blue-500 font-semibold">Register</Link>
            </p>
          </div>
        )}

        {showCredentialsLogin && (
          <div className="mt-4 text-center">
            <button onClick={() => setShowCredentialsLogin(false)} className="text-blue-500 text-sm font-semibold">
              Go back to social sign-in
            </button>
          </div>
        )}
      </div>
    </div>
  );
}