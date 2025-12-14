import type { FastifyRequest } from "fastify";

export function getSessionCookieOptions(_req: FastifyRequest) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: false,
    path: "/",
  };
}
