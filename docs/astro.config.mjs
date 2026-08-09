// @ts-check
import starlight from "@astrojs/starlight";
import mermaid from "astro-mermaid";
import { defineConfig } from "astro/config";

export default defineConfig({
  integrations: [
    // Must come BEFORE starlight so mermaid code blocks are transformed
    // before Starlight processes the markdown.
    mermaid({
      autoTheme: true,
      enableLog: false,
    }),
    starlight({
      title: "The Algorithm — Docs",
      description:
        "Developer documentation for The Algorithm: an interactive ICT mentorship course. Architecture, content authoring, components, guides and development workflows.",
      defaultLocale: "root",
      locales: {
        root: {
          label: "English",
          lang: "en",
        },
      },
      logo: {
        alt: "The Algorithm",
        src: "./public/favicon.svg",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Overview", slug: "getting-started/overview" },
            { label: "Local Setup", slug: "getting-started/local-setup" },
            {
              label: "Development Workflow",
              slug: "getting-started/workflow",
            },
          ],
        },
        {
          label: "Architecture",
          items: [
            { label: "Project Structure", slug: "architecture/project-structure" },
            { label: "Data Model", slug: "architecture/data-model" },
            { label: "Content Pipeline", slug: "architecture/content-pipeline" },
            { label: "Rendering", slug: "architecture/rendering" },
            { label: "Client State", slug: "architecture/client-state" },
            { label: "Build System", slug: "architecture/build-system" },
          ],
        },
        {
          label: "Content Authoring",
          items: [
            { label: "Content Rules", slug: "content/rules" },
            { label: "Add a Lesson", slug: "content/add-lesson" },
            { label: "Add a Month", slug: "content/add-month" },
            { label: "Add a Section", slug: "content/add-section" },
            { label: "Quizzes", slug: "content/quizzes" },
            { label: "Exams & Summaries", slug: "content/exams" },
            { label: "Charts", slug: "content/charts" },
            { label: "Videos", slug: "content/videos" },
          ],
        },
        {
          label: "Components",
          items: [
            { label: "Overview", slug: "components/overview" },
            { label: "Quiz", slug: "components/quiz" },
            { label: "Exam", slug: "components/exam" },
            { label: "Lightbox", slug: "components/lightbox" },
            { label: "Sidebar & Progress", slug: "components/sidebar" },
            { label: "Other Components", slug: "components/other" },
          ],
        },
        {
          label: "Guides & Tutorials",
          items: [
            { label: "Enrich a Lesson", slug: "guides/enrich-lesson" },
            { label: "Fix a Quiz", slug: "guides/fix-quiz" },
            { label: "Add Charts to a Lesson", slug: "guides/add-charts" },
            { label: "Run a Content Audit", slug: "guides/content-audit" },
            { label: "Keep Docs in Sync", slug: "guides/keep-docs-in-sync" },
          ],
        },
        {
          label: "Development",
          items: [
            { label: "Scripts Reference", slug: "development/scripts" },
            { label: "Lint & Format", slug: "development/lint-format" },
            { label: "Verification", slug: "development/verification" },
            { label: "CI/CD", slug: "development/ci-cd" },
            { label: "Deployment", slug: "development/deployment" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Legacy Project Docs", slug: "reference/legacy-docs" },
          ],
        },
      ],
      social: [
        {
          href: "https://github.com/RitSpunterprise/the-algorithm",
          icon: "github",
          label: "GitHub",
        },
      ],
    }),
  ],
});
