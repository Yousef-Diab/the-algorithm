'use client';
import { useEffect, useState } from 'react';
import { remainingSeconds, restoreTimer, type TimerState } from '@/lib/rewards/focus';
import styles from './rewards.module.css';

export function FocusTimer({lessonId}:{lessonId:string}) {
  const key = `algorithm-focus:${lessonId}`;
  const [timer,setTimer] = useState<TimerState|null>(null);
  const [ready,setReady] = useState(false);
  const [minutes,setMinutes] = useState(15);
  const [hidden,setHidden] = useState(false);
  const [now,setNow] = useState(0);
  const [rewarded,setRewarded] = useState(false);
  const [checking,setChecking] = useState(false);
  const [inView,setInView] = useState(true);
  useEffect(()=>{
    const target=document.getElementById(`focus-${lessonId}`);
    const observer=new IntersectionObserver(([entry])=>setInView(entry.isIntersecting));
    if(target) observer.observe(target);
    return()=>observer.disconnect();
  },[lessonId]);
  useEffect(() => {
    let active=true;
    Promise.resolve().then(()=>{
      if(!active) return;
      try {setTimer(restoreTimer(localStorage.getItem(key)));} catch { /* timer still works without storage */ }
      setNow(Date.now()); setReady(true);
    });
    const tick = setInterval(()=>setNow(Date.now()),1000);
    const sync = (e:StorageEvent) => {if(e.key===key) {setTimer(restoreTimer(e.newValue));setNow(Date.now());}};
    const reward = () => {setTimer(null);setRewarded(true);};
    const takeBreak = () => {
      const time=Date.now();setNow(time);setTimer({phase:'break',endsAt:time+300000,remaining:300});
      document.getElementById(`focus-${lessonId}`)?.scrollIntoView({block:'center'});
    };
    window.addEventListener('storage',sync);
    window.addEventListener('checkpoint-completed',reward);
    window.addEventListener('focus-break',takeBreak);
    return ()=>{active=false;clearInterval(tick);window.removeEventListener('storage',sync);window.removeEventListener('checkpoint-completed',reward);window.removeEventListener('focus-break',takeBreak);};
  },[key,lessonId]);
  useEffect(()=>{
    if(!ready) return;
    try {if(timer) localStorage.setItem(key,JSON.stringify(timer)); else localStorage.removeItem(key);} catch { /* optional persistence */ }
  },[key,timer,ready]);

  const remaining = timer ? remainingSeconds(timer,now) : 0;
  const expired = timer!==null && remaining===0;
  function start(seconds:number,phase:TimerState['phase']='focus') {
    const time=Date.now();setNow(time);setRewarded(false);setChecking(false);
    setTimer({phase,endsAt:time+seconds*1000,remaining:seconds});
  }
  function checkpoint() {
    setChecking(true);
    if(timer) setTimer({...timer,remaining:remainingSeconds(timer,Date.now()),endsAt:null});
    const target=document.getElementById(`checkpoint-${lessonId}`);
    target?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    target?.focus({preventScroll:true});
  }
  function togglePause() {
    if(!timer) return;
    if(timer.endsAt===null) start(remaining,timer.phase);
    else setTimer({...timer,endsAt:null,remaining:remainingSeconds(timer,Date.now())});
  }
  const clockText=`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`;
  return <><section id={`focus-${lessonId}`} className={styles.panel} aria-label="Focus session">
    <div className={styles.row}>
      <div><div className={styles.eyebrow}>One lesson, one session</div><h2 className={styles.heading}>Make room to focus.</h2></div>
      {timer && <button className={styles.button} onClick={()=>setHidden(!hidden)}>{hidden?'Show countdown':'Hide countdown'}</button>}
    </div>
    <div className={styles.steps}><span className={!rewarded&&!checking?styles.active:''}>01 Focus</span><span className={checking&&!rewarded?styles.active:''}>02 Check yourself</span><span className={rewarded?styles.active:''}>03 Reward</span></div>
    {!timer ? <>
      <p className={styles.muted}>{rewarded?'Checkpoint saved. Enjoy a break or choose your next lesson.':'Choose a little time for this lesson. Pause whenever you need to.'}</p>
      <div className={styles.actions}>{[5,10,15,25].map(m=><button key={m} className={styles.choice} aria-pressed={m===minutes} onClick={()=>setMinutes(m)}>{m} min</button>)}</div>
      <div className={styles.actions}><button className={styles.primary} disabled={!ready} onClick={()=>start(minutes*60)}>Start focus</button><button className={styles.button} onClick={()=>start(300,'break')}>Take a break</button></div>
    </> : <>
      <div className={styles.clock}>
        {!hidden && <div className={styles.dial}><span role="timer" aria-label="Time remaining" className={styles.time}>{clockText}</span></div>}
        <div><strong>{timer.phase==='break'?'Take a breath.':'Stay with this lesson.'}</strong><p className={styles.muted}>{timer.endsAt===null?'Paused. Your place is safe.':timer.phase==='break'?'Step away. Your lesson will be here.':'Read, watch, or study a chart at your own pace.'}</p></div>
      </div>
      <p role="status" className={styles.success}>{expired?(timer.phase==='break'?'Ready when you are.':'Time to finish up.'):''}</p>
      <div className={styles.actions}>
        {!expired && <button className={styles.button} onClick={togglePause}>{timer.endsAt===null?'Resume':'Pause'}</button>}
        {expired && timer.phase==='focus' && <button className={styles.button} onClick={()=>start(300)}>Add 5 minutes</button>}
        {timer.phase==='focus' && <button className={styles.primary} onClick={checkpoint}>Finish up</button>}
        {timer.phase==='focus' ? <button className={styles.button} onClick={()=>start(300,'break')}>Take a break</button> : <button className={styles.primary} onClick={()=>start(minutes*60)}>Start focus</button>}
        <button className={styles.button} onClick={()=>setTimer(null)}>End session</button>
      </div>
    </>}
    <p className={styles.muted} style={{marginTop:16}}>XP comes from the lesson checkpoint. The timer is just for you.</p>
  </section>
  {timer&&!inView && <section className={styles.dock} aria-label="Active focus timer">
    <div><span className={styles.eyebrow}>{timer.phase==='break'?'Break':'Focus'}</span><div style={{fontVariantNumeric:'tabular-nums'}}>{expired?'Time to finish up':hidden?'One lesson at a time':clockText}</div></div>
    {!expired && <button className={styles.button} onClick={togglePause}>{timer.endsAt===null?'Resume':'Pause'}</button>}
    <button className={styles.primary} onClick={()=>document.getElementById(`focus-${lessonId}`)?.scrollIntoView({block:'center'})}>Show session</button>
  </section>}
  </>;
}
