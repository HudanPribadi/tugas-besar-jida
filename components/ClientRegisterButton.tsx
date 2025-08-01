'use client';

import { useRouter } from 'next/navigation';

export default function ClientRegisterButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.push('/register')} className="btn btn-bordered">
      Register
    </button>
  );
}