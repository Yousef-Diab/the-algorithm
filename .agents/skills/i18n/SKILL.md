---
name: i18n
description: "Manage internationalization (i18n) for this Astro SSR project. Use when adding translations, creating new pages/components that need i18n, adding new languages/locales, refactoring translation files, working with translation keys, interpolation ({name} placeholders), pluralization, or any task involving the i18n system under src/i18n/."
---

# Internationalization (i18n)

This project uses a **custom type-safe i18n system** with English as the source of truth. No external i18n library — translations are plain TypeScript objects with types inferred via `typeof`.

## Architecture Overview

```
src/i18n/
├── config.ts                    # SUPPORTED_LOCALES, DEFAULT_LOCALE, Language type
├── middleware.ts                # Language detection & prefix routing
├── locales/
│   ├── index.ts                 # useTranslations(), useLayoutTranslations()
│   ├── en/                      # English (SOURCE OF TRUTH for types)
│   │   ├── index.ts             # Barrel re-exports
│   │   ├── shared.ts            # shared, backButton
│   │   ├── navigation.ts        # navigationLinks
│   │   ├── schemas.ts           # zodSchemas
│   │   ├── components/          # navbar, footer, themeSelector, drawerSidebar
│   │   ├── pages/               # One file per page (about.ts, signin.ts, etc.)
│   │   └── modules/auth/        # authModals
│   └── es/                      # Spanish (mirrors en/ structure exactly)
│       └── ...                  # Same files, same exports, typed against EN
└── utils/
    ├── get-browser-language.ts
    ├── interpolate.ts           # interpolate("Hello {name}", { name: "John" })
    └── plural.ts                # plural(count, { one: "1 item", other: "{count} items" })
```

## Core Pattern: EN = Source of Truth

English locale files define both the **content** and the **type shape**:

```typescript
// src/i18n/locales/en/pages/about.ts
export const about = {
  seo: { title: "About Us", description: "..." },
  header: { heading: "About Our Company", description: "..." },
  sections: { story: { heading: "Our Story", text: "..." } },
};
export type AboutTranslations = typeof about;
```

Other locales import the type FROM the EN file — TypeScript enforces completeness:

```typescript
// src/i18n/locales/es/pages/about.ts
import type { AboutTranslations } from "../en/pages/about";

export const about: AboutTranslations = {
  seo: { title: "Sobre nosotros", description: "..." },
  // Missing keys → TypeScript error ✅
  // Extra keys → TypeScript error ✅
};
```

## Consuming Translations

### In Astro pages

```astro
---
import { useTranslations, useLayoutTranslations } from "@i18n/locales";
import type { Language } from "@i18n/config";

const lang = Astro.params.lang as Language;
const t = useTranslations(lang);
const layoutT = useLayoutTranslations(lang);
---

<Layout title={t.about.seo.title} lang={lang} t={layoutT}>
  <h1>{t.about.header.heading}</h1>
</Layout>
```

### In components (via props)

```astro
---
import type { LayoutTranslations } from "@i18n/locales";

interface Props {
  lang: string;
  t: LayoutTranslations;
}
const { t, lang } = Astro.props;
---

<nav>
  <a href={`/${lang}/`} title={t.navbar.logo.title}>{t.navbar.logo.text}</a>
</nav>
```

### Client-side (serialized via data attributes)

```astro
<span class="hidden" id="page-data"
  data-lang={lang}
  data-translations={JSON.stringify({ signin: t.signin, zodSchemas: t.zodSchemas })}
></span>
```

## Interpolation

Use `interpolate()` for dynamic values in templates:

```typescript
import { interpolate } from "@i18n/utils/interpolate";

// In translation file:
export const main = {
  authenticated: { heading: "Welcome back, {name}!" },
};

// At consumption:
interpolate(t.main.authenticated.heading, { name: user.name });
// → "Welcome back, John!"
```

## Pluralization

Use `plural()` for count-dependent strings:

```typescript
import { plural } from "@i18n/utils/plural";

const message = plural(count, {
  zero: "No items",
  one: "1 item",
  other: "{count} items",
});
// count=0 → "No items", count=1 → "1 item", count=5 → "5 items"
```

## Adding a New Language

See [references/add-translations.md](references/add-translations.md) for step-by-step checklists.

Quick summary:
1. Create `src/i18n/locales/{code}/` mirroring the `en/` structure
2. Import types from EN files, implement all keys
3. Update barrel exports in `{code}/index.ts`
4. Add the locale code to `SUPPORTED_LOCALES` in `src/i18n/config.ts`
5. That's it — middleware and `useTranslations()` pick it up automatically

## Common Operations Reference

| Task | See |
|------|-----|
| Add a key to existing page | [references/add-translations.md](references/add-translations.md) |
| Create translations for new page | [references/add-translations.md](references/add-translations.md) |
| Create translations for new component | [references/add-translations.md](references/add-translations.md) |
| Add a new language | [references/add-translations.md](references/add-translations.md) |
| Architecture details & file naming | [references/architecture.md](references/architecture.md) |
| Label type, interpolation, pluralization | [references/patterns.md](references/patterns.md) |

## Rules

1. **Never create separate type files** — types are `typeof` the EN export
2. **EN files must NOT have explicit type annotations** — they define the shape
3. **ES (and other locale) files MUST have the type annotation** — enforces completeness
4. **Use path aliases** — `@i18n/locales`, `@i18n/config`, `@i18n/utils/interpolate`
5. **One export per concept** — don't combine unrelated translations in one file
6. **Mirror structure exactly** — every locale directory mirrors `en/` 1:1
7. **No hardcoded text** in pages/components — use translation objects
8. **Barrel exports only re-export** — no logic in `index.ts` files
