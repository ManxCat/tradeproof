import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ experienceId: string }> }
) {
  try {
    const { experienceId } = await params;
    const headersList = await headers();
    
    // Get Whop API key from env
    const apiKey = process.env.WHOP_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing WHOP_API_KEY' },
        { status: 500 }
      );
    }

    // Fetch experience from Whop API
    const response = await fetch(`https://api.whop.com/api/v5/experiences/${experienceId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch experience' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Experience API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}