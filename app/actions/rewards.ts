'use server';
import { revalidatePath } from 'next/cache';
import { accessContext } from '@/lib/db/access-queries';
import { getLessonMeta } from '@/lib/content/queries';
import { canRead } from '@/lib/access';
import { claimReward, getCheckpointStatus, getRewardSummary, saveProfile } from '@/lib/rewards/queries';
import { AVATARS } from '@/lib/rewards/types';

async function checkpointUser(lessonId:string) {
  if (typeof lessonId!=='string' || lessonId.length>120) throw new Error('Lesson unavailable');
  const ctx = await accessContext();
  if (!ctx.user) throw new Error('Sign in to earn XP');
  const meta = await getLessonMeta(lessonId);
  if (!meta || meta.kind!=='lesson' || meta.status!=='published' || !canRead({...meta,access:'members'},ctx) || !canRead(meta,ctx)) throw new Error('Lesson unavailable');
  return ctx.user.id;
}
export async function finishCheckpoint(lessonId:string) {
  const user = await checkpointUser(lessonId);
  const xp = await claimReward(user,lessonId);
  revalidatePath('/');
  revalidatePath('/leaderboard');
  return {xp};
}
export async function loadCheckpointStatus(lessonId:string) {
  const user = await checkpointUser(lessonId);
  return getCheckpointStatus(user,lessonId);
}
export async function loadRewardSummary() {
  const ctx = await accessContext();
  if (!ctx.user) return null;
  return getRewardSummary(ctx.user.id);
}
export async function updateLearnerProfile(name:string, avatar:string, visible:boolean) {
  const ctx = await accessContext();
  if (!ctx.user || (!ctx.isAdmin && ctx.entitlements.length===0)) throw new Error('Membership required');
  if (typeof name!=='string' || name.trim().length<2 || name.trim().length>24 || /[@\p{Cc}\p{Cf}]/u.test(name) ||
    !AVATARS.some(a=>a===avatar) || typeof visible!=='boolean') throw new Error('Use a name of 2–24 characters without an email, and choose an avatar.');
  await saveProfile(ctx.user.id,name.trim(),avatar,visible);
  revalidatePath('/leaderboard');
}
