import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
  }

  interface Session {
    user?: User & DefaultSession['user'];
  }
}

// Your application-specific types
export type FormFieldType = 'text' | 'textarea' | 'radio' | 'checkbox' | 'number' | 'date';

export interface FormField {
  id: string;
  formId: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options: string[]; // For radio/checkbox
  createdAt: Date; // Added for ordering
  updatedAt: Date; // Added for ordering
}

export interface Form {
  id: string;
  title: string;
  description?: string | null;
  userId: string; // Creator's ID
  createdAt: Date;
  updatedAt: Date;
  fields: FormField[]; // Populated when fetching a single form
}

export interface ResponseAnswer {
  id: string;
  responseId: string;
  fieldId: string;
  value: string; // Store all values as string, parse as needed (e.g., JSON for checkboxes)
}

export interface FormResponse {
  id: string;
  formId: string;
  submittedAt: Date;
  answers: ResponseAnswer[]; // Populated when fetching responses
}