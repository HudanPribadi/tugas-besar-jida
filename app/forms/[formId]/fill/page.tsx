// --- File: app/forms/[formId]/fill/page.tsx (Fill Form Page - Client Component) ---
'use client';

import { useState, useEffect } from 'react';
import { Form, FormField } from '@/types';
import { FormFieldType } from '@/types';
import { getFormByIdForPublic } from '@/actions/form-actions';
import ErrorPage from '@/components/ErrorPage';
import * as React from 'react';

interface FillFormPageProps {
  params: Promise<{
    formId: string;
  }>;
}

export default function FillFormPage({ params }: FillFormPageProps) {
  const {formId} = React.use(params);
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [fieldId: string]: string | string[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [fieldId: string]: string | undefined }>({});

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedForm = await getFormByIdForPublic(formId);
        if (fetchedForm) {
          setForm(fetchedForm);
          const initialAnswers: { [fieldId: string]: string | string[] } = {};
          fetchedForm.fields.forEach(field => {
            if (field.type === 'checkbox') {
              initialAnswers[field.id] = [];
            } else {
              initialAnswers[field.id] = '';
            }
          });
          setAnswers(initialAnswers);
        } else {
          setError('Form not found or there was an error loading it.');
        }
      } catch (err: any) {
        console.error('Failed to fetch form:', err);
        setError(err.message || 'Failed to load form. It might not exist or there was an error.');
      } finally {
        setLoading(false);
      }
    };
    if (formId) {
      fetchForm();
    }
  }, [formId]);

  const handleInputChange = (fieldId: string, value: string, type: FormFieldType) => {
    setAnswers(prevAnswers => {
      if (type === 'checkbox') {
        const currentValues = (prevAnswers[fieldId] as string[]) || [];
        if (currentValues.includes(value)) {
          return { ...prevAnswers, [fieldId]: currentValues.filter(v => v !== value) };
        } else {
          return { ...prevAnswers, [fieldId]: [...currentValues, value] };
        }
      }
      return { ...prevAnswers, [fieldId]: value };
    });
    setValidationErrors(prevErrors => ({ ...prevErrors, [fieldId]: undefined }));
  };

  const validateForm = () => {
    const errors: { [fieldId: string]: string } = {};
    if (!form) return false;

    form.fields.forEach(field => {
      if (field.required) {
        const answer = answers[field.id];
        if (field.type === 'checkbox') {
          if (!answer || (answer as string[]).length === 0) {
            errors[field.id] = 'This field is required.';
          }
        } else if (!answer || String(answer).trim() === '') {
          errors[field.id] = 'This field is required.';
        }
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setError(null);

    if (!validateForm()) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!form) {
        setError("Form data is missing.");
        setIsSubmitting(false);
        return;
      }

      const formattedAnswers = form.fields.map(field => ({
        fieldId: field.id,
        value: field.type === 'checkbox' ? JSON.stringify(answers[field.id]) : String(answers[field.id]),
      }));

      const response = await fetch(`/api/forms/${form.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers: formattedAnswers }),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        const newInitialAnswers: { [fieldId: string]: string | string[] } = {};
        form.fields.forEach(field => {
          if (field.type === 'checkbox') {
            newInitialAnswers[field.id] = [];
          } else {
            newInitialAnswers[field.id] = '';
          }
        });
        setAnswers(newInitialAnswers);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        setError(result.message || 'Failed to submit your response.');
      }
    } catch (err) {
      console.error('Failed to submit response:', err);
      setError('Failed to submit your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[calc(100vh-160px)]"><div className="spinner"></div></div>;
  if (error && !form) return <ErrorPage message={error} />;
  if (!form) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="h2 mb-2">{form.title}</h2>
      <p className="text-lg mb-6">{form.description}</p>

      <form onSubmit={handleSubmitResponse} className="flex flex-col gap-6">
        {form.fields.length === 0 ? (
          <p className="text-lg text-center py-6">This form has no fields yet.</p>
        ) : (
          form.fields.map(field => (
            <div key={field.id} className="border rounded-lg p-4 shadow-sm bg-gray-50">
              <label className="form-label">
                {field.label} {field.required && <span className="text-error">*</span>}
              </label>
              {field.type === 'text' && (
                <>
                  <input
                    type="text"
                    value={answers[field.id] as string}
                    onChange={(e) => handleInputChange(field.id, e.target.value, field.type)}
                    placeholder="Your answer"
                    className={`form-control ${validationErrors[field.id] ? 'is-invalid' : ''}`}
                  />
                  {validationErrors[field.id] && <p className="text-error text-sm mt-1">{validationErrors[field.id]}</p>}
                </>
              )}
              {field.type === 'textarea' && (
                <>
                  <textarea
                    value={answers[field.id] as string}
                    onChange={(e) => handleInputChange(field.id, e.target.value, field.type)}
                    placeholder="Your detailed answer"
                    className={`form-control ${validationErrors[field.id] ? 'is-invalid' : ''}`}
                    rows={4}
                  />
                  {validationErrors[field.id] && <p className="text-error text-sm mt-1">{validationErrors[field.id]}</p>}
                </>
              )}
              {field.type === 'radio' && (
                <div className="flex flex-col gap-2">
                  {field.options.map(option => (
                    <label key={option} className="form-check">
                      <input
                        type="radio"
                        name={`radio-${field.id}`}
                        value={option}
                        checked={answers[field.id] === option}
                        onChange={() => handleInputChange(field.id, option, field.type)}
                        className="form-check-input"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                  {validationErrors[field.id] && <p className="text-error text-sm mt-1">{validationErrors[field.id]}</p>}
                </div>
              )}
              {field.type === 'checkbox' && (
                <div className="flex flex-col gap-2">
                  {field.options.map(option => (
                    <label key={option} className="form-check">
                      <input
                        type="checkbox"
                        value={option}
                        checked={(answers[field.id] as string[])?.includes(option)}
                        onChange={(e) => handleInputChange(field.id, option, field.type)}
                        className="form-check-input"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                  {validationErrors[field.id] && <p className="text-error text-sm mt-1">{validationErrors[field.id]}</p>}
                </div>
              )}
              {field.type === 'number' && (
                <>
                  <input
                    type="number"
                    value={answers[field.id] as string}
                    onChange={(e) => handleInputChange(field.id, e.target.value, field.type)}
                    placeholder="Enter a number"
                    className={`form-control ${validationErrors[field.id] ? 'is-invalid' : ''}`}
                  />
                  {validationErrors[field.id] && <p className="text-error text-sm mt-1">{validationErrors[field.id]}</p>}
                </>
              )}
              {field.type === 'date' && (
                <>
                  <input
                    type="date"
                    value={answers[field.id] as string}
                    onChange={(e) => handleInputChange(field.id, e.target.value, field.type)}
                    className={`form-control ${validationErrors[field.id] ? 'is-invalid' : ''}`}
                  />
                  {validationErrors[field.id] && <p className="text-error text-sm mt-1">{validationErrors[field.id]}</p>}
                </>
              )}
            </div>
          ))
        )}

        {error && <p className="text-error text-sm">{error}</p>}
        {submitSuccess && <p className="text-green-500 text-sm">Your response has been submitted successfully!</p>}

        <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Response'}
        </button>
      </form>
    </div>
  );
}