import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

describe("contact.submit", () => {
  it("should accept valid contact form data", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "Test User",
      email: "test@example.com",
      message: "This is a test message",
    });

    expect(result).toEqual({
      success: true,
      message: "Message sent successfully",
    });
  });

  it("should reject empty name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.contact.submit({
        name: "",
        email: "test@example.com",
        message: "Test message",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Name is required");
    }
  });

  it("should reject invalid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.contact.submit({
        name: "Test User",
        email: "invalid-email",
        message: "Test message",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid email");
    }
  });

  it("should reject empty message", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.contact.submit({
        name: "Test User",
        email: "test@example.com",
        message: "",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Message is required");
    }
  });
});

describe("newsletter.subscribe", () => {
  it("should accept valid email for newsletter subscription", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.newsletter.subscribe({
      email: `subscriber-${Date.now()}@example.com`,
    });

    expect(result).toEqual({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  });

  it("should reject invalid email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.newsletter.subscribe({
        email: "invalid-email",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Invalid email");
    }
  });

  it("should handle duplicate email gracefully", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const uniqueEmail = `duplicate-${Date.now()}@example.com`;

    const result1 = await caller.newsletter.subscribe({
      email: uniqueEmail,
    });
    expect(result1.success).toBe(true);

    const result2 = await caller.newsletter.subscribe({
      email: uniqueEmail,
    });
    expect(result2.success).toBe(true);
  });
});
