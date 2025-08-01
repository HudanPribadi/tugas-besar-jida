'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { signIn } from '@/auth'; // Import signIn helper from auth.ts

// Define a Zod schema for input validation
const registerSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  email: z.email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export async function registerAction(formData: FormData) {
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  };

  try {
    // Validate input data
    const validatedData = registerSchema.parse(rawData);

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { success: false, message: 'User with this email already exists.' };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Create the new user in the database
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        // Since we are not using an OAuth provider, the `emailVerified` field is not set.
        // In a real app, you would send a verification email.
      },
    });

    // Automatically sign in the new user after successful registration
    // This uses the Credentials provider we configured.
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false, // Prevents a full page redirect
    });

    // Return success message
    return { success: true, message: 'Registration successful!' };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      // Handle validation errors from Zod
      return { success: false, message: error.issues[0].message };
    }
    console.error('Error during registration:', error);
    return { success: false, message: 'An unexpected error occurred during registration.' };
  }
}