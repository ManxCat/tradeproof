import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ experienceId: string }> }
) {
  try {
    const { experienceId } = await params;
    const headersList = await headers();
    
    // Get user token from headers (sent by Whop)
    const authHeader = headersList.get('authorization');
    const userToken = authHeader?.replace('Bearer ', '');
    
    if (!userToken) {
      return NextResponse.json(
        { error: 'No user token provided' },
        { status: 401 }
      );
    }

    // Fetch user from Whop API
    const response = await fetch('https://api.whop.com/api/v5/me', {
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('User API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}