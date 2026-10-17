export interface Question {
  id: string;
  kind: string;
  conceptId: string;
  prompt: string;
  choices?: string[];
  answer: string | string[];
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  weight: number;
}

export const QUIZ_TRIGGER_EVERY = 10;

export function shouldTriggerQuiz(
  totalRuns: number,
  lastQuizAtRun: number,
) {
  if (totalRuns < QUIZ_TRIGGER_EVERY) return false;
  return totalRuns - lastQuizAtRun >= QUIZ_TRIGGER_EVERY;
}

export function selectQuestions(
  pool: Question[],
  pKnow: number,
  n = 5,
): Question[] {
  const target = 0.15 + pKnow * 0.7;
  return [...pool]
    .map((q) => ({ q, d: Math.abs(q.difficulty / 5 - target) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.q);
}
