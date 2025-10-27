import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

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