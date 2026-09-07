'use client';
import styles from '@/components/rewards/rewards.module.css';
export default function LeaderboardError({reset}:{reset:()=>void}) {
  return <section className={styles.panel} role="alert"><h1 className={styles.heading}>The leaderboard could not load.</h1><p className={styles.muted}>Your learning progress is still saved. Try again in a moment.</p><div className={styles.actions}><button className={styles.primary} onClick={reset}>Try again</button></div></section>;
}
