'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { finishCheckpoint, loadCheckpointStatus } from '@/app/actions/rewards';
import type { CheckpointStatus } from '@/lib/rewards/types';
import styles from './rewards.module.css';

export function Checkpoint({lessonId,complete,saving,autoClaim}:{lessonId:string;complete:boolean;saving:boolean;autoClaim:boolean}) {
  const [status,setStatus]=useState<CheckpointStatus|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [earned,setEarned]=useState<number|null>(null);
  const autoAttempted=useRef(false);
  useEffect(()=>{let active=true;loadCheckpointStatus(lessonId).then(s=>{if(active)setStatus(s);}).catch(()=>{});return()=>{active=false;};},[lessonId]);
  const finish=useCallback(async () => {
    if(busy || saving || !complete) return;
    setBusy(true);setError('');
    try {
      const result=await finishCheckpoint(lessonId);
      setEarned(result.xp);
      window.dispatchEvent(new Event('checkpoint-completed'));
    } catch {setError('Could not finish the checkpoint. Check your connection and try again.');}
    finally {setBusy(false);}
  },[busy,complete,lessonId,saving]);
  useEffect(()=>{
    if(!autoClaim || !complete || saving || busy || earned!==null || autoAttempted.current) return;
    autoAttempted.current=true;
    void finish();
  },[autoClaim,busy,complete,earned,finish,saving]);
  return <div className={styles.panel}>
    <div className={styles.eyebrow}>Lesson checkpoint</div>
    {earned!==null ? <div role="status">
      <h3 className={styles.heading}>Checkpoint complete.</h3>
      <div className={styles.reward}>{earned>0?`+${earned} XP`:'Progress saved'}</div>
      {earned===40 ? <p className={styles.success}>Perfect first attempt · Secret +5 XP</p> : null}
      {earned===35 ? <p className={styles.success}>80%+ on your first attempt · Bonus +5 XP</p> : null}
      <p className={styles.muted}>{earned>0?'A little more learned. A little further along.':'You already earned the available XP for this attempt.'}</p>
      <div className={styles.actions}><button className={styles.primary} onClick={()=>window.dispatchEvent(new Event('focus-break'))}>Take a break</button><Link href="/" className={styles.button}>Choose your next lesson</Link><Link href="/leaderboard" className={styles.button}>View leaderboard</Link></div>
    </div> : <>
      <h3 className={styles.heading}>{busy?'Calculating your XP…':status?.reviewReady?'Review for +5 XP':'Turn this lesson into progress.'}</h3>
      <p className={styles.muted}>{status?.reviewReady?'Reset the quiz and answer every question again. Your review XP is awarded automatically.':status?.completed?'Completion XP earned. You can still practice anytime.':'Your checkpoint is saved automatically after the final answer.'}</p>
      <div className={styles.badges}><span className={styles.badge}>20 XP · first completion</span><span className={styles.badge}>10 XP · reach 80%</span><span className={styles.badge}>+5 XP · 80% first try</span><span className={styles.badge}>5 XP · seven-day review</span></div>
      {status?.completed && !status.reviewReady && status.nextReview && <p className={styles.muted} style={{marginTop:12}}>Next review reward: {new Date(status.nextReview).toLocaleDateString(undefined,{month:'short',day:'numeric'})}. {status.bonus?'Accuracy bonus earned.':'The accuracy bonus is still available.'}</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      <div className={styles.actions}>
        {error ? <button className={styles.primary} disabled={!complete||saving||busy} onClick={finish}>{busy?'Calculating XP…':'Retry XP'}</button> : null}
        <span role="status" className={styles.muted}>{saving?'Saving your answers…':busy?'Checking completion and accuracy…':complete&&autoClaim?'Your answers are saved. Calculating the reward…':'Answer every question to complete the lesson.'}</span>
      </div>
    </>}
  </div>;
}
