'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { loadRewardSummary } from '@/app/actions/rewards';
import { levelFor, type RewardSummary as Summary } from '@/lib/rewards/types';
import styles from './rewards.module.css';

export function RewardSummaryCard({summary}:{summary:Summary}) {
  const level=levelFor(summary.xp);
  return <section className={styles.panel} aria-label="Your learning XP">
    <div className={styles.row}><div><div className={styles.eyebrow}>Your learning journey</div><h2 className={styles.heading}>Every lesson adds up.</h2></div><Link href="/leaderboard" className={styles.button}>Leaderboard ↗</Link></div>
    <div className={styles.stats}><div className={styles.stat}><strong>{summary.xp.toLocaleString()}</strong><span>Total XP · Level {level}</span></div><div className={styles.stat}><strong>+{summary.today}</strong><span>XP today · Riyadh time</span></div><div className={styles.stat}><strong>{summary.completed}</strong><span>Checkpoints completed</span></div></div>
    <div className={styles.track} role="progressbar" aria-label="XP to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={summary.xp%100}><div className={styles.fill} style={{width:`${summary.xp%100}%`}}/></div>
    <p className={styles.muted}>{100-summary.xp%100} XP to level {level+1}</p>
    <div className={styles.badges}>
      {summary.completed>=1 && <span className={styles.badge}>◆ First lesson</span>}
      {summary.completed>=5 && <span className={styles.badge}>✦ Five lessons</span>}
      {summary.reviews>=1 && <span className={styles.badge}>↻ First review</span>}
      {summary.completed===0 && <span className={styles.muted}>Your first badge starts with one lesson checkpoint.</span>}
    </div>
  </section>;
}
export function RewardSummary() {
  const [summary,setSummary]=useState<Summary|null>(null);
  const [error,setError]=useState(false);
  useEffect(()=>{
    let active=true;
    const refresh=()=>loadRewardSummary().then(s=>{if(active){setSummary(s);setError(false);}}).catch(()=>{if(active)setError(true);});
    void refresh();window.addEventListener('checkpoint-completed',refresh);
    return()=>{active=false;window.removeEventListener('checkpoint-completed',refresh);};
  },[]);
  if(error) return <p className={styles.error}>Your XP could not load. Refresh to try again.</p>;
  return summary?<RewardSummaryCard summary={summary}/>:null;
}
