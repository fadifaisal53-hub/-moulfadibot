import Link from "next/link";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function Home() {
  const list = await api.curriculum.list.query().catch(() => null);
  return (
    <main>
      <h1>اكتب الكود. شغّله. افهم خطأك.</h1>
      <p style={{ maxWidth: "60ch", color: "var(--mute)" }}>
        كل درس فيه محرر ومخرجات ومعلم يرد على كودك أنت.
      </p>
      {!list ? (
        <p className="card">
          الخادم لا يستجيب. شغّل <code>pnpm dev</code>.
        </p>
      ) : (
        <div className="grid">
          {list.map((l) => (
            <Link key={l.id} href={`/lesson/${l.id}`} className="card">
              <h2>{l.title}</h2>
              <p>{l.summary}</p>
              <small>{l.language}</small>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
