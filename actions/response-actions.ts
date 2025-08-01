'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { Form, FormResponse } from '@/types'; // Adjust the import path as necessary
import { verifyTokenPlaceholder } from '@/lib/auth-utils';

const ANONYMOUS_USER_ID = 'anon_user';

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

export async function getFormResponsesForUser(formId: string): Promise<{ form: Form | null; responses: FormResponse[] }> {
  try {
    const userId = await getAuthenticatedUserIdFromToken();

    if (!userId) {
      throw new Error('Unauthorized: User not logged in.');
    }

    const form = await prisma.form.findUnique({
      where: { id: formId, userId: userId }, // Ensure user owns the form
      include: { fields: { orderBy: { createdAt: 'asc' } } },
    });

    if (!form) {
      throw new Error('Form not found or you do not have permission to view responses.');
    }

    const responses = await prisma.formResponse.findMany({
      where: { formId: formId },
      include: { answers: true },
      orderBy: { submittedAt: 'desc' },
    });

    return { form: form as Form, responses: responses as FormResponse[] };
  } catch (error: any) {
    console.error('Error fetching form responses:', error);
    throw new Error(error.message || 'Failed to load responses.');
  }
}