import { pgTable, text, integer, numeric, timestamp } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const timestamps = {
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`),
};

export const trades = pgTable('trades', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id').notNull(),
  userId: text('user_id').notNull(),
  symbol: text('symbol').notNull(),
  entryPrice: numeric('entry_price').notNull(),
  exitPrice: numeric('exit_price').notNull(),
  positionSize: numeric('position_size').notNull(),
  pnl: numeric('pnl').notNull(),
  roi: numeric('roi').notNull(),
  screenshot: text('screenshot'),
  status: text('status').notNull().default('pending'),
  ...timestamps,
});

export const members = pgTable('members', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id').notNull(),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  totalPnl: numeric('total_pnl').notNull().default('0'),
  totalTrades: integer('total_trades').notNull().default(0),
  winningTrades: integer('winning_trades').notNull().default(0),
  ...timestamps,
});