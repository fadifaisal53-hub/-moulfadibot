import type { Context } from "hono";
import { z } from "zod";

export async function createTutorStream(c: Context) {
  return c.text("مرحباً! المعلم الذكي قيد التفعيل حالياً، لكن البوت يعمل!");
}
