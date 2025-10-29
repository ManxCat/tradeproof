'use server';

import { db } from '@/lib/db';
import { trades } from '@/lib/db/schema';
import { verifyUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';

export async function submitTrade(formData: FormData, experienceId: string) {
  // Verify user and get their info (members can submit trades)
  const { userId, username, accessLevel } = await verifyUser({ 
    experienceId
  });

  // Block if no access
  if (accessLevel === 'no_access' || !userId) {
    throw new Error('Authentication required to submit trades');
  }

  // Get form data
  const symbol = formData.get('symbol') as string;
  const positionType = formData.get('positionType') as string;
  const assetType = formData.get('assetType') as string;
  const leverage = parseFloat(formData.get('leverage') as string);
  const entryPrice = parseFloat(formData.get('entryPrice') as string);
  const exitPrice = parseFloat(formData.get('exitPrice') as string);
  const positionSize = parseFloat(formData.get('positionSize') as string);

  // Calculate P&L based on position type
  let priceDiff: number;
  let pnl: number;
  let roi: number;

  if (positionType === 'long') {
    // LONG: profit when price goes UP
    priceDiff = exitPrice - entryPrice;
    pnl = (priceDiff / entryPrice) * positionSize * leverage;
    roi = (priceDiff / entryPrice) * 100;
  } else {
    // SHORT: profit when price goes DOWN
    priceDiff = entryPrice - exitPrice;
    pnl = (priceDiff / entryPrice) * positionSize * leverage;
    roi = (priceDiff / entryPrice) * 100;
  }

  // Insert trade into database
  await db.insert(trades).values({
    id: nanoid(),
    experienceId,
    userId,
    username: username || 'Anonymous',  // ✅ Provide fallback instead of null
    symbol,
    positionType,
    assetType,
    leverage: leverage.toString(),
    entryPrice: entryPrice.toString(),
    exitPrice: exitPrice.toString(),
    positionSize: positionSize.toString(),
    pnl: pnl.toString(),
    roi: roi.toString(),
    status: 'pending',  // ✅ Trades start as pending
    screenshot: null,
  });

  // Redirect back to leaderboard
  redirect(`/experiences/${experienceId}/post-trade?success=true`);
}