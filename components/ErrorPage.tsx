'use client';

import Link from 'next/link';

export default function ErrorPage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-white rounded-lg shadow-md p-8">
      <p className="text-error text-lg mb-4">{message}</p>
      <Link href="/" className="btn btn-primary">Go to Home</Link>
    </div>
  );
}