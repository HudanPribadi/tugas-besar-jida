'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/actions/register-action';
import { signIn } from 'next-auth/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);

    const result = await registerAction(formData);

    if (result.success) {
      router.push('/dashboard/forms');
    } else {
      setError(result.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-sm w-full mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/" className="btn btn-ghost mr-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <h2 className="h2">Register</h2>
      </div>
      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div>
          <label htmlFor="name" className="form-label">Name</label>
          <input
            id="name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="form-label">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            required
          />
        </div>
        {error && <p className="text-error text-sm">{error}</p>}
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm">Already have an account? <button onClick={() => signIn('google')} className="text-blue-500 font-semibold">Sign in with Google</button></p>
      </div>
    </div>
  );
}