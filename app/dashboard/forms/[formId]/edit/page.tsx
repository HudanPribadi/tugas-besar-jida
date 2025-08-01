// --- File: app/dashboard/forms/[formId]/edit/page.tsx ---
'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { getFormWithFields, updateFormAction } from '@/actions/form-actions';
import { addFormFieldAction, updateFormFieldAction, deleteFormFieldAction } from '@/actions/field-actions';
import { Form, FormField, FormFieldType } from '@/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ErrorPage from '@/components/ErrorPage';
import * as React from 'react';

interface EditFormPageProps {
  params: Promise<{
    formId: string;
  }>;
}

export default function EditFormPage({ params }: EditFormPageProps) {
  // Unwrap the params promise
  const { formId } = React.use(params);
  
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState<FormField | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  const [newFieldType, setNewFieldType] = useState<FormFieldType>('text');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');

  useEffect(() => {
    const fetchForm = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedForm = await getFormWithFields(formId);
        if (fetchedForm) {
          setForm(fetchedForm);
        } else {
          setError('Form not found or you do not have permission.');
        }
      } catch (err: any) {
        console.error('Failed to fetch form:', err);
        setError(err.message || 'Failed to load form. Please try again.');
        if (err.message.includes('Unauthorized')) {
          router.push('/api/auth/signin');
        }
      } finally {
        setLoading(false);
      }
    };
    if (formId) {
      fetchForm();
    }
  }, [formId, router]);

  const handleFormMetaUpdate = async (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!form) return;
    setIsSaving(true);
    setError(null);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description || '');

    try {
      const result = await updateFormAction(form.id, formData);
      if (!result.success) {
        setError(result.message || 'Failed to save form details.');
      }
    } catch (err) {
      console.error('Failed to update form meta:', err);
      setError('Failed to save form details. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddField = async () => {
    if (!form) return;
    if (!newFieldLabel.trim()) {
      setError('Field label cannot be empty.');
      return;
    }
    if (['radio', 'checkbox'].includes(newFieldType) && !newFieldOptions.trim()) {
      setError('Options are required for radio and checkbox fields.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const fieldData = {
        formId: form.id,
        type: newFieldType,
        label: newFieldLabel.trim(),
        required: newFieldRequired,
        options: newFieldOptions.split(',').map(opt => opt.trim()).filter(opt => opt !== ''),
      };
      const addedField = await addFormFieldAction(fieldData);
      setForm(prevForm => {
        if (!prevForm) return null;
        return {
          ...prevForm,
          fields: [...prevForm.fields, addedField]
        };
      });
      closeModal();
    } catch (err: any) {
      console.error('Failed to add field:', err);
      setError(err.message || 'Failed to add field. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateField = async () => {
    if (!fieldToEdit || !form) return;
    if (!fieldToEdit.label.trim()) {
      setError('Field label cannot be empty.');
      return;
    }
    if (['radio', 'checkbox'].includes(fieldToEdit.type) && (fieldToEdit.options as string[]).length === 0) {
      setError('Options are required for radio and checkbox fields.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const updatedField = await updateFormFieldAction(fieldToEdit.id, {
        label: fieldToEdit.label.trim(),
        required: fieldToEdit.required,
        options: fieldToEdit.options,
      });
      setForm(prevForm => {
        if (!prevForm) return null;
        return {
          ...prevForm,
          fields: prevForm.fields.map(f => (f.id === updatedField.id ? updatedField : f))
        };
      });
      closeModal();
    } catch (err: any) {
      console.error('Failed to update field:', err);
      setError(err.message || 'Failed to update field. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!form) return;
    if (window.confirm('Are you sure you want to delete this field?')) {
      setIsSaving(true);
      setError(null);
      try {
        await deleteFormFieldAction(fieldId);
        setForm(prevForm => {
          if (!prevForm) return null;
          return {
            ...prevForm,
            fields: prevForm.fields.filter(f => f.id !== fieldId)
          };
        });
      } catch (err: any) {
        console.error('Failed to delete field:', err);
        setError(err.message || 'Failed to delete field. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const openEditFieldModal = (field: FormField) => {
    setFieldToEdit({
      ...field,
      options: [Array.isArray(field.options) ? field.options.join(', ') : '']
    });
    setIsModalOpen(true);
  };

  const openAddFieldModal = () => {
    resetNewFieldForm();
    setFieldToEdit(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFieldToEdit(null);
    setError(null);
  };

  const resetNewFieldForm = () => {
    setNewFieldType('text');
    setNewFieldLabel('');
    setNewFieldRequired(false);
    setNewFieldOptions('');
    setError(null);
  };

  if (loading) return <div className="flex justify-center items-center min-h-[calc(100vh-160px)]"><div className="spinner"></div></div>;
  if (error && !form) return <ErrorPage message={error} />;

  if (!form) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/forms" className="btn btn-ghost mr-2">
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <h2 className="h2 text-gray-800">Edit Form: {form.title}</h2>
      </div>

      {error && <p className="text-error text-sm mb-4">{error}</p>}

      <div className="border rounded-lg p-4 mb-6 shadow-sm">
        <h3 className="h3 mb-4">Form Details</h3>
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="editFormTitle" className="form-label">Form Title <span className="text-error">*</span></label>
            <input
              id="editFormTitle"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              onBlur={handleFormMetaUpdate}
              className="form-control"
              required
            />
          </div>
          <div>
            <label htmlFor="editFormDescription" className="form-label">Description</label>
            <textarea
              id="editFormDescription"
              value={form.description || ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              onBlur={handleFormMetaUpdate}
              placeholder="e.g., Please provide your valuable feedback."
              className="form-control"
              rows={3}
            />
          </div>
          {isSaving && <p className="text-sm text-gray-500">Saving...</p>}
        </div>
      </div>

      <div className="border rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="h3">Form Fields</h3>
          <button onClick={openAddFieldModal} className="btn btn-primary">
            <PlusIcon className="h-5 w-5 mr-1" />Add Field
          </button>
        </div>

        {form.fields.length === 0 ? (
          <p className="text-lg text-center py-6">No fields added yet. Click "Add Field" to start!</p>
        ) : (
          <div className="flex flex-col gap-4">
            {form.fields.map(field => (
              <div key={field.id} className="border rounded-lg p-3 shadow-sm bg-gray-50 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{field.label} ({field.type}) {field.required && <span className="text-error text-xs">(Required)</span>}</p>
                  {['radio', 'checkbox'].includes(field.type) && (
                    <p className="text-sm">Options: {field.options.join(', ')}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost" onClick={() => openEditFieldModal(field)}>
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDeleteField(field.id)}>
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-header">{fieldToEdit ? 'Edit Field' : 'Add New Field'}</h3>
            <div className="modal-body">
              {error && <p className="text-error text-sm mb-4">{error}</p>}
              <div className="mb-4">
                <label className="form-label">Field Label</label>
                <input
                  type="text"
                  placeholder="e.g., Your Name"
                  value={fieldToEdit ? fieldToEdit.label : newFieldLabel}
                  onChange={(e) => fieldToEdit ? setFieldToEdit({ ...fieldToEdit, label: e.target.value }) : setNewFieldLabel(e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              {!fieldToEdit && (
                <div className="mb-4">
                  <label className="form-label">Field Type</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as FormFieldType)}
                    className="form-control"
                  >
                    <option value="text">Text Input (Short Answer)</option>
                    <option value="textarea">Text Area (Long Answer)</option>
                    <option value="radio">Radio Buttons (Single Choice)</option>
                    <option value="checkbox">Checkboxes (Multiple Choice)</option>
                    <option value="number">Number Input</option>
                    <option value="date">Date Input</option>
                  </select>
                </div>
              )}
              {['radio', 'checkbox'].includes(fieldToEdit ? fieldToEdit.type : newFieldType) && (
                <div className="mb-4">
                  <label className="form-label">Options (comma-separated)</label>
                  <textarea
                    placeholder="Option 1, Option 2, Option 3"
                    value={fieldToEdit ? (Array.isArray(fieldToEdit.options) ? fieldToEdit.options.join(', ') : fieldToEdit.options) : newFieldOptions}
                    onChange={(e) => fieldToEdit ? setFieldToEdit({ ...fieldToEdit, options: e.target.value.split(',').map(opt => opt.trim()) }) : setNewFieldOptions(e.target.value)}
                    className="form-control"
                    rows={2}
                  />
                </div>
              )}
              <div className="form-check">
                <input
                  id="fieldRequired"
                  type="checkbox"
                  checked={fieldToEdit ? fieldToEdit.required : newFieldRequired}
                  onChange={(e) => fieldToEdit ? setFieldToEdit({ ...fieldToEdit, required: e.target.checked }) : setNewFieldRequired(e.target.checked)}
                  className="form-check-input"
                />
                <label htmlFor="fieldRequired" className="text-sm">Required Field</label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={fieldToEdit ? handleUpdateField : handleAddField} disabled={isSaving}>
                {isSaving ? 'Saving...' : (fieldToEdit ? 'Save Changes' : 'Add Field')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}