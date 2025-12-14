import { initTRPC, TRPCError } from "@trpc/server";
import type { TrpcContext } from "./context.js";

const t = initTRPC.context<TrpcContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Please login" });
  }
  return next();
});
