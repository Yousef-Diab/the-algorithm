export type TimerState = { phase: 'focus' | 'break'; endsAt: number | null; remaining: number };
export function remainingSeconds(state: TimerState, now: number): number {
  return state.endsAt === null ? state.remaining : Math.max(0, Math.ceil((state.endsAt-now)/1000));
}
export function restoreTimer(raw: string | null): TimerState | null {
  try {
    const s = JSON.parse(raw ?? 'null');
    if (!s || !['focus','break'].includes(s.phase) || !Number.isFinite(s.remaining) || s.remaining<0 || s.remaining>86400 ||
      (s.endsAt!==null && (!Number.isFinite(s.endsAt) || s.endsAt<0))) return null;
    return {phase:s.phase,endsAt:s.endsAt,remaining:s.remaining};
  } catch { return null; }
}
