import type { FastifyRequest, FastifyReply } from "fastify";

export type TrpcContext = {
  req: FastifyRequest;
  res: FastifyReply;
  user: {
    id?: number;
    openId: string;
    name?: string | null;
    email?: string | null;
    loginMethod?: string | null;
    role?: "user" | "admin";
    createdAt?: Date;
    updatedAt?: Date;
    lastSignedIn?: Date;
  } | null;
};

export async function createContext(opts: { req: FastifyRequest; res: FastifyReply }): Promise<TrpcContext> {
  const openIdHeader = (opts.req.headers["x-openid"] || opts.req.headers["x-open-id"]) as string | undefined;
  const user = openIdHeader
    ? {
        openId: openIdHeader,
        role: "user" as const,
      }
    : null;
  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
