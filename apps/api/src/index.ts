import { serve } from "@hono/node-server";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";
import { logger } from "hono/logger";

import { appRouter } from "./router.js";
import { internalRouter } from "./internal.js";
import { createTutorStream } from "./tutor.js";
import { buildContext } from "./context.js";
import { env } from "./env.js";

const app = new Hono();

app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: env.CORS_ORIGINS.split(","),
    allowMethods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  }),
);
app.use(
  "*",
  rateLimiter({
    windowMs: 60000,
    limit: 120,
    keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "local",
  }),
);

app.get("/health", (c) =>
  c.json({ ok: true, version: "2.0.0", time: new Date().toISOString() }),
);

app.use("/trpc/*", async (c, next) => {
  const ctx = await buildContext(c);
  return trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext: () => ctx,
  })(c, next);
});

app.use("/internal/*", async (c, next) => {
  const key = c.req.header("x-internal-key");
  if (key !== env.INTERNAL_API_KEY)
    return c.json({ error: "unauthorized" }, 401);
  await next();
});
app.route("/internal", internalRouter);

app.post("/api/tutor", createTutorStream);

serve({ fetch: app.fetch, port: env.PORT }, (i) => {
  console.log(`✨ Moulinex API v2 → http://localhost:${i.port}`);
});
