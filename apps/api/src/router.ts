import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { lessons, bktUpdate } from "@moulinex/core";
import { repo } from "@moulinex/persistence";
import { awardXp, touchStreak } from "@moulinex/gamification";
import { shouldTriggerQuiz, selectQuestions } from "@moulinex/assessment";
import { QUIZ_BANK } from "./quiz-bank.js";
import { env } from "./env.js";

const t = initTRPC
  .context<{ userId: string }>()
  .create({ transformer: superjson });

const RunInput = z.object({
  language: z.enum(["javascript", "python"]),
  code: z.string().min(1).max(20000),
  lessonId: z.string().default("variables"),
});

export const appRouter = t.router({
  health: t.procedure.query(() => ({
    ok: true,
    time: new Date().toISOString(),
  })),

  me: t.procedure.query(async ({ ctx }) => repo.getUserById(ctx.userId)),

  curriculum: t.router({
    list: t.procedure.query(() =>
      lessons.map(({ id, title, summary, language }) => ({
        id,
        title,
        summary,
        language,
      })),
    ),
    get: t.procedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        const l = lessons.find((x) => x.id === input.id);
        if (!l)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "الدرس غير موجود",
          });
        return l;
      }),
  }),

  execution: t.router({
    run: t.procedure.input(RunInput).mutation(async ({ input, ctx }) => {
      if (!env.E2B_API_KEY) {
        const stdout = `[SIMULATION] ${input.language}:\n${input.code}`;
        return {
          stdout,
          stderr: "",
          error: null,
          meta: {
            totalRuns: 0,
            pKnow: 0.5,
            quiz: null,
            streak: { streak: 0 },
          },
        };
      }

      const t0 = Date.now();
      const { Sandbox } = await import("@e2b/code-interpreter");
      const sbx = await Sandbox.create({ timeoutMs: 60000 });

      try {
        const r = await sbx.runCode(input.code, {
          language: input.language === "python" ? "python" : "js",
          timeoutMs: 15000,
        });

        await repo.recordRun({
          id: crypto.randomUUID(),
          userId: ctx.userId,
          lessonId: input.lessonId,
          language: input.language,
          code: input.code,
          stdout: r.logs.stdout.join(""),
          stderr: r.logs.stderr.join(""),
          status: r.error ? "error" : "ok",
          durationMs: Date.now() - t0,
          createdAt: Date.now(),
        });

        const totalRuns = await repo.countRuns(ctx.userId, input.lessonId);
        const prev = await repo.getBkt(ctx.userId, input.lessonId);
        const next = bktUpdate(prev, !r.error);
        await repo.upsertBkt(ctx.userId, input.lessonId, next);

        const streak = await touchStreak(ctx.userId);
        if (!r.error && totalRuns > 0) {
          await awardXp(ctx.userId, "lesson_complete", 0.2);
        }

        let quiz = null;
        if (shouldTriggerQuiz(totalRuns, 0)) {
          const pool = QUIZ_BANK[input.lessonId] ?? [];
          if (pool.length) {
            quiz = {
              id: crypto.randomUUID(),
              lessonId: input.lessonId,
              questions: selectQuestions(
                pool,
                next.pKnow,
                Math.min(5, pool.length),
              ),
            };
          }
        }

        return {
          stdout: r.logs.stdout.join(""),
          stderr: r.logs.stderr.join(""),
          error: r.error ? `${r.error.name}: ${r.error.value}` : null,
          meta: { totalRuns, pKnow: next.pKnow, quiz, streak },
        };
      } finally {
        await sbx.kill();
      }
    }),
  }),

  profile: t.router({
    get: t.procedure.query(async ({ ctx }) => {
      const user = await repo.getUserById(ctx.userId);
      const badges = await repo.getUserBadges(ctx.userId);
      const due = await repo.dueCards(ctx.userId);
      return { user, badges, dueCount: due.length };
    }),
  }),
});

export type AppRouter = typeof appRouter;
