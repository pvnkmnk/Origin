import Fastify from "fastify";
import cors from "@fastify/cors";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter } from "../routers.js";
import { createContext } from "../_core/context.js";

async function main() {
  const app = Fastify({ logger: true });
  await app.register(cors, { origin: true, credentials: true });

  await app.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext: ({ req, res }: { req: any; res: any }) => createContext({ req, res }),
    },
  });

  app.get("/api/health", async () => ({ ok: true }));

  const port = Number(process.env.PORT || 8787);
  const host = process.env.HOST || "0.0.0.0";
  await app.listen({ port, host });
  app.log.info(`[server] running on http://${host}:${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
