import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { createContactMessage, subscribeToNewsletter, getContactMessages, getNewsletterSubscriptions, unsubscribeFromNewsletter, createBlogPost, getAllBlogPosts, getBlogPostBySlug, updateBlogPost, deleteBlogPost, getPublishedBlogPosts, createBlogTag, getAllBlogTags } from "./db";
import { ENV } from "./_core/env";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  contact: router({
    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        message: z.string().min(1, "Message is required"),
      }))
      .mutation(async ({ input }) => {
        try {
          await createContactMessage({
            name: input.name,
            email: input.email,
            message: input.message,
          });
          return { success: true, message: "Message sent successfully" };
        } catch (error) {
          console.error("Contact form error:", error);
          throw new Error("Failed to submit contact form");
        }
      }),
  }),

  newsletter: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email("Invalid email"),
      }))
      .mutation(async ({ input }) => {
        try {
          await subscribeToNewsletter(input.email);
          return { success: true, message: "Successfully subscribed to newsletter" };
        } catch (error: any) {
          console.error("Newsletter subscription error:", error);
          const isDuplicate = error.code === "ER_DUP_ENTRY" || error.cause?.code === "ER_DUP_ENTRY";
          if (isDuplicate) {
            return { success: true, message: "Email already subscribed" };
          }
          throw new Error("Failed to subscribe to newsletter");
        }
      }),
  }),

  admin: router({
    getContactMessages: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.openId !== ENV.ownerOpenId) {
        throw new Error("Unauthorized: Admin access only");
      }
      return await getContactMessages();
    }),

    getNewsletterSubscribers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.openId !== ENV.ownerOpenId) {
        throw new Error("Unauthorized: Admin access only");
      }
      return await getNewsletterSubscriptions();
    }),

    unsubscribeEmail: protectedProcedure
      .input(z.object({ email: z.string().email("Invalid email") }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.openId !== ENV.ownerOpenId) {
          throw new Error("Unauthorized: Admin access only");
        }
        await unsubscribeFromNewsletter(input.email);
        return { success: true, message: "Email unsubscribed successfully" };
      }),

    getAllBlogPosts: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.openId !== ENV.ownerOpenId) {
        throw new Error("Unauthorized: Admin access only");
      }
      return await getAllBlogPosts();
    }),

    createBlogPost: protectedProcedure
      .input(z.object({
        title: z.string().min(1, "Title is required"),
        slug: z.string().min(1, "Slug is required"),
        content: z.string().min(1, "Content is required"),
        excerpt: z.string().optional(),
        status: z.enum(["draft", "published"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.openId !== ENV.ownerOpenId) {
          throw new Error("Unauthorized: Admin access only");
        }
        try {
          const publishedAt = input.status === "published" ? new Date() : null;
          await createBlogPost({
            title: input.title,
            slug: input.slug,
            content: input.content,
            excerpt: input.excerpt,
            status: input.status,
            publishedAt,
          });
          return { success: true, message: "Blog post created successfully" };
        } catch (error) {
          console.error("Blog post creation error:", error);
          throw new Error("Failed to create blog post");
        }
      }),

    updateBlogPost: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1, "Title is required"),
        slug: z.string().min(1, "Slug is required"),
        content: z.string().min(1, "Content is required"),
        excerpt: z.string().optional(),
        status: z.enum(["draft", "published"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.openId !== ENV.ownerOpenId) {
          throw new Error("Unauthorized: Admin access only");
        }
        try {
          const publishedAt = input.status === "published" ? new Date() : null;
          await updateBlogPost(input.id, {
            title: input.title,
            slug: input.slug,
            content: input.content,
            excerpt: input.excerpt,
            status: input.status,
            publishedAt,
          });
          return { success: true, message: "Blog post updated successfully" };
        } catch (error) {
          console.error("Blog post update error:", error);
          throw new Error("Failed to update blog post");
        }
      }),

    deleteBlogPost: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.openId !== ENV.ownerOpenId) {
          throw new Error("Unauthorized: Admin access only");
        }
        try {
          await deleteBlogPost(input.id);
          return { success: true, message: "Blog post deleted successfully" };
        } catch (error) {
          console.error("Blog post deletion error:", error);
          throw new Error("Failed to delete blog post");
        }
      }),
  }),

  blog: router({
    getPublishedPosts: publicProcedure.query(async () => {
      return await getPublishedBlogPosts();
    }),

    getPostBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await getBlogPostBySlug(input.slug);
      }),

    getAllTags: publicProcedure.query(async () => {
      return await getAllBlogTags();
    }),
  }),
});

export type AppRouter = typeof appRouter;
