import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  jsonb,
  primaryKey,
  index,
  bigint,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    telegramId: bigint("telegram_id", { mode: "number" }).unique(),
    email: text("email").unique(),
    handle: text("handle").notNull(),
    avatar: text("avatar"),
    locale: text("locale").notNull().default("ar"),
    xp: integer("xp").notNull().default(0),
    level: integer("level").notNull().default(1),
    streak: integer("streak").notNull().default(0),
    lastActiveAt: bigint("last_active_at", { mode: "number" }).notNull(),
    onboarded: boolean("onboarded").notNull().default(false),
    prefs: jsonb("prefs")
      .notNull()
      .default({ sound: true, motion: "full", theme: "auto", language: "ar" }),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
  },
  (t) => ({
    tgIdx: index("users_tg_idx").on(t.telegramId),
    xpIdx: index("users_xp_idx").on(t.xp),
  }),
);

export const cards = pgTable(
  "cards",
  {
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    ease: real("ease").notNull().default(2.5),
    interval: integer("interval").notNull().default(0),
    reps: integer("reps").notNull().default(0),
    due: bigint("due", { mode: "number" }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.lessonId] }) }),
);

export const bktState = pgTable(
  "bkt_state",
  {
    userId: text("user_id").notNull(),
    conceptId: text("concept_id").notNull(),
    pKnow: real("p_know").notNull().default(0.1),
    pLearn: real("p_learn").notNull().default(0.3),
    pGuess: real("p_guess").notNull().default(0.2),
    pSlip: real("p_slip").notNull().default(0.1),
    updatedAt: bigint("updated_at", { mode: "number" }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.conceptId] }) }),
);

export const runs = pgTable(
  "runs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    language: text("language").notNull(),
    code: text("code").notNull(),
    stdout: text("stdout").notNull().default(""),
    stderr: text("stderr").notNull().default(""),
    status: text("status").notNull(),
    durationMs: integer("duration_ms").notNull(),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
  },
  (t) => ({
    userLessonIdx: index("runs_user_lesson_idx").on(t.userId, t.lessonId),
    createdIdx: index("runs_created_idx").on(t.createdAt),
  }),
);

export const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  lessonId: text("lesson_id").notNull(),
  trigger: text("trigger").notNull(),
  payload: jsonb("payload").notNull(),
  score: real("score").notNull().default(0),
  passed: boolean("passed").notNull().default(false),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const xpEvents = pgTable(
  "xp_events",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    type: text("type").notNull(),
    amount: integer("amount").notNull(),
    meta: jsonb("meta"),
    createdAt: bigint("created_at", { mode: "number" }).notNull(),
  },
  (t) => ({ userIdx: index("xp_user_idx").on(t.userId, t.createdAt) }),
);

export const badges = pgTable(
  "badges",
  {
    userId: text("user_id").notNull(),
    badgeId: text("badge_id").notNull(),
    awardedAt: bigint("awarded_at", { mode: "number" }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.badgeId] }) }),
);

export const labSessions = pgTable("lab_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  labId: text("lab_id").notNull(),
  containerId: text("container_id").notNull(),
  flag: text("flag").notNull(),
  entryPort: integer("entry_port").notNull(),
  status: text("status").notNull().default("running"),
  solvedAt: bigint("solved_at", { mode: "number" }),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const ctfs = pgTable("ctfs", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startsAt: bigint("starts_at", { mode: "number" }).notNull(),
  endsAt: bigint("ends_at", { mode: "number" }).notNull(),
  status: text("status").notNull().default("upcoming"),
});

export const challenges = pgTable("challenges", {
  id: text("id").primaryKey(),
  ctfId: text("ctf_id").references(() => ctfs.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  points: integer("points").notNull(),
  description: text("description").notNull(),
  flagPattern: text("flag_pattern").notNull(),
  hints: jsonb("hints").notNull().default([]),
  solves: integer("solves").notNull().default(0),
  releasedAt: bigint("released_at", { mode: "number" }).notNull(),
});

export const ctfSubmissions = pgTable("ctf_submissions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: text("challenge_id").notNull(),
  flag: text("flag").notNull(),
  correct: boolean("correct").notNull(),
  createdAt: bigint("created_at", { mode: "number" }).notNull(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  kind: text("kind").notNull(),
  payload: jsonb("payload").notNull(),
  sentAt: bigint("sent_at", { mode: "number" }).notNull(),
  read: boolean("read").notNull().default(false),
});
