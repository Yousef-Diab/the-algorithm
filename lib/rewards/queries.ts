import 'server-only';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { learnerProfiles } from '@/lib/db/schema';
import { leaderboardQuery, summaryQuery, learnerProfileQuery } from './sql';
import type { CheckpointStatus, LeaderboardEntry, LearnerProfile, RewardSummary } from './types';

export async function claimReward(user:string, lesson:string):Promise<number> {
  const result = await db.execute(sql`select claim_checkpoint(${user},${lesson}) AS xp`);
  return Number(result.rows[0].xp);
}
export async function getRewardSummary(user:string):Promise<RewardSummary> {
  const {rows} = await db.execute(summaryQuery(user));
  const r = rows[0];
  return {xp:Number(r.xp),today:Number(r.today),completed:Number(r.completed),reviews:Number(r.reviews)};
}
export async function getCheckpointStatus(user:string, lesson:string):Promise<CheckpointStatus> {
  const {rows} = await db.execute(sql`SELECT completed_at IS NOT NULL AS completed,bonus_at IS NOT NULL AS bonus,
    last_reward_at<=now()-interval '7 days' AS ready,
    last_reward_at+interval '7 days' AS next FROM checkpoint_rewards WHERE user_id=${user} AND lesson_id=${lesson}`);
  const r = rows[0];
  return r ? {completed:Boolean(r.completed),bonus:Boolean(r.bonus),reviewReady:Boolean(r.ready),nextReview:r.next ? new Date(String(r.next)).toISOString():null}
    : {completed:false,bonus:false,reviewReady:false,nextReview:null};
}
export async function getLeaderboard(user:string):Promise<LeaderboardEntry[]> {
  const {rows} = await db.execute(leaderboardQuery(user));
  return rows.map(r => ({rank:Number(r.rank),name:String(r.name),avatar:String(r.avatar),xp:Number(r.xp),totalXp:Number(r.total_xp),completed:Number(r.completed),isMe:Boolean(r.is_me)}));
}
export async function getLearnerProfile(user:string):Promise<LearnerProfile> {
  const {rows} = await db.execute(learnerProfileQuery(user));
  return {name:String(rows[0].name),avatar:String(rows[0].avatar),visible:Boolean(rows[0].visible)};
}
export async function saveProfile(user:string, displayName:string, avatar:string, visible:boolean) {
  await db.insert(learnerProfiles).values({userId:user,displayName,avatar,visible})
    .onConflictDoUpdate({target:learnerProfiles.userId,set:{displayName,avatar,visible}});
}
