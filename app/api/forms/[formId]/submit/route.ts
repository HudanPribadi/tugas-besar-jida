// --- File: app/api/forms/[formId]/submit/route.ts ---
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Extract formId from the URL path
    const pathParts = request.nextUrl.pathname.split('/');
    const formId = pathParts[3]; // [0]='', [1]='api', [2]='forms', [3]=formId
    
    if (!formId) {
      return NextResponse.json(
        { message: 'Form ID is missing from URL' },
        { status: 400 }
      );
    }

    const { answers } = await request.json();

    // Validate input
    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { message: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Verify form exists
    const formExists = await prisma.form.findUnique({
      where: { id: formId },
      select: { id: true },
    });

    if (!formExists) {
      return NextResponse.json(
        { message: 'Form not found' },
        { status: 404 }
      );
    }

    // Create the response first
    const newResponse = await prisma.formResponse.create({
      data: { formId },
    });

    // Then create all answers with the correct responseId
    await prisma.responseAnswer.createMany({
      data: answers.map((answer: { fieldId: string; value: string }) => ({
        responseId: newResponse.id,
        fieldId: answer.fieldId,
        value: answer.value,
      })),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Response submitted successfully!',
        responseId: newResponse.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error submitting form response:', error);
    return NextResponse.json(
      { message: 'Failed to submit response' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Extract formId from URL for GET requests too
  const pathParts = request.nextUrl.pathname.split('/');
  const formId = pathParts[3];
  
  return NextResponse.json(
    { 
      message: 'Use POST to submit form responses',
      formId: formId || 'not provided'
    },
    { status: 200 }
  );
}