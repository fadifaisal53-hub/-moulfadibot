import { repo } from "@moulinex/persistence";

export const XP_TABLE = {
  lesson_complete: 50,
  quiz_pass: 100,
  lab_solve: 250,
  ctf_flag: 500,
  streak_day: 25,
  onboarding: 20,
} as const;

export type XpType = keyof typeof XP_TABLE;

export function levelFromXp(xp: number): number {
  let level = 1,
    threshold = 0;
  while (xp >= threshold + level * 100) {
    threshold += level * 100;
    level++;
  }
  return level;
}

export async function awardXp(
  userId: string,
  type: XpType,
  multiplier = 1,
) {
  const base = XP_TABLE[type];
  const amount = Math.round(base * multiplier);
  await repo.addXp(userId, type, amount);

  const user = await repo.getUserById(userId);
  if (!user) return { amount, levelUp: false, newLevel: 1 };

  const newLevel = levelFromXp(user.xp);
  const levelUp = newLevel > user.level;
  if (levelUp) await repo.updateUser(userId, { level: newLevel });

  return { amount, levelUp, newLevel };
}

export async function touchStreak(userId: string) {
  const user = await repo.getUserById(userId);
  if (!user) return { streak: 0, changed: false };

  const now = new Date();
  const last = new Date(user.lastActiveAt);
  const days = Math.floor((now.getTime() - last.getTime()) / 86400000);

  let streak = user.streak;
  if (days === 1) {
    streak++;
    await repo.addXp(userId, "streak_day", 25);
  } else if (days > 1) {
    streak = 1;
  }

  await repo.updateUser(userId, { streak, lastActiveAt: now.getTime() });
  return { streak, changed: days >= 1 };
}
