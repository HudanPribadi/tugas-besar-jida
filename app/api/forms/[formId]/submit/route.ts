// --- File: app/api/forms/[formId]/submit/route.ts ---
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const formId = params.formId;
    const { answers } = await request.json();

    // Validate input
    if (!formId || !answers || !Array.isArray(answers)) {
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

    // Create response and answers in a transaction
    const [newResponse] = await prisma.$transaction([
      prisma.formResponse.create({
        data: { formId },
      }),
      ...answers.map((answer: { fieldId: string; value: string }) =>
        prisma.responseAnswer.create({
          data: {
            responseId: '', // Temporary, will be replaced
            fieldId: answer.fieldId,
            value: answer.value,
          },
        })
      ),
    ]);

    // Update responseId for all answers
    await prisma.responseAnswer.updateMany({
      where: { responseId: '' },
      data: { responseId: newResponse.id },
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

export async function GET() {
  return NextResponse.json(
    { message: 'Use POST to submit form responses' },
    { status: 200 }
  );
}