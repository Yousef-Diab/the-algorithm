import Link from 'next/link';
import { accessContext } from '@/lib/db/access-queries';
import { getLeaderboard, getLearnerProfile, getRewardSummary } from '@/lib/rewards/queries';
import { LeaderboardTable } from '@/components/rewards/LeaderboardTable';
import { LearnerSettings } from '@/components/rewards/LearnerSettings';
import { RewardSummaryCard } from '@/components/rewards/RewardSummary';
import styles from '@/components/rewards/rewards.module.css';
import shell from '@/app/shell.module.css';
export const dynamic='force-dynamic';
export const metadata={title:'Leaderboard — The Algorithm'};

export default async function LeaderboardPage() {
  const ctx=await accessContext();
  if(!ctx.user || (!ctx.isAdmin && ctx.entitlements.length===0)) return <div className={shell.inner}>
    <header className={styles.pageHeader}><div className={styles.eyebrow}>Learn together</div><h1>Member leaderboard</h1></header>
    <div className={styles.panel}><h2 className={styles.heading}>A little friendly competition.</h2><p className={styles.muted}>Sign in as a member to see player progress, earn XP and find your place on the board.</p><div className={styles.actions}><Link className={styles.primary} href="/auth/sign-in">Sign in</Link></div></div>
  </div>;
  const [rows,profile,summary]=await Promise.all([getLeaderboard(ctx.user.id),getLearnerProfile(ctx.user.id),getRewardSummary(ctx.user.id)]);
  const me=rows.find(r=>r.isMe);
  return <div className={shell.inner}>
    <header className={styles.pageHeader}><div className={styles.eyebrow}>Learn together</div><h1>Small steps. Shared progress.</h1><p className={styles.muted}>A little friendly competition, one lesson checkpoint at a time.</p></header>
    <RewardSummaryCard summary={summary}/>
    <div className={styles.row}><h2 className={styles.heading}>All-time ranking</h2><p className={styles.muted}>{profile.visible ? me?`Your rank: #${me.rank}`:'Complete your first checkpoint to join the board.':'Your entry is hidden. Your XP is still yours.'}</p></div>
    <p className={styles.muted}>Includes one-time credit for lessons completed before rewards launched.</p>
    <LeaderboardTable rows={rows}/>
    <LearnerSettings profile={profile}/>
    <div className={styles.panel}><div className={styles.eyebrow}>How XP works</div><p className={styles.muted} style={{marginTop:8}}>Complete a lesson quiz for 20 XP. Reach 80% for a one-time 10 XP accuracy bonus, plus 5 XP when you do it on your first attempt. Return after seven days and answer every question again for 5 review XP. Timers and quiz resets never add XP. Level up every 100 XP.</p></div>
  </div>;
}
