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

/**
 * Notifications table
 * Stores system and user notifications
 */
export const notifications = mysqlTable('notifications', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('userId', { length: 255 }),
  type: mysqlEnum('type', ['info', 'success', 'warning', 'error', 'system']).default('info').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  actionUrl: varchar('actionUrl', { length: 500 }),
  isRead: int('isRead').default(0).notNull(),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Stripe Products table
 * Stores product information synced from Stripe
 */
export const stripeProducts = mysqlTable('stripe_products', {
  id: int('id').autoincrement().primaryKey(),
  stripeProductId: varchar('stripeProductId', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  type: mysqlEnum('type', ['one-time', 'subscription']).default('one-time').notNull(),
  stripePriceId: varchar('stripePriceId', { length: 255 }).notNull(),
  amount: int('amount').notNull(), // in cents
  currency: varchar('currency', { length: 3 }).default('usd').notNull(),
  interval: mysqlEnum('interval', ['day', 'week', 'month', 'year']),
  isActive: int('isActive').default(1).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type StripeProduct = typeof stripeProducts.$inferSelect;
export type InsertStripeProduct = typeof stripeProducts.$inferInsert;

/**
 * Stripe Subscriptions table
 * Tracks user subscriptions
 */
export const stripeSubscriptions = mysqlTable('stripe_subscriptions', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull(),
  stripeSubscriptionId: varchar('stripeSubscriptionId', { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar('stripeCustomerId', { length: 255 }).notNull(),
  productId: int('productId').notNull().references(() => stripeProducts.id),
  status: mysqlEnum('status', ['active', 'past_due', 'canceled', 'unpaid']).default('active').notNull(),
  currentPeriodStart: timestamp('currentPeriodStart'),
  currentPeriodEnd: timestamp('currentPeriodEnd'),
  canceledAt: timestamp('canceledAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type StripeSubscription = typeof stripeSubscriptions.$inferSelect;
export type InsertStripeSubscription = typeof stripeSubscriptions.$inferInsert;

/**
 * Stripe Transactions table
 * Tracks one-time payments and transactions
 */
export const stripeTransactions = mysqlTable('stripe_transactions', {
  id: int('id').autoincrement().primaryKey(),
  userId: varchar('userId', { length: 255 }).notNull(),
  stripePaymentIntentId: varchar('stripePaymentIntentId', { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar('stripeCustomerId', { length: 255 }).notNull(),
  productId: int('productId').notNull().references(() => stripeProducts.id),
  amount: int('amount').notNull(), // in cents
  currency: varchar('currency', { length: 3 }).default('usd').notNull(),
  status: mysqlEnum('status', ['succeeded', 'processing', 'requires_payment_method', 'failed']).default('processing').notNull(),
  receiptUrl: varchar('receiptUrl', { length: 500 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type StripeTransaction = typeof stripeTransactions.$inferSelect;
export type InsertStripeTransaction = typeof stripeTransactions.$inferInsert;