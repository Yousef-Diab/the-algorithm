export const AVATARS = ['◆','✦','◈','▲','●','✺'] as const;
export interface RewardSummary {
  xp:number; today:number; completed:number; reviews:number;
}
export interface CheckpointStatus {
  completed:boolean; bonus:boolean; reviewReady:boolean; nextReview:string|null;
}
export interface LeaderboardEntry {
  rank:number; name:string; avatar:string; xp:number; totalXp:number; completed:number; isMe:boolean;
}
export interface LearnerProfile { name:string; avatar:string; visible:boolean }
export const levelFor = (xp:number) => 1+Math.floor(Math.max(0,xp)/100);
