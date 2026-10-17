import { z } from "zod";

export const env = z
  .object({
    PORT: z.coerce.number().default(3001),
    CORS_ORIGINS: z.string().default("http://localhost:3000"),
    DATABASE_URL: z
      .string()
      .default("postgresql://moulinex:moulinex@localhost:5432/moulinex"),
    REDIS_URL: z.string().default("redis://localhost:6379"),
    INTERNAL_API_KEY: z.string().default("dev-internal-key"),
    SESSION_SECRET: z.string().default("dev-secret-change-me"),
    SELF_URL: z.string().default("http://localhost:3001"),
    E2B_API_KEY: z.string().optional(),
  })
  .parse(process.env);
