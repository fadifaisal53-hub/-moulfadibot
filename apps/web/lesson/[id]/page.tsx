"use client";
import dynamic from "next/dynamic";
import { use, useEffect, useState } from "react";
import type { Lesson } from "@moulinex/core";
import { api, API } from "@/lib/api";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

export default function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [code, setCode] = useState("");
  const [out, setOut] = useState({ text: "", error: false });
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    api.curriculum.get
      .query({ id })
      .then((l) => {
        setLesson(l);
        setCode(l.starter);
      })
      .catch(() => setOut({ text: "الدرس غير موجود", error: true }));
  }, [id]);

  async function run() {
    setBusy(true);
    setOut({ text: "", error: false });
    try {
      const r = await api.execution.run.mutate({
        language: lesson!.language,
        code,
        lessonId: id,
      });
      const text = r.stdout + r.stderr + (r.error ?? "") || "(لا مخرجات)";
      setOut({ text, error: !!r.error });
    } catch (e) {
      setOut({ text: (e as Error).message, error: true });
    } finally {
      setBusy(false);
    }
  }

  async function ask() {
    setAnswer("");
    setBusy(true);
    const res = await fetch(`${API}/api/tutor`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lessonId: id, question: q, code }),
    });
    if (!res.ok || !res.body) {
      const d = await res.json().catch(() => ({ error: "تعذّر الاتصال" }));
      setAnswer(d.error);
      setBusy(false);
      return;
    }
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      setAnswer((a) => a + value);
    }
    setBusy(false);
  }

  if (!lesson)
    return (
      <main>
        <p>{out.text || "جارٍ التحميل…"}</p>
      </main>
    );

  return (
    <main>
      <a href="/">← الدروس</a>
      <h1>{lesson.title}</h1>
      <div className="split">
        <section>
          <p>{lesson.body}</p>
          <p>
            <strong>المطلوب:</strong> {lesson.goal}
          </p>
          <label htmlFor="q">اسأل المعلم عن كودك</label>
          <textarea
            id="q"
            rows={3}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={ask} disabled={busy || !q.trim()}>
            اسأل
          </button>
          {answer && (
            <div
              className="card"
              style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}
            >
              {answer}
            </div>
          )}
        </section>
        <section dir="ltr">
          <Monaco
            height="320px"
            language={lesson.language}
            value={code}
            onChange={(v) => setCode(v ?? "")}
            options={{ minimap: { enabled: false }, fontSize: 14 }}
          />
          <div dir="rtl" style={{ margin: ".75rem 0" }}>
            <button onClick={run} disabled={busy}>
              {busy ? "جارٍ التشغيل…" : "شغّل الكود"}
            </button>
          </div>
          <div className={`out ${out.error ? "err" : ""}`} aria-live="polite">
            {out.text}
          </div>
        </section>
      </div>
    </main>
  );
}
