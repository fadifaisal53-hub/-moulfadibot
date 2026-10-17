import { nanoid } from "nanoid";
import { lessons } from "@moulinex/core";
import { db, schema, repo } from "./index.js";

const DAY = 86400000;

const DEMO_USERS = [
  { handle: "سارة_المطيري", telegramId: 100000001, level: 18, xp: 4200, streak: 12 },
  { handle: "محمد_العتيبي", telegramId: 100000002, level: 12, xp: 2100, streak: 5 },
  { handle: "نورة_الشهري", telegramId: 100000003, level: 8, xp: 950, streak: 3 },
  { handle: "عبدالله_القحطاني", telegramId: 100000004, level: 25, xp: 8100, streak: 34 },
  { handle: "ريم_الدوسري", telegramId: 100000005, level: 3, xp: 210, streak: 1 },
  { handle: "أحمد_الزهراني", telegramId: 100000006, level: 15, xp: 3300, streak: 8 },
];

async function seed() {
  console.log("🌱 بدء الزرع...\n");

  const users = [];
  for (const u of DEMO_USERS) {
    const user = await repo.ensureUser({
      telegramId: u.telegramId,
      handle: u.handle,
    });
    await repo.updateUser(user.id, {
      xp: u.xp,
      level: u.level,
      streak: u.streak,
      onboarded: true,
      lastActiveAt: Date.now() - Math.floor(Math.random() * 2) * DAY,
    });
    users.push({ ...user, ...u });
  }
  console.log(`✅ ${users.length} مستخدم`);

  for (const user of users) {
    const numRuns = Math.min(50, Math.floor(user.xp / 100));
    for (let i = 0; i < numRuns; i++) {
      const lesson = lessons[Math.floor(Math.random() * lessons.length)]!;
      const errored = Math.random() < 0.3;
      await repo.recordRun({
        id: nanoid(16),
        userId: user.id,
        lessonId: lesson.id,
        language: lesson.language,
        code: lesson.starter,
        stdout: errored ? "" : "OK",
        stderr: errored ? "Error" : "",
        status: errored ? "error" : "ok",
        durationMs: 200 + Math.floor(Math.random() * 1800),
        createdAt: Date.now() - Math.floor(Math.random() * 30) * DAY,
      });
    }
    for (const lesson of lessons) {
      await repo.upsertBkt(user.id, lesson.id, {
        pKnow: Math.min(0.95, 0.1 + user.level * 0.03 + Math.random() * 0.2),
        pLearn: 0.3,
        pGuess: 0.2,
        pSlip: 0.1,
      });
    }
  }
  console.log("✅ نشاط المستخدمين");

  const now = Date.now();
  await db
    .insert(schema.ctfs)
    .values({
      id: "ctf-2024-q4",
      title: "مولينكس CTF — ربع 4",
      description: "مسابقة ربع سنوية.",
      startsAt: now - 7 * DAY,
      endsAt: now + 7 * DAY,
      status: "live",
    })
    .onConflictDoNothing();
  console.log("✅ مسابقة CTF");

  console.log("\n🎉 اكتمل الزرع");
}

seed()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌", e);
    process.exit(1);
  });
