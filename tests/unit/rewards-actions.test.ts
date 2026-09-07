import { beforeEach, expect, it, vi } from 'vitest';
const fake = vi.hoisted(() => ({ accessContext:vi.fn(), getLessonMeta:vi.fn(), claimReward:vi.fn(), saveProfile:vi.fn() }));
vi.mock('@/lib/db/access-queries', () => ({accessContext:fake.accessContext}));
vi.mock('@/lib/content/queries', () => ({getLessonMeta:fake.getLessonMeta}));
vi.mock('@/lib/rewards/queries', () => ({claimReward:fake.claimReward, saveProfile:fake.saveProfile, getRewardSummary:vi.fn(), getCheckpointStatus:vi.fn()}));
vi.mock('next/cache', () => ({revalidatePath:vi.fn()}));
import { finishCheckpoint, updateLearnerProfile } from '@/app/actions/rewards';
beforeEach(() => {
  vi.clearAllMocks();
  fake.accessContext.mockResolvedValue({user:{id:'member'},isAdmin:false,entitlements:[{scope:'all',sectionId:null}]});
  fake.getLessonMeta.mockResolvedValue({id:'lesson',sectionId:'s1',access:'members',status:'published',kind:'lesson'});
  fake.claimReward.mockResolvedValue(30);
});
it('rejects anonymous reward claims before touching the ledger', async () => {
  fake.accessContext.mockResolvedValue({user:null,isAdmin:false,entitlements:[]});
  await expect(finishCheckpoint('lesson')).rejects.toThrow();
  expect(fake.claimReward).not.toHaveBeenCalled();
});
it('rejects signed-in users without lesson membership', async () => {
  fake.accessContext.mockResolvedValue({user:{id:'member'},isAdmin:false,entitlements:[]});
  await expect(finishCheckpoint('lesson')).rejects.toThrow();
  expect(fake.claimReward).not.toHaveBeenCalled();
});
it('rejects exams and drafts even for admins', async () => {
  fake.getLessonMeta.mockResolvedValue({sectionId:'s1',access:'members',status:'draft',kind:'lesson'});
  await expect(finishCheckpoint('lesson')).rejects.toThrow();
  fake.getLessonMeta.mockResolvedValue({sectionId:'s1',access:'members',status:'published',kind:'exam'});
  await expect(finishCheckpoint('lesson')).rejects.toThrow();
});
it('takes user identity only from authentication, and XP only from storage', async () => {
  expect(await finishCheckpoint('lesson')).toEqual({xp:30});
  expect(fake.claimReward).toHaveBeenCalledWith('member','lesson');
});
it('validates names, avatars and visibility before storing a profile', async () => {
  await expect(updateLearnerProfile('person@example.com','◆',true)).rejects.toThrow();
  await expect(updateLearnerProfile('Player','https://tracker.test',true)).rejects.toThrow();
  await expect(updateLearnerProfile('Player','◆','false' as unknown as boolean)).rejects.toThrow();
  expect(fake.saveProfile).not.toHaveBeenCalled();
  await updateLearnerProfile('  Player  ','◆',false);
  expect(fake.saveProfile).toHaveBeenCalledWith('member','Player','◆',false);
});
