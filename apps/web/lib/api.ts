import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "@moulinex/api/src/router";

export const API =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const api = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API}/trpc`,
      transformer: superjson,
    }),
  ],
});
