import { getCatalog } from "@/lib/content/queries";
import { SectionCards } from "@/components/home/SectionCards";
import styles from "@/components/home/home.module.css";

export default async function Home() {
  const catalog = await getCatalog();

  return (
    <section className={styles.home}>
      <div className={styles.hero}>
        <h1>
          Learn how price is <em>really delivered</em>.
        </h1>
        <p>
          An interactive course built from ICT&apos;s Mentorships. Section 1 — the{" "}
          <em>ICT Core Content</em> — is 38 lessons across 4 months: market maker
          templates, equilibrium &amp; fair valuation, liquidity, institutional order
          flow, PD arrays, and the market maker traps. Section 2 — the{" "}
          <em>ICT 2022 Mentorship</em> — is 40 lessons across 6 parts: one
          stripped-down intraday model taught end to end, from fair value gaps and
          liquidity to market structure shifts, the killzones, and reading the daily
          bias. Every word comes from ICT&apos;s mentorship notes and the original ICT
          video transcripts; every chart is pulled from the notes.
        </p>
      </div>

      <SectionCards sections={catalog} />

      <div className={styles.notice}>
        <b>How to use this course:</b> work through the lessons in order — the
        material builds from one lesson to the next. Flip the concept cards, study
        every chart (click to zoom), then take the lesson check. Your progress and
        quiz answers are saved in your browser automatically.
      </div>
    </section>
  );
}
