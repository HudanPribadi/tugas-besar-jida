// --- File: app/dashboard/forms/create/page.tsx (Create Form Page - Client Component) ---
'use client';

import { useState } from 'react';
import { createFormAction } from '@/actions/form-actions';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CreateFormPage() {
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!formTitle.trim()) {
      setError('Form title cannot be empty.');
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget as HTMLFormElement);

    try {
      const result = await createFormAction(formData);
      if (result.success) {
        setSuccess(true);
        setFormTitle('');
        setFormDescription('');
        setTimeout(() => router.push(`/dashboard/forms/${result.formId}/edit`), 1500);
      } else {
        setError(result.message || 'Failed to create form.');
      }
    } catch (err) {
      console.error('Failed to create form:', err);
      setError('Failed to create form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/forms" className="btn btn-ghost mr-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <h2 className="h2 text-gray-800">Create New Form</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label htmlFor="formTitle" className="form-label">Form Title <span className="text-error">*</span></label>
          <input
            id="formTitle"
            type="text"
            name="title"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="e.g., Customer Satisfaction Survey"
            className="form-control"
            required
          />
        </div>
        <div>
          <label htmlFor="formDescription" className="form-label">Description</label>
          <textarea
            id="formDescription"
            name="description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="e.g., Please provide your valuable feedback."
            className="form-control"
            rows={3}
          />
        </div>
        {error && <p className="text-error text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">Form created successfully! Redirecting to editor...</p>}
        <div className="flex gap-4 items-center">
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Form'}
          </button>
          <Link href="/dashboard/forms" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}