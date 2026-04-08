import { pgTable, serial, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  content: text('content').notNull(),
  telegramMessageId: text('telegram_message_id').unique(),
  channelId: text('channel_id').notNull(),
  status: text('status').notNull().default('pending'),
  attempts: integer('attempts').default(0).notNull(),
  sentAt: timestamp('sent_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messageLogs = pgTable('message_logs', {
  id: serial('id').primaryKey(),
  messageId: integer('message_id').notNull().references(() => messages.id),
  level: text('level').notNull(),
  message: text('message').notNull(),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const systemStatus = pgTable('system_status', {
  id: serial('id').primaryKey(),
  serviceName: text('service_name').notNull().unique(),
  status: text('status').notNull(),
  lastCheck: timestamp('last_check').defaultNow().notNull(),
  errorMessage: text('error_message'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type MessageLog = typeof messageLogs.$inferSelect;
export type NewMessageLog = typeof messageLogs.$inferInsert;
export type SystemStatus = typeof systemStatus.$inferSelect;
export type NewSystemStatus = typeof systemStatus.$inferInsert;
