import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Helper for timestamps
export const timestamps = {
  createdAt: timestamp('created_at').notNull().default(sql`now()`),
  updatedAt: timestamp('updated_at').notNull().default(sql`now()`),
};

// Trades table (your existing table)
export const trades = pgTable('trades', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id').notNull(),
  userId: text('user_id').notNull(),
  username: text('username'),
  
  // Trade details
  symbol: text('symbol').notNull(),
  positionType: text('position_type').notNull().default('long'),
  assetType: text('asset_type').notNull().default('stock'),
  leverage: text('leverage').notNull().default('1'),
  
  entryPrice: text('entry_price').notNull(),
  exitPrice: text('exit_price').notNull(),
  positionSize: text('position_size').notNull(),
  
  // Calculated fields
  pnl: text('pnl').notNull(),
  roi: text('roi').notNull(),
  
  status: text('status').notNull().default('pending'),
  screenshot: text('screenshot'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// App settings table - includes cancellation AND competition settings
export const appSettings = pgTable('app_settings', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id').notNull().unique(),
  
  // Cancellation settings
  minCancellationCharacters: integer('min_cancellation_characters').notNull().default(20),
  
  // Competition settings
  competitionEnabled: boolean('competition_enabled').notNull().default(true),
  competitionPeriod: text('competition_period').notNull().default('weekly'), // 'daily', 'weekly', 'monthly'
  competitionTitle: text('competition_title').default('Weekly Competition'),
  competitionPrize: text('competition_prize').default('Top trader gets bragging rights! 🏆'),
  
  ...timestamps,
});

// Cancellation feedback table (NEW - for cancellation feature)
export const cancellationFeedback = pgTable('cancellation_feedback', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id').notNull(),
  membershipId: text('membership_id').notNull(),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  feedback: text('feedback').notNull(),
  cancelledAt: timestamp('cancelled_at').notNull().default(sql`now()`),
  ...timestamps,
});