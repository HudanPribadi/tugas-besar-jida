
import Link from 'next/link';
import { auth } from '@/auth';
import { useSession, getSession } from "next-auth/react"

export default async function DashboardPage() {
  
  return (
    <div className="text-center py-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="h2 mb-4">Welcome!</h2>
      <p className="text-lg mb-8 max-w-2xl mx-auto">
        Your dashboard is the central hub for managing your forms. Get started by creating a new form or checking on your existing ones.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/dashboard/forms/create" className="btn btn-primary">
          Create a New Form
        </Link>
        <Link href="/dashboard/forms" className="btn btn-secondary">
          View My Forms
        </Link>
      </div>
    </div>
  );
}
