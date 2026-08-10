/**
 * Tolerant readers for the bare-literal content meta files. Mirrors build.py's
 * parse_objs / js_literal: a JS formatter mangles these files by design
 * (CLAUDE.md §3), so we pull the fields out rather than trusting the syntax.
 * Never eval, never JSON.parse.
 */

export interface QuizRow {
  q: string;
  o: string[];
  a: number;
  e: string;
}

/** A double-quoted JS string, honouring backslash escapes. */
const STR = String.raw`"((?:[^"\\]|\\.)*)"`;

function unescape(s: string): string {
  return s.replace(/\\(["\\/nrt])/g, (_, c: string) =>
    c === "n" ? "\n" : c === "r" ? "\r" : c === "t" ? "\t" : c,
  );
}

/** Every `{…}` of `key:"value"` pairs, in source order. */
export function parseObjs(text: string): Record<string, string>[] {
  const out: Record<string, string>[] = [];
  for (const objMatch of text.matchAll(/\{[^{}]*\}/g)) {
    const fields: Record<string, string> = {};
    for (const f of objMatch[0].matchAll(new RegExp(String.raw`(\w+)\s*:\s*${STR}`, "g"))) {
      fields[f[1]] = unescape(f[2]);
    }
    if (Object.keys(fields).length) out.push(fields);
  }
  return out;
}

/**
 * A quiz/exam array literal. Objects are matched one at a time so a stray
 * bracket or trailing semicolon cannot shift the parse.
 */
export function parseQuiz(text: string): QuizRow[] {
  const body = text.trim().replace(/[;\s]+$/, "");
  if (!body.startsWith("[")) throw new Error("quiz literal must start with [");

  const rows: QuizRow[] = [];
  const objRe = /\{(?:[^{}[\]]|\[(?:[^[\]]*)\])*\}/g;
  for (const m of body.matchAll(objRe)) {
    const src = m[0];
    const q = new RegExp(String.raw`\bq\s*:\s*${STR}`).exec(src);
    const e = new RegExp(String.raw`\be\s*:\s*${STR}`).exec(src);
    const a = /\ba\s*:\s*(\d+)/.exec(src);
    const oBlock = /\bo\s*:\s*\[([\s\S]*?)\]/.exec(src);
    if (!q || !e || !a || !oBlock) throw new Error(`quiz question is missing q/o/a/e: ${src.slice(0, 90)}…`);

    const o = [...oBlock[1].matchAll(new RegExp(STR, "g"))].map((s) => unescape(s[1]));
    if (o.length !== 4) throw new Error(`quiz question must have 4 options, found ${o.length}: ${unescape(q[1])}`);
    const answer = Number(a[1]);
    if (answer < 0 || answer > 3) throw new Error(`quiz answer index ${answer} out of range: ${unescape(q[1])}`);

    rows.push({ q: unescape(q[1]), o, a: answer, e: unescape(e[1]) });
  }
  if (!rows.length) throw new Error("quiz literal contains no questions");
  return rows;
}
