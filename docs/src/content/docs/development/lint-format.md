---
title: Lint & Format
description: The Ultracite + Biome setup — what CI runs, what's excluded, and the formatting rules you must know.
---

The repository uses the **Ultracite** preset on top of **Biome 2.5.6**
(`biome.jsonc`, devDeps `ultracite` + `@biomejs/biome`).

## Commands

| Command | What it does |
| --- | --- |
| `pnpm check` | Lint + format check (this is what CI runs). |
| `pnpm fix` | Auto-fix everything Biome considers safe. |
| `pnpm dlx ultracite check` | Direct Ultracite check. |
| `pnpm dlx ultracite fix` | Direct Ultracite fix. |
| `pnpm dlx ultracite doctor` | Diagnose setup issues. |

## The critical warning

:::danger
**Never run `pnpm fix` (or `biome check --write`/`--apply`) while
`assist.actions.source.organizeImports` is enabled for `.astro` files** —
Biome cannot see component usage in `.astro` templates and **deletes
frontmatter imports**.

The config keeps `organizeImports` off for `*.astro` for this reason;
re-enable it only if the upstream preset fixes the analysis.
:::

## What is excluded

These paths are excluded from linting in `biome.jsonc`:

```text
.astro, content, .claude, .agents, .vscode, images, public, dist,
node_modules, transcripts, notes, engine, index.html, .github, docs
```

- **Authored course content is never reformatted** (`content/`).
- **The docs workspace is excluded** (`!docs`) — its markdown/config files
  are not lint targets; the docs project has no lint step of its own.
- Legacy files (`engine/`, `index.html`) are excluded — they're obsolete.

## Relaxed rules

Some rules are intentionally relaxed in `biome.jsonc`, with reasons documented
in the config:

| Rule | Why relaxed |
| --- | --- |
| `correctness.useImageSize` | Chart images intentionally lack fixed sizes. |
| `suspicious.noDuplicateProperties` / `noLeakedRender` | Template patterns. |
| `performance.noJsxPropsBind` | Inline JSX handlers used deliberately. |
| `style.useFilenamingConvention` | PascalCase component filenames + legacy names. |
| `nursery.useSortedClasses` | Tailwind class ordering handled manually. |
| `a11y.noNoninteractiveElementInteractions` / `useKeyWithClickEvents` | Lightbox/controls keyboard handling is covered separately. |

For `*.astro` files additionally: `noUnusedImports`, `noUnusedVariables` and
`noNonNullAssertion` are off (template usage isn't visible to Biome), and
`organizeImports` is off (see the warning above).

## Ultracite code standards (what to write)

- **Type safety & explicitness**: explicit types for params/returns when they
  enhance clarity; `unknown` over `any`; `as const` for immutable literals;
  meaningful names over magic numbers.
- **Modern JS/TS**: arrow functions for callbacks; `for...of` over
  `.forEach()`; optional chaining and nullish coalescing; template literals
  over concatenation; `const` by default.
- **Async**: always `await` promises; `async/await` over promise chains;
  meaningful try/catch.
- **React/JSX**: function components; hooks only at top level; complete
  dependency arrays; `key` props; semantic HTML + ARIA; keyboard handlers
  alongside mouse handlers.
- **No debug leftovers**: no `console.log`, `debugger` or `alert` in
  production code; throw `Error` objects with descriptive messages.
- **Security**: `rel="noopener"` with `target="_blank"`; avoid
  `dangerouslySetInnerHTML`; no `eval`; validate user input.

When Biome can't help, focus on: business-logic correctness, meaningful
naming, architecture decisions, edge cases, UX, and documentation.

## Working with the docs package

The `docs/` package has **no lint step** — its files are excluded at the root
level. Keep its markdown tidy anyway (frontmatter, consistent headings) since
the docs site is user-facing documentation.
