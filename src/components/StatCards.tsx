import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { decide } from '../lib/decide';
import { WorkflowGraph } from './WorkflowGraph';

interface Booking {
  id: number;
  customer: string;
  kind: string;
  form: string;
  memo: string;
  date: string;
  decision: string;
  slots_wanted: string;
  slot_assigned?: string | null;
  reason?: string | null;
  candidate?: string | null;
  trace?: string | null;
}

const DECISION_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-800',
  confirmed_auto: 'bg-green-100 text-green-800',
  confirmed_human: 'border-2 border-green-600 text-green-800 bg-white',
  review: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  asking: 'bg-blue-100 text-blue-800',
};

const DECISION_LABELS: Record<string, string> = {
  pending: '대기',
  confirmed_auto: '확정(자동)',
  confirmed_human: '확정(수동)',
  review: '검토',
  rejected: '기각',
  asking: '입력대기',
};

export function StatCards({ refreshKey }: { refreshKey: number }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stateCounts, setStateCounts] = useState<Record<string, number>>({
    intake: 0,
    pending: 0,
    judge: 0,
    confirmed_auto: 0,
    confirmed_human: 0,
    review: 0,
    rejected: 0,
    asking: 0,
  });
  const [autoJudge, setAutoJudge] = useState(() => {
    const saved = localStorage.getItem('auto-judge');
    return saved ? JSON.parse(saved) : true;
  });
  const [lastDecisionPath, setLastDecisionPath] = useState<string>();
  const [animatingPath, setAnimatingPath] = useState(false);

  useEffect(() => {
    localStorage.setItem('auto-judge', JSON.stringify(autoJudge));
  }, [autoJudge]);

  useEffect(() => {
    fetchBookings();
    const channel = supabase
      .channel('bookings-board')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshKey]);

  async function fetchBookings() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, customer, kind, form, memo, date, decision, slots_wanted, slot_assigned, reason, candidate, trace, status')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const bookingList = (data || []) as Booking[];
      setBookings(bookingList);

      const counts: Record<string, number> = {
        intake: bookingList.length,
        pending: bookingList.filter((b) => b.decision === 'pending').length,
        judge: 0,
        confirmed_auto: bookingList.filter((b) => b.decision === 'confirmed_auto').length,
        confirmed_human: bookingList.filter((b) => b.decision === 'confirmed_human').length,
        review: bookingList.filter((b) => b.decision === 'review').length,
        rejected: bookingList.filter((b) => b.decision === 'rejected').length,
        asking: bookingList.filter((b) => b.decision === 'asking').length,
      };
      setStateCounts(counts);
    } catch (error) {
      console.error('예약 조회 실패:', error);
    }
  }

  async function handleJudgeAll() {
    try {
      const pendingBookings = bookings
        .filter((b) => b.decision === 'pending')
        .sort((a, b) => Number(a.id) - Number(b.id));
      let workingBookings = JSON.parse(JSON.stringify(bookings));

      // 1단계: 동점 예약 사전 감지 (같은 날, 같은 종류, 희망 슬롯 1개만, 둘 다 pending)
      const reviewPairs = new Set<number>();
      for (let i = 0; i < pendingBookings.length; i++) {
        for (let j = i + 1; j < pendingBookings.length; j++) {
          const a = pendingBookings[i];
          const b = pendingBookings[j];

          // 둘 다 pending이어야 함
          if (a.decision !== 'pending' || b.decision !== 'pending') continue;

          // 같은 날짜, 같은 종류
          if (a.date !== b.date || a.kind !== b.kind) continue;

          // 희망 슬롯 정확히 1개씩, 동일
          const aWanted = a.slots_wanted.split(',').map((s: string) => s.trim());
          const bWanted = b.slots_wanted.split(',').map((s: string) => s.trim());

          if (aWanted.length === 1 && bWanted.length === 1 && aWanted[0] === bWanted[0]) {
            reviewPairs.add(a.id);
            reviewPairs.add(b.id);
          }
        }
      }

      // 2단계: 각 예약 판정 (workingBookings 순차 갱신)
      for (const booking of pendingBookings) {
        const isReviewPair = reviewPairs.has(booking.id);
        let result;

        if (isReviewPair) {
          const pairBooking = pendingBookings.find(
            (b: any) =>
              b.date === booking.date &&
              b.kind === booking.kind &&
              b.slots_wanted === booking.slots_wanted &&
              b.id !== booking.id
          );

          result = {
            decision: 'review' as const,
            reason: `동점 - ${pairBooking?.customer}도 같은 칸이 유일 후보`,
            options: [booking.customer, pairBooking?.customer].filter(Boolean).join(','),
            trace: ['1 빈 칸 검사: 없음', '5 같은 날 대기 요청 비교: 같은 칸이 유일 후보 (사전 감지)', '결과: 검토 필요 - 동점'],
          };
        } else {
          const decisionContext = workingBookings.filter(
            (b: any) => b.id === booking.id || b.decision !== 'pending'
          );
          result = decide(booking, decisionContext, autoJudge);
        }

        const updateData: any = {
          decision: result.decision,
          reason: result.reason,
        };
        if (result.options) updateData.options = result.options;

        // candidate 저장: 배열이면 '+'로 연결
        if (result.candidate) {
          if (Array.isArray(result.candidate)) {
            updateData.candidate = result.candidate.join('+');
          } else {
            updateData.candidate = result.candidate;
          }
        }

        // slot_assigned 저장
        if (result.slotAssigned) {
          updateData.slot_assigned = result.slotAssigned;
        } else if (result.candidate && !Array.isArray(result.candidate)) {
          updateData.slot_assigned = result.candidate;
        } else if (result.candidate && Array.isArray(result.candidate)) {
          updateData.slot_assigned = result.candidate.join('+');
        }

        // confirmed_auto인 경우 status 업데이트
        if (result.decision === 'confirmed_auto') {
          updateData.status = 'confirmed';
        }

        if (result.trace && result.trace.length > 0) {
          updateData.trace = result.trace.join('\n');
        }

        const { error: updateError } = await supabase.from('bookings').update(updateData).eq('id', booking.id);
        if (updateError) {
          console.error('판정 저장 오류:', updateError);
          throw updateError;
        }

        // workingBookings 갱신
        const workingIdx = workingBookings.findIndex((b: any) => b.id === booking.id);
        if (workingIdx >= 0) {
          workingBookings[workingIdx] = {
            ...workingBookings[workingIdx],
            decision: result.decision,
            slot_assigned: updateData.slot_assigned || null,
            status: updateData.status || workingBookings[workingIdx].status,
          };
        }

        setLastDecisionPath(`pending-${result.decision}`);
        setAnimatingPath(true);
      }

      fetchBookings();
    } catch (error) {
      console.error('판정 실패:', error);
    }
  }

  const getDecisionCard = (booking: Booking) => {
    const bgColor = DECISION_COLORS[booking.decision] || 'bg-gray-50';

    return (
      <div key={booking.id} className={`${bgColor} p-2 rounded border text-xs`}>
        <p className="font-semibold text-gray-900 truncate">{booking.customer}</p>
        <p className="text-gray-600 text-xs mt-0.5">{booking.date}</p>
        <p className="text-gray-600 text-xs">{booking.kind} / {booking.form}</p>
        <p className="text-gray-600 text-xs truncate">{booking.memo}</p>
        {booking.slot_assigned && <p className="font-semibold mt-0.5 text-gray-900 text-xs">{booking.slot_assigned}</p>}
        {booking.decision === 'review' && booking.reason && (
          <p className="text-gray-600 mt-0.5 line-clamp-1 text-xs">{booking.reason}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded border border-gray-200 shadow-sm" style={{ boxShadow: '0 2px 8px rgba(0, 11, 80, 0.08)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoJudge}
                onChange={(e) => setAutoJudge(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-900">자동 판정</span>
            </label>
          </div>
          <button
            onClick={handleJudgeAll}
            className="px-4 py-2 bg-[#1d6ae5] text-white rounded font-medium hover:bg-[#1560c8] transition"
          >
            전부 판정
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded border border-gray-200 shadow-sm" style={{ boxShadow: '0 2px 8px rgba(0, 11, 80, 0.08)' }}>
        <h3 className="text-sm font-bold text-gray-900 mb-3">상태</h3>
        <div className="grid grid-cols-6 gap-3">
          {(['pending', 'confirmed_auto', 'confirmed_human', 'review', 'rejected', 'asking'] as const).map((state) => {
            const stateBookings = bookings.filter((b) => b.decision === state);
            return (
              <div key={state} className="flex flex-col p-3 bg-white rounded border border-gray-200">
                <h4 className="text-xs font-bold text-gray-900 mb-2">{DECISION_LABELS[state]}</h4>
                <p className="text-2xl font-bold text-[#1d6ae5] mb-2">{stateBookings.length}</p>
                <div className="space-y-1 overflow-y-auto max-h-40 flex-1">
                  {stateBookings.length === 0 ? (
                    <p className="text-xs text-gray-400">-</p>
                  ) : (
                    stateBookings.map((booking) => getDecisionCard(booking))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <WorkflowGraph
        stateCounts={stateCounts}
        lastDecisionPath={lastDecisionPath}
        animatingPath={animatingPath}
      />
    </div>
  );
}
