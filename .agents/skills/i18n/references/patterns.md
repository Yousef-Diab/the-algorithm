# i18n Patterns

## Interpolation

### The `interpolate()` utility

Replaces `{key}` placeholders in translation strings with provided values.

```typescript
// src/i18n/utils/interpolate.ts
import { interpolate } from "@i18n/utils/interpolate";

// Usage:
interpolate("Welcome back, {name}!", { name: "John" });
// → "Welcome back, John!"

interpolate("Copyright © {year} - All rights reserved", { year: "2024" });
// → "Copyright © 2024 - All rights reserved"
```

### In translation files

Use `{placeholder}` syntax in strings:

```typescript
// en/pages/main.ts
export const main = {
  authenticated: {
    heading: "Welcome back, {name}!",
  },
};
```

### In templates

```astro
---
import { interpolate } from "@i18n/utils/interpolate";
---
<h1>{interpolate(t.main.authenticated.heading, { name: user.name })}</h1>
```

### Convention

- Placeholder names use **camelCase**: `{userName}`, `{itemCount}`
- Keep placeholders descriptive: `{name}` not `{n}`
- Document expected placeholders with a comment if not obvious

---

## Pluralization

### The `plural()` utility

Selects the correct string form based on count:

```typescript
import { plural } from "@i18n/utils/plural";

plural(0, { zero: "No items", one: "1 item", other: "{count} items" });
// → "No items"

plural(1, { zero: "No items", one: "1 item", other: "{count} items" });
// → "1 item"

plural(5, { zero: "No items", one: "1 item", other: "{count} items" });
// → "5 items"
```

### Rules

- `one` and `other` are required
- `zero` is optional (falls back to `other` if not provided)
- `{count}` in the selected string is automatically replaced with the actual count
- For languages with complex plural rules (e.g., Arabic, Polish), extend the `plural()` function with a locale parameter

### In translation files

Store plural forms as objects:

```typescript
// en/pages/dashboard.ts
export const dashboard = {
  stats: {
    items: {
      zero: "No items yet",
      one: "1 item",
      other: "{count} items",
    },
  },
};
```

### In templates

```astro
<p>{plural(itemCount, t.dashboard.stats.items)}</p>
```

---

## Client-Side Translation Access

Some pages need translations in client-side JavaScript (e.g., form handlers, Alpine.js).

### Pattern: Data attribute serialization

```astro
---
const lang = Astro.params.lang as Language;
const t = useTranslations(lang);

// Select only the translations needed client-side
const clientTranslations = {
  signin: t.signin,
  zodSchemas: t.zodSchemas,
};
---

<span
  class="hidden"
  id="page-data"
  data-lang={lang}
  data-translations={JSON.stringify(clientTranslations)}
></span>
```

### In client-side scripts

```typescript
const dataEl = document.getElementById("page-data");
const lang = dataEl?.dataset.lang;
const translations = JSON.parse(dataEl?.dataset.translations || "{}");

// Access: translations.signin.toasts.generalError.text
```

### Best practices

- **Only serialize what's needed** — don't send the entire translation tree to the client
- **Use a consistent element ID** — `page-data` or `{page}-data` (e.g., `signin-page-lang`)
- **Parse once, store in variable** — avoid repeated `JSON.parse` calls

---

## LayoutTranslations Composition

The `useLayoutTranslations()` helper assembles translations needed by Layout, Header, NavBar, and Footer:

```typescript
export function useLayoutTranslations(lang: Language) {
  const t = locales[lang];
  return {
    navbar: t.navbar,
    drawerSidebar: t.drawerSidebar,
    signout: t.signout,
    footer: t.footer,
    themeSelector: t.themeSelector,
    shared: t.shared,
  };
}

export type LayoutTranslations = ReturnType<typeof useLayoutTranslations>;
```

### Why a separate helper?

Every page needs layout translations. Without this helper, every page would need to manually compose the same 6 properties. The helper reduces boilerplate while keeping the type derived automatically.

### Usage in pages

```astro
---
const t = useTranslations(lang);        // For page-specific content
const layoutT = useLayoutTranslations(lang); // For layout shell
---

<Layout title={t.about.seo.title} lang={lang} t={layoutT}>
  <h1>{t.about.header.heading}</h1>
</Layout>
```
