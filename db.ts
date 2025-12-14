import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { InsertUser, users, contactMessages, InsertContactMessage, newsletterSubscriptions, InsertNewsletterSubscription, blogPosts, InsertBlogPost, blogTags, InsertBlogTag, blogPostTags } from "./schema.js";
import { ENV } from './_core/env.js';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

// Simple in-memory fallback store for tests or when no DB URL is provided
const useMemoryStore = !ENV.databaseUrl || ENV.nodeEnv === 'test';

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

const mem = {
  users: [] as Mutable<InsertUser & { id: number }>[],
  contactMessages: [] as (InsertContactMessage & { id: number; createdAt?: Date })[],
  newsletter: [] as (InsertNewsletterSubscription & { id: number; isActive: number })[],
  blogPosts: [] as (InsertBlogPost & { id: number; createdAt?: Date; updatedAt?: Date })[],
  blogPostTags: [] as { postId: number; tagId: number }[],
  blogTags: [] as (InsertBlogTag & { id: number })[],
};
let ids = { user: 1, contact: 1, newsletter: 1, post: 1, tag: 1 };

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (useMemoryStore) return null;
  if (!_db) {
    try {
      const url = ENV.databaseUrl;
      if (!url) return null;
      if (!_pool) {
        _pool = mysql.createPool(url);
      }
      _db = drizzle(_pool);
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
    // memory upsert
    const existing = mem.users.find(u => u.openId === user.openId);
    const now = new Date();
    if (existing) {
      existing.name = user.name ?? existing.name ?? null;
      existing.email = user.email ?? existing.email ?? null;
      existing.loginMethod = user.loginMethod ?? existing.loginMethod ?? null;
      existing.lastSignedIn = user.lastSignedIn ?? now;
      existing.role = user.role ?? existing.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user');
      return;
    }
    mem.users.push({
      id: ids.user++,
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role: user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user'),
      lastSignedIn: user.lastSignedIn ?? now,
    });
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    } as InsertUser;
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      (values as any)[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      (values as any).lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      (values as any).role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      (values as any).role = 'admin';
      updateSet.role = 'admin';
    }

    if (!(values as any).lastSignedIn) {
      (values as any).lastSignedIn = new Date();
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
    return mem.users.find(u => u.openId === openId);
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Contact message queries
export async function createContactMessage(data: InsertContactMessage) {
  const db = await getDb();
  if (!db) {
    mem.contactMessages.push({ ...data, id: ids.contact++, createdAt: new Date() });
    return { success: true } as any;
  }
  const result = await db.insert(contactMessages).values(data);
  return result;
}

export async function getContactMessages() {
  const db = await getDb();
  if (!db) {
    return mem.contactMessages.slice();
  }
  return await db.select().from(contactMessages);
}

// Newsletter subscription queries
export async function subscribeToNewsletter(email: string) {
  const db = await getDb();
  if (!db) {
    const existing = mem.newsletter.find(n => n.email === email);
    if (existing) {
      existing.isActive = 1;
      return { success: true } as any;
    }
    mem.newsletter.push({ id: ids.newsletter++, email, isActive: 1, subscribedAt: new Date() as any });
    return { success: true } as any;
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
    return mem.newsletter.filter(n => n.isActive === 1).slice();
  }
  return await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.isActive, 1));
}

export async function unsubscribeFromNewsletter(email: string) {
  const db = await getDb();
  if (!db) {
    const existing = mem.newsletter.find(n => n.email === email);
    if (existing) existing.isActive = 0;
    return { success: true } as any;
  }
  return await db.update(newsletterSubscriptions).set({ isActive: 0 }).where(eq(newsletterSubscriptions.email, email));
}

// Blog post queries
export async function createBlogPost(data: InsertBlogPost) {
  const db = await getDb();
  if (!db) {
    mem.blogPosts.push({ id: ids.post++, ...data, createdAt: new Date(), updatedAt: new Date() });
    return { success: true } as any;
  }
  const result = await db.insert(blogPosts).values(data);
  return result;
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) {
    const found = mem.blogPosts.find(p => (p as any).slug === slug);
    return found ?? null;
  }
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPublishedBlogPosts() {
  const db = await getDb();
  if (!db) {
    return mem.blogPosts.filter(p => (p as any).status === 'published').slice();
  }
  return await db.select().from(blogPosts).where(eq(blogPosts.status, "published")).orderBy(blogPosts.publishedAt);
}

export async function getAllBlogPosts() {
  const db = await getDb();
  if (!db) {
    return mem.blogPosts.slice();
  }
  return await db.select().from(blogPosts).orderBy(blogPosts.createdAt);
}

export async function updateBlogPost(id: number, data: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) {
    const post = mem.blogPosts.find(p => p.id === id);
    if (post) {
      Object.assign(post as any, data);
      (post as any).updatedAt = new Date();
    }
    return { success: true } as any;
  }
  return await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) {
    mem.blogPostTags = mem.blogPostTags.filter(t => t.postId !== id);
    mem.blogPosts = mem.blogPosts.filter(p => p.id !== id);
    return { success: true } as any;
  }
  // Delete associated tags first
  await db.delete(blogPostTags).where(eq(blogPostTags.postId, id));
  return await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

// Blog tag queries
export async function createBlogTag(data: InsertBlogTag) {
  const db = await getDb();
  if (!db) {
    const existing = mem.blogTags.find(t => t.slug === (data as any).slug);
    if (existing) return existing as any;
    const created = { id: ids.tag++, ...(data as any) };
    mem.blogTags.push(created);
    return created as any;
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
    return mem.blogTags.slice();
  }
  return await db.select().from(blogTags);
}
