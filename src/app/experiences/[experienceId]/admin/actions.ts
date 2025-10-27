'use server';

import { db } from '@/lib/db';
import { trades } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function approveTrade(formData: FormData) {
  const tradeId = formData.get('tradeId') as string;
  const experienceId = formData.get('experienceId') as string;

  await db
    .update(trades)
    .set({ status: 'approved' })
    .where(eq(trades.id, tradeId));

  revalidatePath(`/experiences/${experienceId}/admin`);
}

export async function rejectTrade(formData: FormData) {
  const tradeId = formData.get('tradeId') as string;
  const experienceId = formData.get('experienceId') as string;

  await db
    .update(trades)
    .set({ status: 'rejected' })
    .where(eq(trades.id, tradeId));

  revalidatePath(`/experiences/${experienceId}/admin`);
}