import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, subscriptionLinks, subscriptionCategories, InsertSubscriptionLink, SubscriptionLink, SubscriptionCategory, InsertSubscriptionCategory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Subscription Categories ============

export async function getAllCategories() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get categories: database not available");
    return [];
  }

  try {
    return await db.select().from(subscriptionCategories);
  } catch (error) {
    console.error("[Database] Failed to get categories:", error);
    return [];
  }
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(subscriptionCategories).where(eq(subscriptionCategories.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get category:", error);
    return undefined;
  }
}

export async function createCategory(data: InsertSubscriptionCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(subscriptionCategories).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create category:", error);
    throw error;
  }
}

// ============ Subscription Links ============

export async function getAllLinks() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get links: database not available");
    return [];
  }

  try {
    return await db.select().from(subscriptionLinks).where(eq(subscriptionLinks.isActive, 1));
  } catch (error) {
    console.error("[Database] Failed to get links:", error);
    return [];
  }
}

export async function getLinksByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { and } = await import('drizzle-orm');
    return await db.select().from(subscriptionLinks).where(
      and(
        eq(subscriptionLinks.categoryId, categoryId),
        eq(subscriptionLinks.isActive, 1)
      )
    );
  } catch (error) {
    console.error("[Database] Failed to get links by category:", error);
    return [];
  }
}

export async function getLinkById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  try {
    const result = await db.select().from(subscriptionLinks).where(eq(subscriptionLinks.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to get link:", error);
    return undefined;
  }
}

export async function createLink(data: InsertSubscriptionLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.insert(subscriptionLinks).values(data);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create link:", error);
    throw error;
  }
}

export async function updateLink(id: number, data: Partial<InsertSubscriptionLink>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    const result = await db.update(subscriptionLinks).set(data).where(eq(subscriptionLinks.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update link:", error);
    throw error;
  }
}

export async function deleteLink(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  try {
    // Soft delete: mark as inactive
    const result = await db.update(subscriptionLinks).set({ isActive: 0 }).where(eq(subscriptionLinks.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete link:", error);
    throw error;
  }
}
