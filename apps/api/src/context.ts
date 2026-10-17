import { createHash } from "node:crypto";
import type { Context as HonoContext } from "hono";
import { env } from "./env.js";

export function anonIdFromIp(ip: string) {
  return createHash("sha256")
    .update(env.SESSION_SECRET + ip)
    .digest("hex")
    .slice(0, 24);
}

export async function buildContext(c: HonoContext) {
  const ip = c.req.header("x-forwarded-for") ?? "local";
  const bearer = c.req.header("authorization")?.replace("Bearer ", "");
  const userId = bearer || anonIdFromIp(ip);
  return { userId, anon: !bearer };
}
