import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { appSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET settings
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

    let settings = await db.query.appSettings.findFirst({
      where: eq(appSettings.experienceId, experienceId)
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = (await db.insert(appSettings).values({
        id: nanoid(),
        experienceId,
        minCancellationCharacters: 20,
        competitionEnabled: true,
        competitionPeriod: 'weekly',
        competitionTitle: 'Weekly Competition',
        competitionPrize: 'Top trader gets bragging rights! 🏆'
      }).returning())[0];
    }

    return NextResponse.json({ settings });

  } catch (error: any) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}

// UPDATE settings
export async function POST(request: NextRequest) {
  try {
    const { 
      experienceId, 
      minCancellationCharacters,
      competitionEnabled,
      competitionPeriod,
      competitionTitle,
      competitionPrize
    } = await request.json();

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate min characters
    if (minCancellationCharacters !== undefined && 
        (minCancellationCharacters < 0 || minCancellationCharacters > 500)) {
      return NextResponse.json(
        { error: 'Minimum characters must be between 0 and 500' },
        { status: 400 }
      );
    }

    // Validate competition period
    if (competitionPeriod && !['daily', 'weekly', 'monthly'].includes(competitionPeriod)) {
      return NextResponse.json(
        { error: 'Competition period must be daily, weekly, or monthly' },
        { status: 400 }
      );
    }

    // Check if settings exist
    const existing = await db.query.appSettings.findFirst({
      where: eq(appSettings.experienceId, experienceId)
    });

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date()
    };
    
    if (minCancellationCharacters !== undefined) updateData.minCancellationCharacters = minCancellationCharacters;
    if (competitionEnabled !== undefined) updateData.competitionEnabled = competitionEnabled;
    if (competitionPeriod !== undefined) updateData.competitionPeriod = competitionPeriod;
    if (competitionTitle !== undefined) updateData.competitionTitle = competitionTitle;
    if (competitionPrize !== undefined) updateData.competitionPrize = competitionPrize;

    let settings;
    if (existing) {
      // Update
      settings = (await db.update(appSettings)
        .set(updateData)
        .where(eq(appSettings.experienceId, experienceId))
        .returning())[0];
    } else {
      // Create with defaults
      settings = (await db.insert(appSettings).values({
        id: nanoid(),
        experienceId,
        minCancellationCharacters: minCancellationCharacters ?? 20,
        competitionEnabled: competitionEnabled ?? true,
        competitionPeriod: competitionPeriod ?? 'weekly',
        competitionTitle: competitionTitle ?? 'Weekly Competition',
        competitionPrize: competitionPrize ?? 'Top trader gets bragging rights! 🏆'
      }).returning())[0];
    }

    return NextResponse.json({ 
      success: true, 
      settings 
    });

  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}