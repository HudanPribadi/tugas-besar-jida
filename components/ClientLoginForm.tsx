'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { EnvelopeIcon, KeyIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function ClientLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email-login" className="form-label">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <EnvelopeIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="email-login"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="form-control pl-10"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="password-login" className="form-label">Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <KeyIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            id="password-login"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="form-control pl-10"
            required
          />
        </div>
      </div>
      {error && <p className="text-error text-sm text-center">{error}</p>}
      <button type="submit" className="btn btn-primary w-full" disabled={loading}>
        {loading ? 'Signing In...' : 'Sign In'}
      </button>
    </form>
  );
}