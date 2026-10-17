import type { Context } from "hono";
import { z } from "zod";
import { lessons } from "@moulinex/core";
import { streamWithFallback, hasAnyProvider } from "@moulinex/llm";

const TutorInput = z.object({
  lessonId: z.string(),
  question: z.string().min(1).max(2000),
  code: z.string().max(20000).default(""),
});

export async function createTutorStream(c: Context) {
  if (!hasAnyProvider()) {
    return c.json(
      {
        error:
          "أضف مفتاحاً في .env: GROQ_API_KEY, CEREBRAS_API_KEY, OPENROUTER_API_KEY, MISTRAL_API_KEY, أو GEMINI_API_KEY",
      },
      503,
    );
  }

  const body = await c.req.json().catch(() => null);
  const p = TutorInput.safeParse(body);
  if (!p.success) return c.json({ error: "طلب غير صالح" }, 400);

  const lesson = lessons.find((l) => l.id === p.data.lessonId);
  if (!lesson) return c.json({ error: "الدرس غير موجود" }, 404);

  const result = await streamWithFallback({
    system: `أنت معلم برمجة صبور يتحدث العربية الفصحى.
الدرس: ${lesson.title}
الهدف: ${lesson.goal}

قواعدك:
1. وجّه الطالب بأسئلة وتلميحات قبل إعطاء الحل.
2. اشرح الأخطاء بوضوح.
3. الكود بالإنجليزية، الشرح بالعربية.
4. لا تتجاوز 800 كلمة.`,
    prompt: `\`\`\`${lesson.language}\n${p.data.code}\n\`\`\`\n\nسؤالي: ${p.data.question}`,
    maxTokens: 800,
    temperature: 0.7,
  });

  return result.toTextStreamResponse({
    headers: {
      "Access-Control-Allow-Origin": c.req.header("origin") ?? "*",
      "Cache-Control": "no-cache",
    },
  });
}
