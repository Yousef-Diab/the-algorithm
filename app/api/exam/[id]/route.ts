import { NextResponse } from "next/server";
import { getLessonMeta, getQuiz } from "@/lib/content/queries";
import { accessContext } from "@/lib/db/access-queries";
import { canRead } from "@/lib/access";
import { getExamResult } from "@/lib/db/exam-queries";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = await getLessonMeta(id);

  // A non-exam lesson id must be indistinguishable from an unknown one.
  if (!meta || meta.kind !== "exam") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const ctx = await accessContext();

  // P-A: a draft must be INDISTINGUISHABLE from a nonexistent lesson to anyone
  // who is not an admin — otherwise probing this route confirms the draft exists.
  // Admins must still get through, or a draft's quiz can never be reviewed.
  if (meta.status !== "published" && !ctx.isAdmin) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Exams are members-only regardless of the lesson's own access — mirrors
  // the quiz route's asMembers trick. s1-exam's lesson row is "free" but the
  // exam itself is not.
  const asMembers = { sectionId: meta.sectionId, access: "members", status: meta.status };
  if (!canRead(asMembers, ctx)) {
    return NextResponse.json(
      { error: "members only" },
      { status: 401, headers: { "cache-control": "private, no-store" } },
    );
  }

  const rows = await getQuiz(id);
  const saved = ctx.user ? await getExamResult(ctx.user.id, id) : null;

  return NextResponse.json(
    {
      questions: rows.map((r) => ({
        id: r.id,
        q: r.q,
        o: r.options as string[],
        a: r.answer,
        e: r.explanation,
      })),
      passMark: 0.8,
      saved,
    },
    { headers: { "cache-control": "private, no-store" } },
  );
}
