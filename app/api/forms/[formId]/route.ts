// --- File: app/api/forms/[formId]/submit/route.ts (Public API for Form Submission) ---
// This is an API route for unauthenticated form submissions.
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { FormResponse, ResponseAnswer } from '@/types';



export async function POST(
  request: NextRequest,
  { params }: {params: { formId: string }}
) {
  const formId = params.formId;
  const { answers } = await request.json();

  if (!formId || !answers || !Array.isArray(answers)) {
    return NextResponse.json({ message: 'Invalid request data' }, { status: 400 });
  }

  try {
    // Verify form exists (optional, but good for data integrity)
    const formExists = await prisma.form.findUnique({
      where: { id: formId },
      select: { id: true },
    });

    if (!formExists) {
      return NextResponse.json({ message: 'Form not found' }, { status: 404 });
    }

    // Create the form response record
    const newResponse = await prisma.formResponse.create({
      data: {
        formId: formId,
      },
    });

    // Create individual answers linked to the response
    const responseAnswersData = answers.map((answer: { fieldId: string; value: string }) => ({
      responseId: newResponse.id,
      fieldId: answer.fieldId,
      value: answer.value,
    }));

    await prisma.responseAnswer.createMany({
      data: responseAnswersData,
    });

    return NextResponse.json({ success: true, message: 'Response submitted successfully!' }, { status: 200 });
  } catch (error) {
    console.error('Error submitting form response:', error);
    return NextResponse.json({ message: 'Failed to submit response.' }, { status: 500 });
  }
}

// You might also want a GET handler for testing the route, but not necessary for public submission
export async function GET() {
  return NextResponse.json({ message: 'This is the form submission API route. Use POST to submit responses.' }, { status: 200 });
}
