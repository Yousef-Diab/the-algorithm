import { levelFor, type LeaderboardEntry } from '@/lib/rewards/types';
import styles from './rewards.module.css';
export function LeaderboardTable({rows}:{rows:LeaderboardEntry[]}) {
  if(!rows.length) return <div className={styles.panel}><h2 className={styles.heading}>The board starts here.</h2><p className={styles.muted}>Complete a lesson checkpoint to earn your first XP.</p></div>;
  return <div className={styles.tableWrap}><table className={styles.table}>
    <caption className={styles.muted} style={{padding:12,captionSide:'bottom'}}>All-time XP · top 100 players, plus your position. Equal XP shares a rank.</caption>
    <thead><tr><th scope="col">Rank</th><th scope="col">Player</th><th scope="col">Level</th><th scope="col">XP</th><th scope="col">Lessons</th></tr></thead>
    <tbody>{rows.map((r,i)=><tr key={i} className={r.isMe?styles.me:undefined} aria-current={r.isMe?'true':undefined}>
      <td>#{r.rank}</td><td><div className={styles.player}><span className={styles.avatar} aria-hidden="true">{r.avatar}</span><span>{r.name}{r.isMe && <small className={styles.muted}> · You</small>}</span></div></td><td>{levelFor(r.totalXp)}</td><td className={styles.xp}>{r.xp.toLocaleString()}</td><td>{r.completed}</td>
    </tr>)}</tbody>
  </table></div>;
}
