'use client';

import { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { deleteFormAction } from '@/actions/form-actions';

interface DeleteFormButtonProps {
  formId: string;
}

export default function DeleteFormButton({ formId }: DeleteFormButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this form and all its responses?')) {
      setIsDeleting(true);
      const result = await deleteFormAction(formId);
      if (!result.success) {
        alert(`Error: ${result.message}`);
      }
      setIsDeleting(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={isDeleting} className="btn btn-danger">
      <TrashIcon className="h-4 w-4 mr-1" />
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}