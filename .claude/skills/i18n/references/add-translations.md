# Adding & Managing Translations

Step-by-step checklists for common i18n operations.

## Add a Key to an Existing Page

**Example:** Add a `subtitle` to the About page's header section.

### Steps

1. **Edit EN file** — `src/i18n/locales/en/pages/about.ts`
   ```typescript
   export const about = {
     header: {
       heading: "About Our Company",
       description: "Our story and mission",
       subtitle: "Est. 2023",  // ← new key
     },
   };
   export type AboutTranslations = typeof about;
   ```

2. **TypeScript catches the gap** — ES file will show an error:
   > Property 'subtitle' is missing in type...

3. **Update ES file** — `src/i18n/locales/es/pages/about.ts`
   ```typescript
   export const about: AboutTranslations = {
     header: {
       heading: "Sobre Nuestra Empresa",
       description: "Nuestra historia y misión",
       subtitle: "Est. 2023",  // ← add the new key
     },
   };
   ```

4. **Use in template** — `src/pages/[lang]/about.astro`
   ```astro
   <p>{t.about.header.subtitle}</p>
   ```

**Files touched:** 2 locale files + 1 page file. No type files, no barrel updates.

---

## Create Translations for a New Page

**Example:** Create translations for a new `/contact` page.

### Steps

1. **Create EN translation file** — `src/i18n/locales/en/pages/contact.ts`
   ```typescript
   export const contact = {
     seo: {
       title: "Contact Us - ACME",
       description: "Get in touch with our team",
     },
     header: {
       heading: "Contact Us",
       description: "We'd love to hear from you",
     },
     form: {
       name: { label: "Name", placeholder: "Your name" },
       email: { label: "Email", placeholder: "name@example.com" },
       message: { label: "Message", placeholder: "How can we help?" },
       submit: { text: "Send Message", title: "Send your message", ariaLabel: "Send your message" },
     },
   };

   export type ContactTranslations = typeof contact;
   ```

2. **Create ES translation file** — `src/i18n/locales/es/pages/contact.ts`
   ```typescript
   import type { ContactTranslations } from "../en/pages/contact";

   export const contact: ContactTranslations = {
     seo: {
       title: "Contáctanos - ACME",
       description: "Ponte en contacto con nuestro equipo",
     },
     header: {
       heading: "Contáctanos",
       description: "Nos encantaría saber de ti",
     },
     form: {
       name: { label: "Nombre", placeholder: "Tu nombre" },
       email: { label: "Correo electrónico", placeholder: "nombre@ejemplo.com" },
       message: { label: "Mensaje", placeholder: "¿Cómo podemos ayudar?" },
       submit: { text: "Enviar Mensaje", title: "Enviar tu mensaje", ariaLabel: "Enviar tu mensaje" },
     },
   };
   ```

3. **Add to EN barrel** — `src/i18n/locales/en/pages/index.ts`
   ```typescript
   export * from "./contact";
   ```

4. **Add to ES barrel** — `src/i18n/locales/es/pages/index.ts`
   ```typescript
   export * from "./contact";
   ```

5. **Create the page** — `src/pages/[lang]/contact.astro`
   ```astro
   ---
   import { useTranslations, useLayoutTranslations } from "@i18n/locales";
   import type { Language } from "@i18n/config";
   import Layout from "@layouts/Layout.astro";

   const lang = Astro.params.lang as Language;
   const t = useTranslations(lang);
   const layoutT = useLayoutTranslations(lang);
   ---

   <Layout title={t.contact.seo.title} description={t.contact.seo.description} lang={lang} t={layoutT}>
     <h1>{t.contact.header.heading}</h1>
   </Layout>
   ```

**Files touched:** 2 locale files + 2 barrel files + 1 page file.

---

## Create Translations for a New Component

**Example:** Add translations for a new `CookieBanner` component.

### Steps

1. **Decide location** — Component-level translations go in `components/`:
   - `src/i18n/locales/en/components/cookie-banner.ts`

2. **Create EN file**:
   ```typescript
   export const cookieBanner = {
     message: "We use cookies to improve your experience.",
     accept: { text: "Accept", title: "Accept cookies", ariaLabel: "Accept cookies" },
     decline: { text: "Decline", title: "Decline cookies", ariaLabel: "Decline cookies" },
     learnMore: { text: "Learn more", title: "Learn more about our cookie policy", ariaLabel: "Learn more about cookies" },
   };

   export type CookieBannerTranslations = typeof cookieBanner;
   ```

3. **Create ES file** — `src/i18n/locales/es/components/cookie-banner.ts`
   ```typescript
   import type { CookieBannerTranslations } from "../en/components/cookie-banner";

   export const cookieBanner: CookieBannerTranslations = {
     message: "Usamos cookies para mejorar tu experiencia.",
     accept: { text: "Aceptar", title: "Aceptar cookies", ariaLabel: "Aceptar cookies" },
     decline: { text: "Rechazar", title: "Rechazar cookies", ariaLabel: "Rechazar cookies" },
     learnMore: { text: "Saber más", title: "Más info sobre cookies", ariaLabel: "Más info sobre cookies" },
   };
   ```

4. **Add to component barrels** — both `en/components/index.ts` and `es/components/index.ts`:
   ```typescript
   export * from "./cookie-banner";
   ```

5. **Use in component** — `src/components/CookieBanner.astro`
   ```astro
   ---
   import { useTranslations } from "@i18n/locales";
   import type { Language } from "@i18n/config";

   interface Props { lang: string; }
   const { lang } = Astro.props;
   const t = useTranslations(lang as Language);
   ---

   <div class="cookie-banner">
     <p>{t.cookieBanner.message}</p>
     <button title={t.cookieBanner.accept.title}>{t.cookieBanner.accept.text}</button>
   </div>
   ```

**Files touched:** 2 locale files + 2 barrel files + 1 component file.

---

## Add a New Language

**Example:** Add Portuguese (pt).

### Steps

1. **Create locale directory** — `src/i18n/locales/pt/` mirroring `en/` exactly:
   ```
   pt/
   ├── index.ts
   ├── shared.ts
   ├── navigation.ts
   ├── schemas.ts
   ├── components/
   │   ├── index.ts
   │   ├── footer.ts
   │   ├── navbar.ts
   │   └── theme-selector.ts
   ├── pages/
   │   ├── index.ts
   │   ├── about.ts
   │   ├── signin.ts
   │   └── ... (all page files)
   └── modules/
       └── auth/
           ├── index.ts
           └── modals.ts
   ```

2. **Each PT file imports types from EN**:
   ```typescript
   // pt/pages/about.ts
   import type { AboutTranslations } from "../en/pages/about";

   export const about: AboutTranslations = {
     seo: { title: "Sobre Nós - ACME", description: "..." },
     // TypeScript ensures ALL keys are present
   };
   ```

3. **Create PT barrel** — `pt/index.ts` (same re-exports as `en/index.ts`)

4. **Add to config** — `src/i18n/config.ts`:
   ```typescript
   export const SUPPORTED_LOCALES = ["en", "es", "pt"] as const;
   ```

5. **Add to locales index** — `src/i18n/locales/index.ts`:
   ```typescript
   import * as pt from "./pt";
   const locales = { en, es, pt } as const;
   ```

6. **Done** — middleware, `useTranslations()`, and `Language` type update automatically.

**Files touched:** All PT locale files + `config.ts` + `locales/index.ts`. No other files need changes.

---

## Quick Reference: What to Touch

| Task | Locale files | Barrels | Config | Pages/Components |
|------|-------------|---------|--------|-----------------|
| Add a key | EN + all locales | — | — | Consumer file |
| New page | EN + all locales | EN + all locale page barrels | — | New page file |
| New component | EN + all locales | EN + all locale component barrels | — | New component |
| New language | All files in new locale | New locale barrel | `config.ts` + `locales/index.ts` | — |
| Remove a key | EN + all locales | — | — | Consumer file |
