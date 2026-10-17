import { Hono } from "hono";
import { nanoid } from "nanoid";
import { repo } from "@moulinex/persistence";
import { lessons } from "@moulinex/core";
import { selectQuestions } from "@moulinex/assessment";
import { awardXp } from "@moulinex/gamification";
import { QUIZ_BANK } from "./quiz-bank.js";

export const internalRouter = new Hono();

internalRouter.post("/users/ensure", async (c) => {
  const { telegramId, handle } = await c.req.json();
  return c.json(await repo.ensureUser({ telegramId, handle }));
});

internalRouter.post("/users/onboard", async (c) => {
  const { userId } = await c.req.json();
  await repo.updateUser(userId, { onboarded: true });
  await repo.addXp(userId, "onboarding", 20);
  return c.json({ ok: true });
});

internalRouter.get("/lessons", (c) =>
  c.json(
    lessons.map(({ id, title, summary, language }) => ({
      id,
      title,
      summary,
      language,
    })),
  ),
);

internalRouter.get("/lessons/:id", (c) => {
  const l = lessons.find((x) => x.id === c.req.param("id"));
  if (!l) return c.json({ error: "not_found" }, 404);
  return c.json(l);
});

internalRouter.post("/quiz/generate", async (c) => {
  const { userId, lessonId } = await c.req.json();
  const pKnow = (await repo.getBkt(userId, lessonId)).pKnow;
  const pool = QUIZ_BANK[lessonId] ?? QUIZ_BANK["variables"] ?? [];
  const questions = selectQuestions(pool, pKnow, 5);
  const quiz = { id: nanoid(12), lessonId, trigger: "every_10_runs", questions };
  await repo.recordQuiz({
    id: quiz.id,
    userId,
    lessonId,
    trigger: quiz.trigger,
    payload: quiz,
    score: 0,
    passed: false,
    createdAt: Date.now(),
  });
  return c.json(quiz);
});

internalRouter.post("/quiz/complete", async (c) => {
  const { userId, score } = await c.req.json();
  const passed = score >= 4;
  if (passed && userId) await awardXp(userId, "quiz_pass");
  return c.json({ ok: true, passed });
});

internalRouter.get("/leaderboard/:scope", async (c) => {
  const scope = c.req.param("scope");
  const limit = parseInt(c.req.query("limit") ?? "10");
  return c.json(await repo.leaderboard(scope, limit));
});

internalRouter.get("/users/:id/profile", async (c) => {
  const id = c.req.param("id");
  const user = await repo.getUserById(id);
  if (!user) return c.json({ error: "not_found" }, 404);
  const badges = await repo.getUserBadges(id);
  const due = await repo.dueCards(id);
  return c.json({
    user,
    badges,
    dueCount: due.length,
    lessonsCompleted: 0,
    quizzesPassed: 0,
    labsSolved: 0,
  });
});
