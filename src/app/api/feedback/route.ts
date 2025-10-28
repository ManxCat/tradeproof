import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cancellationFeedback } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Missing experienceId' },
        { status: 400 }
      );
    }

    // Get all feedback for this experience
    const feedback = await db.query.cancellationFeedback.findMany({
      where: eq(cancellationFeedback.experienceId, experienceId),
      orderBy: [desc(cancellationFeedback.cancelledAt)],
      limit: 100
    });

    return NextResponse.json({ feedback });

  } catch (error: any) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load feedback' },
      { status: 500 }
    );
  }
}