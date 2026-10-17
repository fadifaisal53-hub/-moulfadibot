import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import Redis from "ioredis";
import { nanoid } from "nanoid";
import { eq, and, desc, sql, lt, gte } from "drizzle-orm";
import * as schema from "./schema.js";

const client = postgres(process.env.DATABASE_URL!, { max: 20 });
export const db = drizzle(client, { schema });

export const redis = new Redis(
  process.env.REDIS_URL ?? "redis://localhost:6379",
);

export const repo = {
  async ensureUser(opts: {
    userId?: string;
    telegramId?: number;
    handle?: string;
  }) {
    const id = opts.userId ?? nanoid(16);
    const [existing] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    if (existing) return existing;

    const now = Date.now();
    const [created] = await db
      .insert(schema.users)
      .values({
        id,
        telegramId: opts.telegramId,
        handle: opts.handle ?? `user_${id.slice(0, 6)}`,
        lastActiveAt: now,
        createdAt: now,
      })
      .returning();
    return created!;
  },

  async getUserById(id: string) {
    const [u] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return u ?? null;
  },

  async updateUser(id: string, patch: any) {
    const [u] = await db
      .update(schema.users)
      .set(patch)
      .where(eq(schema.users.id, id))
      .returning();
    return u;
  },

  async recordRun(run: typeof schema.runs.$inferInsert) {
    await db.insert(schema.runs).values(run);
  },

  async countRuns(userId: string, lessonId: string) {
    const [r] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(schema.runs)
      .where(
        and(eq(schema.runs.userId, userId), eq(schema.runs.lessonId, lessonId)),
      );
    return r?.c ?? 0;
  },

  async getBkt(userId: string, conceptId: string) {
    const [row] = await db
      .select()
      .from(schema.bktState)
      .where(
        and(
          eq(schema.bktState.userId, userId),
          eq(schema.bktState.conceptId, conceptId),
        ),
      );
    return row
      ? {
          pKnow: row.pKnow,
          pLearn: row.pLearn,
          pGuess: row.pGuess,
          pSlip: row.pSlip,
        }
      : { pKnow: 0.1, pLearn: 0.3, pGuess: 0.2, pSlip: 0.1 };
  },

  async upsertBkt(userId: string, conceptId: string, s: any) {
    await db
      .insert(schema.bktState)
      .values({ userId, conceptId, ...s, updatedAt: Date.now() })
      .onConflictDoUpdate({
        target: [schema.bktState.userId, schema.bktState.conceptId],
        set: { ...s, updatedAt: Date.now() },
      });
  },

  async dueCards(userId: string, limit = 20) {
    return db
      .select()
      .from(schema.cards)
      .where(
        and(eq(schema.cards.userId, userId), lt(schema.cards.due, Date.now())),
      )
      .orderBy(schema.cards.due)
      .limit(limit);
  },

  async recordQuiz(q: typeof schema.quizzes.$inferInsert) {
    await db.insert(schema.quizzes).values(q);
  },

  async addXp(userId: string, type: string, amount: number, meta?: unknown) {
    await db.transaction(async (tx) => {
      await tx.insert(schema.xpEvents).values({
        id: nanoid(16),
        userId,
        type,
        amount,
        meta,
        createdAt: Date.now(),
      });
      await tx
        .update(schema.users)
        .set({ xp: sql`${schema.users.xp} + ${amount}` })
        .where(eq(schema.users.id, userId));
    });
  },

  async awardBadge(userId: string, badgeId: string) {
    try {
      await db
        .insert(schema.badges)
        .values({ userId, badgeId, awardedAt: Date.now() });
      return true;
    } catch {
      return false;
    }
  },

  async getUserBadges(userId: string) {
    return db
      .select()
      .from(schema.badges)
      .where(eq(schema.badges.userId, userId));
  },

  async leaderboard(scope: string, limit = 20) {
    if (scope === "weekly") {
      const weekAgo = Date.now() - 7 * 86400000;
      return db
        .select({
          userId: schema.users.id,
          handle: schema.users.handle,
          xp: sql<number>`coalesce(sum(${schema.xpEvents.amount}), 0)::int`,
        })
        .from(schema.users)
        .leftJoin(
          schema.xpEvents,
          and(
            eq(schema.xpEvents.userId, schema.users.id),
            gte(schema.xpEvents.createdAt, weekAgo),
          ),
        )
        .groupBy(schema.users.id, schema.users.handle)
        .orderBy(desc(sql`sum(${schema.xpEvents.amount})`))
        .limit(limit);
    }
    return db
      .select({
        userId: schema.users.id,
        handle: schema.users.handle,
        xp: schema.users.xp,
        level: schema.users.level,
      })
      .from(schema.users)
      .orderBy(desc(schema.users.xp))
      .limit(limit);
  },

  async getActiveLab(userId: string) {
    const [s] = await db
      .select()
      .from(schema.labSessions)
      .where(
        and(
          eq(schema.labSessions.userId, userId),
          eq(schema.labSessions.status, "running"),
          gte(schema.labSessions.expiresAt, Date.now()),
        ),
      )
      .limit(1);
    return s ?? null;
  },

  async solveLab(sessionId: string) {
    await db
      .update(schema.labSessions)
      .set({ status: "solved", solvedAt: Date.now() })
      .where(eq(schema.labSessions.id, sessionId));
  },
};

export { schema };
