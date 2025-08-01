import { getFormResponsesForUser } from '@/actions/response-actions';
import { Form, FormResponse } from '@/types';
import { redirect } from 'next/navigation';
import ResponseViewer from '@/components/ResponseViewer';
import Link from 'next/link';
import * as React from 'react';

interface ViewResponsesPageProps {
  params: Promise<{
    formId: string;
  }>;
}

export default async function ViewResponsesPage({ params }: ViewResponsesPageProps) {
  const { formId } = React.use(params);
  let form: Form | null = null;
  let responses: FormResponse[] = [];
  let error: string | null = null;

  try {
    const fetchedData = await getFormResponsesForUser(formId);
    form = fetchedData.form;
    responses = fetchedData.responses;
  } catch (err: any) {
    console.error('Failed to fetch data:', err);
    error = err.message || 'Failed to load responses. Please try again.';
    if (err.message.includes('Unauthorized')) {
      redirect('/api/auth/signin');
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-white rounded-lg shadow-md p-8">
        <p className="text-error text-lg mb-4">{error}</p>
        <Link href="/dashboard/forms" className="btn btn-primary">Back to My Forms</Link>
      </div>
    );
  }

  if (!form) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-160px)]"><div className="spinner"></div></div>;
  }

  return <ResponseViewer form={form} initialResponses={responses} initialError={error} />;
}