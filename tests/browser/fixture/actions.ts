export async function loadCheckpointStatus() {return {completed:false,bonus:false,reviewReady:false,nextReview:null};}
export async function finishCheckpoint() {
  if(sessionStorage.getItem('fail-claim')) throw new Error('Offline');
  const claimed = sessionStorage.getItem('claimed');
  sessionStorage.setItem('claimed','1');
  return {xp:claimed?0:40};
}
export async function updateLearnerProfile() { if(sessionStorage.getItem('fail-profile')) throw new Error('Offline'); }
export async function loadRewardSummary() { return {xp:230,today:30,completed:7,reviews:4}; }
