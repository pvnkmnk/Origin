import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, contactMessages, InsertContactMessage, newsletterSubscriptions, InsertNewsletterSubscription, blogPosts, InsertBlogPost, blogTags, InsertBlogTag, blogPostTags } from "../drizzle/schema";
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

// Contact message queries
export async function createContactMessage(data: InsertContactMessage) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.insert(contactMessages).values(data);
  return result;
}

export async function getContactMessages() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return await db.select().from(contactMessages);
}

// Newsletter subscription queries
export async function subscribeToNewsletter(email: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const result = await db.insert(newsletterSubscriptions).values({ email, isActive: 1 });
    return result;
  } catch (error: any) {
    // Handle duplicate email
    if (error.code === "ER_DUP_ENTRY") {
      // Try to reactivate if it exists
      await db.update(newsletterSubscriptions).set({ isActive: 1 }).where(eq(newsletterSubscriptions.email, email));
      return { success: true };
    }
    throw error;
  }
}

export async function getNewsletterSubscriptions() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.isActive, 1));
}

export async function unsubscribeFromNewsletter(email: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.update(newsletterSubscriptions).set({ isActive: 0 }).where(eq(newsletterSubscriptions.email, email));
}

// Blog post queries
export async function createBlogPost(data: InsertBlogPost) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  const result = await db.insert(blogPosts).values(data);
  return result;
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPublishedBlogPosts() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return await db.select().from(blogPosts).where(eq(blogPosts.status, "published")).orderBy(blogPosts.publishedAt);
}

export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return await db.select().from(blogPosts).orderBy(blogPosts.createdAt);
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  return await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  // Delete associated tags first
  await db.delete(blogPostTags).where(eq(blogPostTags.postId, id));
  return await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

// Blog tag queries
export async function createBlogTag(data: InsertBlogTag) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  try {
    const result = await db.insert(blogTags).values(data);
    return result;
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      // Tag already exists, return it
      const existing = await db.select().from(blogTags).where(eq(blogTags.slug, data.slug)).limit(1);
      return existing[0];
    }
    throw error;
  }
}

export async function getAllBlogTags() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return await db.select().from(blogTags);
}
