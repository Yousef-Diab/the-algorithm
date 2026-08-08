# i18n Architecture

## Design Principles

1. **EN is the single source of truth** — English defines both content and type shape via `typeof`
2. **No separate type files** — eliminates the types/ directory entirely
3. **Type safety without duplication** — other locales import types from EN, TypeScript catches missing/extra keys
4. **Flat re-exports** — barrel files (`index.ts`) only re-export, no logic
5. **Minimal API surface** — `useTranslations(lang)` and `useLayoutTranslations(lang)` replace 20+ getter functions
6. **Config-driven** — locales, default language derived from a single `config.ts`

## Directory Structure

```
src/i18n/
├── config.ts                         # Central configuration
│   ├── SUPPORTED_LOCALES             # ["en", "es"] (add new locales here)
│   ├── DEFAULT_LOCALE                # "en"
│   └── type Language                 # Derived: "en" | "es"
│
├── middleware.ts                     # Language detection, prefix routing
│   └── imports from config.ts        # No hardcoded locale arrays
│
├── locales/
│   ├── index.ts                      # useTranslations(), useLayoutTranslations()
│   │
│   ├── en/                           # SOURCE OF TRUTH
│   │   ├── index.ts                  # Barrel: re-exports all modules
│   │   ├── shared.ts                 # exports: shared, backButton + types
│   │   ├── navigation.ts            # exports: navigationLinks + type
│   │   ├── schemas.ts               # exports: zodSchemas + type
│   │   ├── components/
│   │   │   ├── index.ts             # Barrel
│   │   │   ├── footer.ts           # exports: footer + FooterTranslations
│   │   │   ├── navbar.ts           # exports: navbar, drawerSidebar + types
│   │   │   └── theme-selector.ts   # exports: themeSelector + type
│   │   ├── pages/
│   │   │   ├── index.ts            # Barrel
│   │   │   ├── about.ts            # exports: about + AboutTranslations
│   │   │   ├── signin.ts           # exports: signin, signout + types
│   │   │   └── ...                 # One file per page
│   │   └── modules/
│   │       └── auth/
│   │           ├── index.ts        # Barrel
│   │           └── modals.ts       # exports: authModals + type
│   │
│   └── es/                          # MIRRORS en/ exactly
│       ├── index.ts                 # Barrel (same exports as en/index.ts)
│       ├── shared.ts               # Imports SharedTranslations from "../en/shared"
│       └── ...                     # Same structure, types imported from EN
│
└── utils/
    ├── get-browser-language.ts
    ├── interpolate.ts
    └── plural.ts
```

## Type Inference Pattern

### EN files (define the shape)

```typescript
// src/i18n/locales/en/pages/about.ts
// NO type import — EN defines the shape
export const about = {
  seo: {
    title: "About Us - ACME",
    description: "Learn about our company",
  },
  header: {
    heading: "About Our Company",
    description: "Our story and mission",
  },
};

// Type is inferred from the object — this IS the interface
export type AboutTranslations = typeof about;
```

### Other locale files (implement the shape)

```typescript
// src/i18n/locales/es/pages/about.ts
import type { AboutTranslations } from "../en/pages/about";

// Explicit type annotation — TypeScript enforces ALL keys present
export const about: AboutTranslations = {
  seo: {
    title: "Sobre nosotros - ACME",
    description: "Conoce nuestra empresa",
  },
  header: {
    heading: "Sobre Nuestra Empresa",
    description: "Nuestra historia y misión",
  },
};
```

### Why this works

- **Missing key in ES** → TypeScript error: `Property 'header' is missing in type...`
- **Extra key in ES** → TypeScript error: `Object literal may only specify known properties...`
- **Wrong value type** → TypeScript error: `Type 'number' is not assignable to type 'string'`
- **Zero maintenance** — add a key in EN, TypeScript immediately tells you every locale that needs updating

## Barrel Export Pattern

### Locale barrel (`en/index.ts`, `es/index.ts`)

Flat re-exports of all translation modules:

```typescript
// Pages
export { about } from "./pages/about";
export { checkout } from "./pages/checkout";
export { dashboard } from "./pages/dashboard";
// ... all pages

// Components
export { footer } from "./components/footer";
export { drawerSidebar, navbar } from "./components/navbar";
export { themeSelector } from "./components/theme-selector";

// Shared
export { backButton, shared } from "./shared";
export { navigationLinks } from "./navigation";
export { zodSchemas } from "./schemas";

// Modules
export { authModals } from "./modules/auth/modals";
```

### Main index (`locales/index.ts`)

```typescript
import type { Language } from "../config";
import * as en from "./en";
import * as es from "./es";

const locales = { en, es } as const;

export function useTranslations(lang: Language) {
  return locales[lang];
}

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

// LayoutTranslations type derived from the helper
export type LayoutTranslations = ReturnType<typeof useLayoutTranslations>;
```

## File Naming Conventions

| Content | File name | Export name |
|---------|-----------|-------------|
| Page translations | `pages/{page-slug}.ts` | camelCase of slug: `privacyPolicy`, `whyChooseUs` |
| Component translations | `components/{component-name}.ts` | camelCase: `navbar`, `footer` |
| Module translations | `modules/{module}/{feature}.ts` | camelCase: `authModals` |
| Shared translations | `shared.ts` | `shared`, `backButton` |
| Navigation links | `navigation.ts` | `navigationLinks` |
| Zod schema messages | `schemas.ts` | `zodSchemas` |

### Naming rules

- File names use **kebab-case**: `privacy-policy.ts`, `theme-selector.ts`
- Export names use **camelCase**: `privacyPolicy`, `themeSelector`
- Type names use **PascalCase** with `Translations` suffix: `PrivacyPolicyTranslations`
- Type is always `typeof` the export: `export type PrivacyPolicyTranslations = typeof privacyPolicy;`

## Config-Driven Locales

```typescript
// src/i18n/config.ts
export const SUPPORTED_LOCALES = ["en", "es"] as const;
export const DEFAULT_LOCALE = "en" satisfies SupportedLocale;

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];
export type Language = SupportedLocale;
```

Adding a new locale:
1. Add code to `SUPPORTED_LOCALES` array
2. Create locale directory mirroring `en/`
3. Add import in `locales/index.ts`

The `Language` type automatically expands — no manual union updates needed.
