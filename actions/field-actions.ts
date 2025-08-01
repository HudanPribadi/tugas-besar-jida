'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { verifyTokenPlaceholder } from '@/lib/auth-utils';
import { FormField, FormFieldType } from '@/types';

const ANONYMOUS_USER_ID = 'anon_user';

/**
 * A conceptual function to get the authenticated user ID by reading a token.
 * This simulates reading a token from a cookie and validating it.
 *
 * @returns The user's ID if authenticated, otherwise null.
 */
async function getAuthenticatedUserIdFromToken(): Promise<string | null> {
  // Call cookies() directly as it's a synchronous function that returns the object.
  const cookiesStore = await cookies();
  const token = cookiesStore.get('session_token')?.value;

  if (!token) {
    // For this example, we will return a hardcoded ID to prevent the
    // foreign key constraint error, since a real auth system is not in place.
    // In a real app, this would be null.
    return ANONYMOUS_USER_ID;
  }
  
  // This is a simplified, insecure placeholder for demonstration.
  // The actual implementation would verify the token and return the real userId.
  const userId = verifyTokenPlaceholder(token);
  return userId;
}

interface AddFieldData {
  formId: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  options: string[];
}

export async function addFormFieldAction(fieldData: AddFieldData): Promise<FormField> {
  try {
    const userId = await getAuthenticatedUserIdFromToken();
    if (!userId) {
      throw new Error('Unauthorized: User not logged in.');
    }

    // Ensure the placeholder user exists to satisfy the foreign key constraint.
    // This is a crucial step to avoid the "Foreign key constraint violated" error.
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        name: 'Anonymous User',
        email: 'anonymous@example.com',
      },
    });

    // Verify user owns the form
    const form = await prisma.form.findUnique({
      where: { id: fieldData.formId, userId: userId },
    });
    if (!form) {
      throw new Error('Unauthorized: Form not found or you do not own it.');
    }

    const newField = await prisma.formField.create({
      data: {
        formId: fieldData.formId,
        type: fieldData.type,
        label: fieldData.label,
        required: fieldData.required,
        options: fieldData.options,
      },
    });

    revalidatePath(`/dashboard/forms/${fieldData.formId}/edit`);
    return newField as FormField;
  } catch (error: any) {
    console.error('Error adding field:', error);
    throw new Error(error.message || 'Failed to add field.');
  }
}

interface UpdateFieldData {
  label: string;
  required: boolean;
  options: string[];
}

export async function updateFormFieldAction(fieldId: string, updates: UpdateFieldData): Promise<FormField> {
  try {
    const userId = await getAuthenticatedUserIdFromToken();
    if (!userId) {
      throw new Error('Unauthorized: User not logged in.');
    }

    // Verify user owns the field's form
    const field = await prisma.formField.findUnique({
      where: { id: fieldId },
      include: { form: true },
    });
    if (!field || field.form.userId !== userId) {
      throw new Error('Unauthorized: Field not found or you do not own the associated form.');
    }

    const updatedField = await prisma.formField.update({
      where: { id: fieldId },
      data: {
        label: updates.label,
        required: updates.required,
        options: updates.options,
      },
    });

    revalidatePath(`/dashboard/forms/${field.formId}/edit`);
    return updatedField as FormField;
  } catch (error: any) {
    console.error('Error updating field:', error);
    throw new Error(error.message || 'Failed to update field.');
  }
}

export async function deleteFormFieldAction(fieldId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const userId = await getAuthenticatedUserIdFromToken();
    if (!userId) {
      throw new Error('Unauthorized: User not logged in.');
    }

    // Verify user owns the field's form
    const field = await prisma.formField.findUnique({
      where: { id: fieldId },
      include: { form: true },
    });
    if (!field || field.form.userId !== userId) {
      throw new Error('Unauthorized: Field not found or you do not own the associated form.');
    }

    // Delete associated answers first
    await prisma.responseAnswer.deleteMany({
      where: { fieldId: fieldId }
    });

    await prisma.formField.delete({
      where: { id: fieldId },
    });

    revalidatePath(`/dashboard/forms/${field.formId}/edit`);
    return { success: true, message: 'Field deleted successfully!' };
  } catch (error: any) {
    console.error('Error deleting field:', error);
    return { success: false, message: error.message || 'Failed to delete field.' };
  }
}
