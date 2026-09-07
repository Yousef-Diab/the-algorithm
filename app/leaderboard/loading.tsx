import styles from '@/components/rewards/rewards.module.css';

export default function Loading() {
  return <section className={`${styles.panel} ${styles.loaderPanel}`} role="status" aria-live="polite">
    <div className={styles.loaderMark} aria-hidden="true">
      <svg className={styles.loaderSvg} viewBox="0 0 180 112">
        <path className={styles.loaderGrid} d="M14 20H166M14 56H166M14 92H166M42 10V102M90 10V102M138 10V102" />
        <path className={styles.loaderTrail} d="M12 84L42 70L68 78L94 42L121 54L166 20" />
        <g className={styles.loaderCandle}>
          <path d="M42 48V86" /><rect x="36" y="58" width="12" height="18" rx="2" />
        </g>
        <g className={styles.loaderCandle}>
          <path d="M76 50V90" /><rect x="70" y="61" width="12" height="20" rx="2" />
        </g>
        <g className={styles.loaderCandle}>
          <path d="M121 29V68" /><rect x="115" y="39" width="12" height="20" rx="2" />
        </g>
        <path className={styles.loaderDiamond} d="M94 30L106 42L94 54L82 42Z" />
        <circle className={styles.loaderSignal} cx="166" cy="20" r="4" />
      </svg>
    </div>
    <div>
      <div className={styles.eyebrow}>The market is moving</div>
      <h1 className={styles.loaderHeading}>Calculating the board…</h1>
      <p className={styles.muted}>Ranking every checkpoint and XP reward.</p>
    </div>
    <div className={styles.loaderRows} aria-hidden="true">
      {[0, 1, 2].map((row) => <div className={styles.loaderRow} key={row}>
        <span className={styles.loaderRank} />
        <span className={styles.loaderName} />
        <span className={styles.loaderScore} />
      </div>)}
    </div>
    <span className={styles.srOnly}>Loading the all-time leaderboard.</span>
  </section>;
}
