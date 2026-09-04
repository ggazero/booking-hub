import { SLOTS, requiredSlots, occupied } from './slots';
import type { Slot } from './slots';

export interface DecideResult {
  decision: 'asking' | 'pending' | 'confirmed_auto' | 'confirmed_human' | 'review' | 'rejected';
  reason: string;
  candidate?: string;
  options?: string;
  slotAssigned?: string;
  trace: string[];
}

export function decide(
  booking: any,
  allBookings: any[],
  autoOn: boolean
): DecideResult {
  const trace: string[] = [];

  // 1. 빈 칸 검사
  const missing: string[] = [];
  if (!booking.kind) missing.push('종류');
  if (!booking.date) missing.push('날짜');
  if (!booking.slots_wanted || booking.slots_wanted.length === 0) missing.push('희망 슬롯');

  if (missing.length > 0) {
    trace.push(`1 빈 칸 검사: ${missing.join(', ')}`);
    return {
      decision: 'asking',
      reason: `빈 칸: ${missing.join(', ')}`,
      trace,
    };
  }

  trace.push('1 빈 칸 검사: 없음');

  // 2. 필요한 칸 계산
  const wantedSlots: Slot[] = booking.slots_wanted.split(',').map((s: string) => s.trim() as Slot);
  const needed = requiredSlots(booking.kind, wantedSlots);
  trace.push(`2 종류 ${booking.kind} -> 필요한 칸 ${needed.length}개 (희망 ${wantedSlots.join(', ')})`);

  // 3. 그 날짜의 점유된 칸 확인
  const confirmedBookings = allBookings.filter(
    (b: any) =>
      b.date === booking.date &&
      b.id !== booking.id &&
      (b.decision === 'confirmed_auto' || b.decision === 'confirmed_human')
  );
  const occupiedSlots = occupied(booking.date, confirmedBookings);

  const occupiedDesc = SLOTS.map((s) => (occupiedSlots.has(s) ? `${s} X` : `${s} O`)).join(', ');
  trace.push(`3 ${booking.date} 달력: ${occupiedDesc}`);

  // 4. 후보 모으기 (희망 순서대로)
  const candidates: Slot[] = [];
  for (const wanted of wantedSlots) {
    const required = requiredSlots(booking.kind, [wanted]);
    const allFree = required.every((slot) => !occupiedSlots.has(slot));
    if (allFree) {
      candidates.push(...required);
      break;
    }
  }

  if (candidates.length === 0) {
    const availableSlots = SLOTS.filter((s) => !occupiedSlots.has(s));
    trace.push(`4 희망 슬롯 후보 없음`);
    trace.push(`결과: 거절 - 희망 슬롯 전부 찼음`);
    return {
      decision: 'rejected',
      reason: '희망 슬롯 전부 찼음',
      options: availableSlots.join(','),
      trace,
    };
  }

  const candidateDesc = candidates.join('+');
  trace.push(`4 희망 순서대로 필요한 칸이 전부 비어있는 후보: ${candidateDesc}`);

  // 5. 같은 날짜의 다른 pending 예약과 충돌 검사
  const sameDayPending = allBookings.filter(
    (b: any) =>
      b.date === booking.date &&
      b.id !== booking.id &&
      b.decision === 'pending'
  );

  let reviewTarget: any = null;

  for (const other of sameDayPending) {
    const otherWanted: Slot[] = other.slots_wanted.split(',').map((s: string) => s.trim() as Slot);
    const otherCandidates: Slot[] = [];

    for (const wanted of otherWanted) {
      const required = requiredSlots(other.kind, [wanted]);
      const allFree = required.every((slot) => !occupiedSlots.has(slot));
      if (allFree) {
        otherCandidates.push(...required);
        break;
      }
    }

    if (otherCandidates.length === 1 && candidates.length === 1) {
      if (otherCandidates[0] === candidates[0]) {
        reviewTarget = other;
        break;
      }
    }
  }

  if (reviewTarget) {
    const options = [booking.customer, reviewTarget.customer].join(',');
    trace.push(`5 같은 날 대기 요청 비교: 겹치는 유일 후보 ${candidateDesc} - ${reviewTarget.customer}`);
    trace.push(`결과: 검토 필요 - 동점`);
    return {
      decision: 'review',
      reason: `동점 - ${reviewTarget.customer}도 같은 칸이 유일 후보`,
      options,
      trace,
    };
  }

  trace.push(`5 같은 날 대기 요청 비교: 겹치는 유일 후보 없음`);

  if (autoOn) {
    trace.push(`결과: 확정-자동 - ${candidateDesc}`);
    return {
      decision: 'confirmed_auto',
      slotAssigned: candidateDesc,
      reason: `빈 칸 ${candidateDesc} 확정`,
      trace,
    };
  } else {
    trace.push(`결과: 대기-수동확정 - 후보 ${candidateDesc}`);
    return {
      decision: 'pending',
      candidate: candidateDesc,
      reason: `후보 ${candidateDesc} - 확정 버튼 대기`,
      trace,
    };
  }
}
