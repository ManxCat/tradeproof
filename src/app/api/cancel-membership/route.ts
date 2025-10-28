import { NextRequest, NextResponse } from 'next/server';
import { cancelWhopMembership, getMembership } from '@/lib/whop-api';
import { db } from '@/lib/db';
import { cancellationFeedback, appSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { experienceId, membershipId, feedback, userId } = await request.json();

    // Validate input
    if (!membershipId || !feedback || !userId || !experienceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get membership to verify it exists
    const membership = await getMembership(membershipId);
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    // Get settings for this experience
    const settings = await db.query.appSettings.findFirst({
      where: eq(appSettings.experienceId, experienceId)
    });

    const minChars = settings?.minCancellationCharacters || 20;

    // Validate feedback length
    if (feedback.length < minChars) {
      return NextResponse.json(
        { error: `Feedback must be at least ${minChars} characters` },
        { status: 400 }
      );
    }

    // Save feedback to database FIRST (in case cancellation fails)
    await db.insert(cancellationFeedback).values({
      id: nanoid(),
      experienceId,
      membershipId,
      userId,
      username: membership.user?.username || 'Unknown',
      feedback,
      cancelledAt: new Date()
    });

    // NOW actually cancel the membership via Whop API
    // THIS IS THE CRITICAL FIX - you were missing this
    await cancelWhopMembership(membershipId);

    return NextResponse.json({
      success: true,
      message: 'Membership cancelled successfully'
    });

  } catch (error: any) {
    console.error('Cancellation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel membership' },
      { status: 500 }
    );
  }
}