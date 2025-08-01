// --- File: app/dashboard/forms/page.tsx (My Forms Page - Server Component) ---
import { PencilIcon, TrashIcon, EyeIcon, ChartBarIcon, PlusIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { getFormsForUser } from '@/actions/form-actions';
import { Form } from '@/types';
import { redirect } from 'next/navigation';
import DeleteFormButton from '@/components/DeleteFormButton';
import Link from 'next/link';

export default async function MyFormsPage() {
  let forms: Form[] = [];
  let error: string | null = null;

  try {
    forms = await getFormsForUser();
  } catch (err: any) {
    console.error('Failed to fetch forms:', err);
    error = err.message || 'Failed to load forms. Please try again.';
    if (err.message.includes('Unauthorized')) {
      redirect('/api/auth/signin');
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-white rounded-lg shadow-md p-8">
        <p className="text-error text-lg mb-4">{error}</p>
        <Link href="/" className="btn btn-primary">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="h2 text-gray-800 mb-6">My Forms</h2>
      {forms.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg mb-4">You haven't created any forms yet.</p>
          <Link href="/dashboard/forms/create" className="btn btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map(form => (
            <div key={form.id} className="border rounded-lg p-4 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="h3 mb-2">{form.title}</h3>
                <p className="text-sm mb-4 line-clamp-2">{form.description}</p>
                <p className="text-xs text-gray-500">Created: {format(new Date(form.createdAt), 'MMM dd, yyyy')}</p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Link href={`/dashboard/forms/${form.id}/edit`} className="btn btn-secondary">
                  <PencilIcon className="h-4 w-4 mr-1" />Edit
                </Link>
                <Link href={`/dashboard/forms/${form.id}/responses`} className="btn btn-secondary">
                  <ChartBarIcon className="h-4 w-4 mr-1" />Responses
                </Link>
                <Link href={`/forms/${form.id}/fill`} className="btn btn-secondary">
                  <EyeIcon className="h-4 w-4 mr-1" />Fill Form
                </Link>
                <DeleteFormButton formId={form.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}