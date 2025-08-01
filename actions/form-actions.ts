'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Form } from '@/types';
// NOTE: This is a conceptual placeholder. In a real application, you would
// import a JWT library and use it to securely verify a token.
// For this example, we will simulate the process.
import { verifyTokenPlaceholder } from '@/lib/auth-utils';

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

/**
 * Creates a new form, now ensuring the user exists first.
 * @param formData The form data containing the title and description.
 * @returns An object indicating success, with an optional message and formId.
 */
export async function createFormAction(formData: FormData): Promise<{ success: boolean; message?: string; formId?: string }> {
  try {
    const userId = await getAuthenticatedUserIdFromToken();
    if (!userId) {
      return { success: false, message: 'Unauthorized: User not logged in.' };
    }

    // Check if the placeholder user exists, and create it if not.
    // This is a crucial step to avoid the foreign key constraint error.
    await prisma.user.upsert({
      where: { id: userId },
      update: {}, // No updates needed if it exists
      create: {
        id: userId,
        name: 'Anonymous User',
        email: 'anonymous@example.com',
        // You might need to add other required fields here based on your Prisma schema
      },
    });

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title || title.trim() === '') {
      return { success: false, message: 'Form title is required.' };
    }

    const newForm = await prisma.form.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        userId: userId,
      },
    });

    revalidatePath('/dashboard/forms');
    return { success: true, message: 'Form created successfully!', formId: newForm.id };
  } catch (error) {
    console.error('Error creating form:', error);
    return { success: false, message: 'Failed to create form.' };
  }
}

/**
 * Updates an existing form, with a check for ownership.
 * @param formId The ID of the form to update.
 * @param formData The form data containing the new title and description.
 * @returns An object indicating success with an optional message.
 */
export async function updateFormAction(formId: string, formData: FormData): Promise<{ success: boolean; message?: string }> {
  try {
    const userId = await getAuthenticatedUserIdFromToken();
    if (!userId) {
      throw new Error('Unauthorized: User not logged in.');
    }
    
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!title || title.trim() === '') {
      return { success: false, message: 'Form title is required.' };
    }

    const existingForm = await prisma.form.findUnique({ where: { id: formId } });
    if (!existingForm || existingForm.userId !== userId) {
      throw new Error('Unauthorized: You do not own this form.');
    }

    await prisma.form.update({
      where: { id: formId },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
      },
    });

    revalidatePath(`/dashboard/forms/${formId}/edit`);
    revalidatePath('/dashboard/forms');
    return { success: true, message: 'Form updated successfully!' };
  } catch (error: any) {
    console.error('Error updating form:', error);
    return { success: false, message: error.message || 'Failed to update form.' };
  }
}

/**
 * Deletes a form, with a check for ownership.
 * @param formId The ID of the form to delete.
 * @returns An object indicating success with an optional message.
 */
export async function deleteFormAction(formId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const userId = await getAuthenticatedUserIdFromToken();
    if (!userId) {
      throw new Error('Unauthorized: User not logged in.');
    }

    const existingForm = await prisma.form.findUnique({ where: { id: formId } });
    if (!existingForm || existingForm.userId !== userId) {
      throw new Error('Unauthorized: You do not own this form.');
    }

    await prisma.responseAnswer.deleteMany({
      where: {
        response: {
          formId: formId
        }
      }
    });

    await prisma.formResponse.deleteMany({
      where: { formId: formId }
    });

    await prisma.formField.deleteMany({
      where: { formId: formId }
    });

    await prisma.form.delete({
      where: { id: formId },
    });

    revalidatePath('/dashboard/forms');
    return { success: true, message: 'Form deleted successfully!' };
  } catch (error: any) {
    console.error('Error deleting form:', error);
    return { success: false, message: error.message || 'Failed to delete form.' };
  }
}

/**
 * Fetches all forms for a specific user, now using the token for verification.
 * @returns A promise that resolves to an array of the user's forms.
 */
export async function getFormsForUser(): Promise<Form[]> {
  const userId = await getAuthenticatedUserIdFromToken();
  if (!userId) {
    throw new Error('Unauthorized: User not logged in.');
  }

  const forms = await prisma.form.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return forms as Form[];
}

/**
 * Fetches a form and its fields by ID, with a check for ownership.
 * @param formId The ID of the form to fetch.
 * @returns A promise that resolves to the form or null if not found.
 */
export async function getFormWithFields(formId: string): Promise<Form | null> {
  const userId = await getAuthenticatedUserIdFromToken();
  if (!userId) {
    throw new Error('Unauthorized: User not logged in.');
  }

  const form = await prisma.form.findUnique({
    where: { id: formId, userId: userId },
    include: { fields: { orderBy: { createdAt: 'asc' } } },
  });
  return form as Form | null;
}

/**
 * Fetches a form and its fields by ID for public viewing.
 * This function does not require authentication.
 * @param formId The ID of the form to fetch.
 * @returns A promise that resolves to the form or null if not found.
 */
export async function getFormByIdForPublic(formId: string): Promise<Form | null> {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: { fields: { orderBy: { createdAt: 'asc' } } },
  });
  return form as Form | null;
}
