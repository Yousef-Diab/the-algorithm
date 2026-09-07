import { expect, it } from 'vitest';
import { remainingSeconds, restoreTimer } from '@/lib/rewards/focus';
it('uses a wall clock deadline after a background tab or sleep', () => {
  expect(remainingSeconds({phase:'focus',endsAt:310000,remaining:300},10000)).toBe(300);
  expect(remainingSeconds({phase:'focus',endsAt:310000,remaining:300},400000)).toBe(0);
});
it('keeps paused time unchanged', () => {
  expect(remainingSeconds({phase:'focus',endsAt:null,remaining:83},9999999)).toBe(83);
});
it('rejects malformed or unbounded persisted state', () => {
  expect(restoreTimer('{bad')).toBeNull();
  expect(restoreTimer('{"phase":"focus","endsAt":null,"remaining":-1}')).toBeNull();
  expect(restoreTimer('{"phase":"focus","endsAt":null,"remaining":83}')).toMatchObject({remaining:83});
});
