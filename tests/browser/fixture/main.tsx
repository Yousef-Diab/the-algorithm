import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import { FocusTimer } from '@/components/rewards/FocusTimer';
import { Quiz } from '@/components/quiz/Quiz';
import { RewardSummaryCard } from '@/components/rewards/RewardSummary';
import { LeaderboardTable } from '@/components/rewards/LeaderboardTable';
import { LearnerSettings } from '@/components/rewards/LearnerSettings';

createRoot(document.getElementById('root')!).render(<main style={{maxWidth:880,margin:'0 auto',padding:'24px'}}>
  <header className="lesson-hero"><div className="crumb">THE ALGORITHM · LEARNING REWARDS</div><h1>One lesson. One step forward.</h1></header>
  <RewardSummaryCard summary={{xp:230,today:30,completed:7,reviews:4}}/>
  <FocusTimer lessonId="fixture"/>
  <Quiz lessonId="fixture"/>
  <h1 style={{marginTop:48}}>Leaderboard</h1>
  <LeaderboardTable rows={[
    {rank:1,name:'Chart Student',avatar:'◈',xp:320,totalXp:1320,completed:35,isMe:false},
    {rank:2,name:'You',avatar:'✦',xp:230,totalXp:230,completed:7,isMe:true},
    {rank:3,name:'Patient Learner',avatar:'◆',xp:180,totalXp:780,completed:22,isMe:false},
  ]}/>
  <LearnerSettings profile={{name:'You',avatar:'✦',visible:true}}/>
</main>);
