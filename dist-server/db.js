import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users, contactMessages, newsletterSubscriptions, blogPosts, blogTags, blogPostTags } from "./schema.js";
import { ENV } from './_core/env.js';
let _db = null;
let _pool = null;
// Simple in-memory fallback store for tests or when no DB URL is provided
const useMemoryStore = !ENV.databaseUrl || ENV.nodeEnv === 'test';
const mem = {
    users: [],
    contactMessages: [],
    newsletter: [],
    blogPosts: [],
    blogPostTags: [],
    blogTags: [],
};
let ids = { user: 1, contact: 1, newsletter: 1, post: 1, tag: 1 };
// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
    if (useMemoryStore)
        return null;
    if (!_db) {
        try {
            const url = ENV.databaseUrl;
            if (!url)
                return null;
            if (!_pool) {
                _pool = mysql.createPool(url);
            }
            _db = drizzle(_pool);
        }
        catch (error) {
            console.warn("[Database] Failed to connect:", error);
            _db = null;
        }
    }
    return _db;
}
export async function upsertUser(user) {
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
        const values = {
            openId: user.openId,
        };
        const updateSet = {};
        const textFields = ["name", "email", "loginMethod"];
        const assignNullable = (field) => {
            const value = user[field];
            if (value === undefined)
                return;
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
        }
        else if (user.openId === ENV.ownerOpenId) {
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
    }
    catch (error) {
        console.error("[Database] Failed to upsert user:", error);
        throw error;
    }
}
export async function getUserByOpenId(openId) {
    const db = await getDb();
    if (!db) {
        return mem.users.find(u => u.openId === openId);
    }
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
}
// Contact message queries
export async function createContactMessage(data) {
    const db = await getDb();
    if (!db) {
        mem.contactMessages.push({ ...data, id: ids.contact++, createdAt: new Date() });
        return { success: true };
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
export async function subscribeToNewsletter(email) {
    const db = await getDb();
    if (!db) {
        const existing = mem.newsletter.find(n => n.email === email);
        if (existing) {
            existing.isActive = 1;
            return { success: true };
        }
        mem.newsletter.push({ id: ids.newsletter++, email, isActive: 1, subscribedAt: new Date() });
        return { success: true };
    }
    try {
        const result = await db.insert(newsletterSubscriptions).values({ email, isActive: 1 });
        return result;
    }
    catch (error) {
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
export async function unsubscribeFromNewsletter(email) {
    const db = await getDb();
    if (!db) {
        const existing = mem.newsletter.find(n => n.email === email);
        if (existing)
            existing.isActive = 0;
        return { success: true };
    }
    return await db.update(newsletterSubscriptions).set({ isActive: 0 }).where(eq(newsletterSubscriptions.email, email));
}
// Blog post queries
export async function createBlogPost(data) {
    const db = await getDb();
    if (!db) {
        mem.blogPosts.push({ id: ids.post++, ...data, createdAt: new Date(), updatedAt: new Date() });
        return { success: true };
    }
    const result = await db.insert(blogPosts).values(data);
    return result;
}
export async function getBlogPostBySlug(slug) {
    const db = await getDb();
    if (!db) {
        const found = mem.blogPosts.find(p => p.slug === slug);
        return found ?? null;
    }
    const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
    return result.length > 0 ? result[0] : null;
}
export async function getPublishedBlogPosts() {
    const db = await getDb();
    if (!db) {
        return mem.blogPosts.filter(p => p.status === 'published').slice();
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
export async function updateBlogPost(id, data) {
    const db = await getDb();
    if (!db) {
        const post = mem.blogPosts.find(p => p.id === id);
        if (post) {
            Object.assign(post, data);
            post.updatedAt = new Date();
        }
        return { success: true };
    }
    return await db.update(blogPosts).set(data).where(eq(blogPosts.id, id));
}
export async function deleteBlogPost(id) {
    const db = await getDb();
    if (!db) {
        mem.blogPostTags = mem.blogPostTags.filter(t => t.postId !== id);
        mem.blogPosts = mem.blogPosts.filter(p => p.id !== id);
        return { success: true };
    }
    // Delete associated tags first
    await db.delete(blogPostTags).where(eq(blogPostTags.postId, id));
    return await db.delete(blogPosts).where(eq(blogPosts.id, id));
}
// Blog tag queries
export async function createBlogTag(data) {
    const db = await getDb();
    if (!db) {
        const existing = mem.blogTags.find(t => t.slug === data.slug);
        if (existing)
            return existing;
        const created = { id: ids.tag++, ...data };
        mem.blogTags.push(created);
        return created;
    }
    try {
        const result = await db.insert(blogTags).values(data);
        return result;
    }
    catch (error) {
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
export async function addTagToPost(postId, tagId) {
    const db = await getDb();
    if (!db) {
        const exists = mem.blogPostTags.find((bt) => bt.postId === postId && bt.tagId === tagId);
        if (!exists)
            mem.blogPostTags.push({ postId, tagId });
        return { success: true };
    }
    // prevent duplicate
    const existing = await db
        .select()
        .from(blogPostTags)
        .where(eq(blogPostTags.postId, postId));
    if (!existing.find((e) => e.tagId === tagId)) {
        await db.insert(blogPostTags).values({ postId, tagId });
    }
    return { success: true };
}
export async function removeTagFromPost(postId, tagId) {
    const db = await getDb();
    if (!db) {
        mem.blogPostTags = mem.blogPostTags.filter((bt) => !(bt.postId === postId && bt.tagId === tagId));
        return { success: true };
    }
    await db.delete(blogPostTags).where(eq(blogPostTags.postId, postId) && eq(blogPostTags.tagId, tagId));
    return { success: true };
}
export async function getTagsForPost(postId) {
    const db = await getDb();
    if (!db) {
        const tagIds = mem.blogPostTags.filter((bt) => bt.postId === postId).map((bt) => bt.tagId);
        return mem.blogTags.filter((t) => tagIds.includes(t.id));
    }
    // naive join
    const all = await db.select().from(blogPostTags).where(eq(blogPostTags.postId, postId));
    const ids = all.map((r) => r.tagId);
    if (ids.length === 0)
        return [];
    const tagRows = await db.select().from(blogTags);
    return tagRows.filter((t) => ids.includes(t.id));
}
