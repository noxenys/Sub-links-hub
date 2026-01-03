import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Subscription categories table
 * Stores the different categories of subscription links (GitHub, Telegram, Forums, etc.)
 */
export const subscriptionCategories = mysqlTable('subscription_categories', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 64 }).notNull(),
  icon: varchar('icon', { length: 32 }).notNull(),
  description: text('description'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionCategory = typeof subscriptionCategories.$inferSelect;
export type InsertSubscriptionCategory = typeof subscriptionCategories.$inferInsert;

/**
 * Subscription links table
 * Stores the actual subscription links with metadata
 */
export const subscriptionLinks = mysqlTable('subscription_links', {
  id: int('id').autoincrement().primaryKey(),
  categoryId: int('categoryId').notNull().references(() => subscriptionCategories.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  url: text('url').notNull(),
  protocol: varchar('protocol', { length: 64 }).notNull(), // e.g., 'Clash', 'VLESS', 'VMess', 'Mixed'
  stability: mysqlEnum('stability', ['high', 'medium', 'low']).default('medium').notNull(),
  tags: varchar('tags', { length: 500 }).notNull(), // JSON stringified array
  lastUpdated: timestamp('lastUpdated').defaultNow().notNull(),
  isActive: int('isActive').default(1).notNull(), // 1 for active, 0 for inactive
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionLink = typeof subscriptionLinks.$inferSelect;
export type InsertSubscriptionLink = typeof subscriptionLinks.$inferInsert;