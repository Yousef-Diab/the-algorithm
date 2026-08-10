import { NextResponse } from "next/server";
import { getLessonMeta, getQuiz } from "@/lib/content/queries";
import { accessContext } from "@/lib/db/access-queries";
import { canRead } from "@/lib/access";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = await getLessonMeta(id);
  if (!meta) return NextResponse.json({ error: "not found" }, { status: 404 });

  const ctx = await accessContext();

  // Quizzes are members-only regardless of the lesson's own access, so a free
  // lesson's page stays fully static while its quiz stays behind the gate.
  const asMembers = { sectionId: meta.sectionId, access: "members", status: meta.status };
  if (!canRead(asMembers, ctx)) {
    return NextResponse.json(
      { error: "members only" },
      { status: 401, headers: { "cache-control": "private, no-store" } },
    );
  }

  const rows = await getQuiz(id);
  return NextResponse.json(
    {
      questions: rows.map((r) => ({
        id: r.id,
        q: r.q,
        o: r.options as string[],
        a: r.answer,
        e: r.explanation,
      })),
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
