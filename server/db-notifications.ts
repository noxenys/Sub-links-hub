import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  notifications,
  stripeProducts,
  stripeSubscriptions,
  stripeTransactions,
  type Notification,
  type InsertNotification,
  type StripeProduct,
  type InsertStripeProduct,
  type StripeSubscription,
  type InsertStripeSubscription,
  type StripeTransaction,
  type InsertStripeTransaction,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ Notification Functions ============

export async function createNotification(data: InsertNotification): Promise<Notification | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(notifications).values(data);
    const id = result[0].insertId as number;
    const created = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create notification:", error);
    throw error;
  }
}

export async function getNotifications(userId?: string, limit = 20): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    if (userId) {
      return await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
    }
    
    return await db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get notifications:", error);
    return [];
  }
}

export async function getUnreadNotifications(userId: string): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, 0)
      ))
      .orderBy(desc(notifications.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get unread notifications:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("[Database] Failed to mark notification as read:", error);
    throw error;
  }
}

export async function deleteNotification(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));
  } catch (error) {
    console.error("[Database] Failed to delete notification:", error);
    throw error;
  }
}

// ============ Stripe Product Functions ============

export async function createStripeProduct(data: InsertStripeProduct): Promise<StripeProduct | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(stripeProducts).values(data);
    const id = result[0].insertId as number;
    const created = await db.select().from(stripeProducts).where(eq(stripeProducts.id, id)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create stripe product:", error);
    throw error;
  }
}

export async function getStripeProducts(active = true): Promise<StripeProduct[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    if (active) {
      return await db
        .select()
        .from(stripeProducts)
        .where(eq(stripeProducts.isActive, 1))
        .orderBy(stripeProducts.createdAt);
    }
    return await db
      .select()
      .from(stripeProducts)
      .orderBy(stripeProducts.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get stripe products:", error);
    return [];
  }
}

export async function getStripeProductByStripeId(stripeProductId: string): Promise<StripeProduct | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(stripeProducts).where(eq(stripeProducts.stripeProductId, stripeProductId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get stripe product:", error);
    return undefined;
  }
}

// ============ Stripe Subscription Functions ============

export async function createStripeSubscription(data: InsertStripeSubscription): Promise<StripeSubscription | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(stripeSubscriptions).values(data);
    const id = result[0].insertId as number;
    const created = await db.select().from(stripeSubscriptions).where(eq(stripeSubscriptions.id, id)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create stripe subscription:", error);
    throw error;
  }
}

export async function getUserSubscriptions(userId: string): Promise<StripeSubscription[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(stripeSubscriptions)
      .where(eq(stripeSubscriptions.userId, userId))
      .orderBy(desc(stripeSubscriptions.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get user subscriptions:", error);
    return [];
  }
}

export async function updateStripeSubscription(
  stripeSubscriptionId: string,
  data: Partial<StripeSubscription>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(stripeSubscriptions)
      .set(data)
      .where(eq(stripeSubscriptions.stripeSubscriptionId, stripeSubscriptionId));
  } catch (error) {
    console.error("[Database] Failed to update stripe subscription:", error);
    throw error;
  }
}

// ============ Stripe Transaction Functions ============

export async function createStripeTransaction(data: InsertStripeTransaction): Promise<StripeTransaction | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(stripeTransactions).values(data);
    const id = result[0].insertId as number;
    const created = await db.select().from(stripeTransactions).where(eq(stripeTransactions.id, id)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create stripe transaction:", error);
    throw error;
  }
}

export async function getUserTransactions(userId: string): Promise<StripeTransaction[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(stripeTransactions)
      .where(eq(stripeTransactions.userId, userId))
      .orderBy(desc(stripeTransactions.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get user transactions:", error);
    return [];
  }
}

export async function updateStripeTransaction(
  stripePaymentIntentId: string,
  data: Partial<StripeTransaction>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    await db
      .update(stripeTransactions)
      .set(data)
      .where(eq(stripeTransactions.stripePaymentIntentId, stripePaymentIntentId));
  } catch (error) {
    console.error("[Database] Failed to update stripe transaction:", error);
    throw error;
  }
}
