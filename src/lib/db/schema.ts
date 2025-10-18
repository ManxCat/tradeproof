import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const timestamps = {
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
};

export const trades = sqliteTable('trades', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id').notNull(),
  userId: text('user_id').notNull(),
  symbol: text('symbol').notNull(),
  entryPrice: real('entry_price').notNull(),
  exitPrice: real('exit_price').notNull(),
  positionSize: real('position_size').notNull(),
  pnl: real('pnl').notNull(),
  roi: real('roi').notNull(),
  screenshot: text('screenshot'),
  status: text('status').notNull().default('pending'),
  ...timestamps,
});

export const members = sqliteTable('members', {
  id: text('id').primaryKey(),
  experienceId: text('experience_id').notNull(),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  totalPnl: real('total_pnl').notNull().default(0),
  totalTrades: integer('total_trades').notNull().default(0),
  winningTrades: integer('winning_trades').notNull().default(0),
  ...timestamps,
});