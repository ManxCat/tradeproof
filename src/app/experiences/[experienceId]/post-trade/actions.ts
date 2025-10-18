'use server';

import { db } from '@/lib/db';
import { trades } from '@/lib/db/schema';
import { verifyUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';

export async function submitTrade(formData: FormData, experienceId: string) {
  // Verify user is admin
  const { userId } = await verifyUser({ 
    experienceId,
    requiredAccess: 'admin' 
  });

  // Get form data
  const symbol = formData.get('symbol') as string;
  const entryPrice = parseFloat(formData.get('entryPrice') as string);
  const exitPrice = parseFloat(formData.get('exitPrice') as string);
  const positionSize = parseFloat(formData.get('positionSize') as string);

  // Calculate P&L and ROI
  const priceDiff = exitPrice - entryPrice;
  const pnl = (priceDiff / entryPrice) * positionSize;
  const roi = (priceDiff / entryPrice) * 100;

  // Insert trade into database
  await db.insert(trades).values({
    id: nanoid(),
    experienceId,
    userId,
    symbol,
    entryPrice,
    exitPrice,
    positionSize,
    pnl,
    roi,
    status: 'approved', // Auto-approve for now
    screenshot: null,
  });

  // Redirect back to leaderboard
  redirect(`/experiences/${experienceId}`);
}