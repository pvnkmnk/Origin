import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { ENV } from "./_core/env";

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

function createNonAdminContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "non-admin-user",
      name: "Regular User",
      email: "user@example.com",
      loginMethod: "oauth",
      role: "user",
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

describe("admin procedures", () => {
  it("should allow admin to fetch contact messages", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getContactMessages();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny non-admin access to contact messages", async () => {
    const ctx = createNonAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.getContactMessages();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should allow admin to fetch newsletter subscribers", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.getNewsletterSubscribers();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny non-admin access to newsletter subscribers", async () => {
    const ctx = createNonAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.getNewsletterSubscribers();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });

  it("should allow admin to unsubscribe email", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.admin.unsubscribeEmail({
      email: `test-${Date.now()}@example.com`,
    });

    expect(result.success).toBe(true);
  });

  it("should deny non-admin access to unsubscribe", async () => {
    const ctx = createNonAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.unsubscribeEmail({
        email: "test@example.com",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Unauthorized");
    }
  });
});
