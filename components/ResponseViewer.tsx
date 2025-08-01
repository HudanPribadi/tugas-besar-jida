'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Form, FormResponse } from '@/types';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface ResponseViewerProps {
  form: Form;
  initialResponses: FormResponse[];
  initialError: string | null;
}

export default function ResponseViewer({ form, initialResponses, initialError }: ResponseViewerProps) {
  const [responses] = useState<FormResponse[]>(initialResponses);
  const [currentError] = useState<string | null>(initialError);
  const [selectedResponse, setSelectedResponse] = useState<FormResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const openResponseModal = (response: FormResponse) => {
    setSelectedResponse(response);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResponse(null);
  };

  if (currentError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-160px)] bg-white rounded-lg shadow-md p-8">
        <p className="text-error text-lg mb-4">{currentError}</p>
        <Link href="/dashboard/forms" className="btn btn-primary">Back to My Forms</Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/forms" className="btn btn-ghost mr-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <h2 className="h2">Responses for: {form.title}</h2>
      </div>

      {responses.length === 0 ? (
        <p className="text-lg text-center py-10">No responses submitted for this form yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {responses.map(response => (
            <div key={response.id} className="border rounded-lg p-4 shadow-sm bg-gray-50 flex items-center justify-between">
              <div>
                <p className="font-medium">Response ID: {response.id.substring(0, 8)}...</p>
                <p className="text-sm">Submitted: {format(new Date(response.submittedAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              <button className="btn btn-secondary" onClick={() => openResponseModal(response)}>View Details</button>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-header">Response Details</h3>
            <div className="modal-body">
              {selectedResponse && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm"><strong>Response ID:</strong> {selectedResponse.id}</p>
                  <p className="text-sm"><strong>Submitted At:</strong> {format(new Date(selectedResponse.submittedAt), 'MMM dd, yyyy HH:mm')}</p>
                  <h4 className="font-semibold mt-4">Answers:</h4>
                  {form.fields.map(field => {
                    const answer = selectedResponse.answers.find(a => a.fieldId === field.id);
                    let displayValue = 'N/A';
                    if (answer) {
                      if (field.type === 'checkbox') {
                        try {
                          const parsedValue = JSON.parse(answer.value);
                          displayValue = Array.isArray(parsedValue) ? parsedValue.join(', ') : answer.value;
                        } catch (e) {
                          displayValue = answer.value;
                        }
                      } else {
                        displayValue = answer.value;
                      }
                    }
                    return (
                      <div key={field.id} className="border-b pb-2">
                        <p className="text-sm font-medium">{field.label}:</p>
                        <p className="text-sm ml-2">{displayValue || 'No answer'}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}