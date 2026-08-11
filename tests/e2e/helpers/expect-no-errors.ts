import type { Page } from "@playwright/test";

/**
 * Shared console/page-error collector for specs that assert a page rendered
 * with zero console or page errors — the check `verify.py` made on every
 * lesson, quiz and lightbox interaction.
 *
 * Extracted from the pattern tests/e2e/lightbox.spec.ts and
 * tests/e2e/lessons.spec.ts already implement by hand. Preserving
 * lightbox.spec.ts's reasoning verbatim (see its console handler comment):
 *
 *   /api/quiz/<id> answering 401 to an anonymous visitor is the DESIGNED
 *   gate (see tests/e2e/quiz.spec.ts, which asserts exactly that status),
 *   and Quiz.tsx handles it by rendering <QuizGate/>. Chromium still logs
 *   every 4xx subresource as a console error, so this one line is expected
 *   noise on any public lesson page. Narrowed by URL, not by message text,
 *   so a 401 from anywhere else still fails this test.
 *
 * Now that the exam exists, /api/exam/<id> 401s an anonymous visitor on the
 * same terms (app/api/exam/[id]/route.ts: exams are members-only regardless
 * of the lesson's own access) and ExamClient renders a gate instead of
 * throwing — so it is expected noise on any public exam page for exactly
 * the same reason, and is included here on the same terms.
 *
 * Filtered on the request URL (m.location().url), never on message text, so
 * a 401 from anywhere else still fails. The pageerror handler is NOT
 * filtered at all — a thrown/unhandled error is never expected noise.
 */
const EXCLUDED_URL_PATTERNS = [/\/api\/quiz\//, /\/api\/exam\//];

export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    if (EXCLUDED_URL_PATTERNS.some((re) => re.test(m.location().url))) return;
    errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}
