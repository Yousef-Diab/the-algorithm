'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateLearnerProfile } from '@/app/actions/rewards';
import { AVATARS, type LearnerProfile } from '@/lib/rewards/types';
import styles from './rewards.module.css';
export function LearnerSettings({profile}:{profile:LearnerProfile}) {
  const [name,setName]=useState(profile.name);
  const [avatar,setAvatar]=useState(profile.avatar);
  const [visible,setVisible]=useState(profile.visible);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [failed,setFailed]=useState(false);
  const router=useRouter();
  return <section className={styles.panel} aria-label="Leaderboard profile">
    <div className={styles.eyebrow}>Your player profile</div><h2 className={styles.heading}>Choose how you show up.</h2>
    <p className={styles.muted}>Members see your name, avatar, XP and lesson count. Your email, notes and answers stay private.</p>
    <form className={styles.form} onSubmit={async e=>{
      e.preventDefault();if(busy)return;setBusy(true);setMessage('');
      try {await updateLearnerProfile(name,avatar,visible);setFailed(false);setMessage('Profile saved.');router.refresh();}
      catch {setFailed(true);setMessage('Could not save. Use a name of 2–24 characters without an email, then try again.');}
      finally {setBusy(false);}
    }}>
      <label>Display name<input className={styles.input} value={name} onChange={e=>setName(e.target.value)} minLength={2} maxLength={24} required autoComplete="nickname"/></label>
      <fieldset style={{border:0}}><legend className={styles.muted}>Avatar</legend><div className={styles.actions} style={{marginTop:6}}>{AVATARS.map((a,i)=><button key={a} type="button" className={styles.choice} aria-label={`Avatar ${i+1}`} aria-pressed={a===avatar} onClick={()=>setAvatar(a)}>{a}</button>)}</div></fieldset>
      <label className={styles.checkbox}><input type="checkbox" checked={visible} onChange={e=>setVisible(e.target.checked)}/> Show me on the member leaderboard</label>
      <p className={styles.muted}>Hiding your entry keeps all your personal XP and badges.</p>
      <div><button className={styles.primary} disabled={busy}>{busy?'Saving…':'Save profile'}</button></div>
      {message && <p role={failed?'alert':'status'} className={failed?styles.error:styles.success}>{message}</p>}
    </form>
  </section>;
}
