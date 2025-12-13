import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { ENV } from "./_core/env";
import { getDb } from "./db";
import { eq } from "drizzle-orm";
import { blogPosts } from "../drizzle/schema";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: ENV.ownerOpenId,
      name: "Admin User",
      email: "admin@example.com",
      loginMethod: "oauth",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Blog Management", () => {
  let testPostId: number;
  const testSlug = `test-post-${Date.now()}`;

  beforeAll(async () => {
    const db = await getDb();
    if (db) {
      await db.delete(blogPosts).where(eq(blogPosts.slug, testSlug));
    }
  });

  afterAll(async () => {
    const db = await getDb();
    if (db) {
      await db.delete(blogPosts).where(eq(blogPosts.slug, testSlug));
    }
  });

  it("should create a blog post as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.createBlogPost({
      title: "Test Blog Post",
      slug: testSlug,
      content: "# Test Content\n\nThis is a test blog post.",
      excerpt: "A test blog post",
      status: "draft",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("created successfully");
  });

  it("should retrieve all blog posts as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const posts = await caller.admin.getAllBlogPosts();
    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeGreaterThan(0);

    const testPost = posts.find((p) => p.slug === testSlug);
    if (testPost) {
      testPostId = testPost.id;
    }
  });

  it("should update a blog post as admin", async () => {
    if (!testPostId) {
      const db = await getDb();
      if (db) {
        const result = await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.slug, testSlug))
          .limit(1);
        if (result.length > 0) {
          testPostId = result[0].id;
        }
      }
    }

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.updateBlogPost({
      id: testPostId,
      title: "Updated Test Blog Post",
      slug: testSlug,
      content: "# Updated Content\n\nThis is an updated test blog post.",
      excerpt: "An updated test blog post",
      status: "published",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("updated successfully");
  });

  it("should get published blog posts publicly", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const posts = await caller.blog.getPublishedPosts();
    expect(Array.isArray(posts)).toBe(true);
  });

  it("should get a blog post by slug publicly", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const post = await caller.blog.getPostBySlug({ slug: testSlug });
    if (post) {
      expect(post.slug).toBe(testSlug);
      expect(post.title).toContain("Test");
    }
  });

  it("should deny blog creation to unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.createBlogPost({
        title: "Unauthorized Post",
        slug: "unauthorized-post",
        content: "This should fail",
        status: "draft",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toMatch(/Unauthorized|Please login/);
    }
  });

  it("should delete a blog post as admin", async () => {
    if (!testPostId) {
      const db = await getDb();
      if (db) {
        const result = await db
          .select()
          .from(blogPosts)
          .where(eq(blogPosts.slug, testSlug))
          .limit(1);
        if (result.length > 0) {
          testPostId = result[0].id;
        }
      }
    }

    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.deleteBlogPost({ id: testPostId });
    expect(result.success).toBe(true);
    expect(result.message).toContain("deleted successfully");
  });
});
