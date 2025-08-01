'use client';

import { signIn } from 'next-auth/react';

export default function ClientSignInButton() {
  return (
    <button onClick={() => signIn('google')} className="btn btn-primary">
      Sign In with Google
    </button>
  );
}