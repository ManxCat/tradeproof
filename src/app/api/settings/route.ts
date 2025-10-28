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
        minCancellationCharacters: 20
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
    const { experienceId, minCancellationCharacters } = await request.json();

    if (!experienceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate min characters
    if (minCancellationCharacters < 0 || minCancellationCharacters > 500) {
      return NextResponse.json(
        { error: 'Minimum characters must be between 0 and 500' },
        { status: 400 }
      );
    }

    // Check if settings exist
    const existing = await db.query.appSettings.findFirst({
      where: eq(appSettings.experienceId, experienceId)
    });

    let settings;
    if (existing) {
      // Update
      settings = (await db.update(appSettings)
        .set({ 
          minCancellationCharacters,
          updatedAt: new Date()
        })
        .where(eq(appSettings.experienceId, experienceId))
        .returning())[0];
    } else {
      // Create
      settings = (await db.insert(appSettings).values({
        id: nanoid(),
        experienceId,
        minCancellationCharacters
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