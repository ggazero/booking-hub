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
  slot_assigned?: string | null;
  reason?: string | null;
  trace?: string | null;
}

interface DecisionLog {
  time: string;
  customer: string;
  decision: string;
  trace: string[];
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
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
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
        .select('*')
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
      const pendingBookings = bookings.filter((b) => b.decision === 'pending');

      for (const booking of pendingBookings) {
        const result = decide(booking, bookings, autoJudge);

        const updateData: any = {
          decision: result.decision,
          reason: result.reason,
        };
        if (result.options) updateData.options = result.options;
        if (result.slotAssigned) updateData.slot_assigned = result.slotAssigned;
        if (result.trace && result.trace.length > 0) {
          updateData.trace = result.trace.join('\n');
        }

        await supabase.from('bookings').update(updateData).eq('id', booking.id);

        const log: DecisionLog = {
          time: new Date().toLocaleTimeString('ko-KR'),
          customer: booking.customer,
          decision: result.decision,
          trace: result.trace,
        };
        setDecisionLogs((prev) => [log, ...prev.slice(0, 11)]);

        setLastDecisionPath(`pending-${result.decision}`);
        setAnimatingPath(true);
      }

      fetchBookings();
    } catch (error) {
      console.error('판정 실패:', error);
    }
  }

  const getDecisionCard = (booking: Booking) => {
    const bgColor = DECISION_COLORS[booking.decision] || 'bg-gray-100 text-gray-800';

    return (
      <div key={booking.id} className={`${bgColor} p-2 rounded border text-xs`}>
        <p className="font-bold">{booking.customer}</p>
        <p className="text-gray-600">{booking.date}</p>
        <p className="text-gray-600">{booking.kind} / {booking.form}</p>
        <p className="text-gray-600 truncate">{booking.memo}</p>
        {booking.slot_assigned && <p className="font-medium mt-0.5">{booking.slot_assigned}</p>}
        {booking.decision === 'review' && booking.reason && (
          <p className="text-gray-500 mt-0.5 line-clamp-2">{booking.reason}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoJudge}
                onChange={(e) => setAutoJudge(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700">자동 판정</span>
            </label>
          </div>
          <button
            onClick={handleJudgeAll}
            className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
          >
            전부 판정
          </button>
        </div>
      </div>

      <WorkflowGraph
        stateCounts={stateCounts}
        lastDecisionPath={lastDecisionPath}
        animatingPath={animatingPath}
      />

      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-2">판정 로그 (최근 12건)</h3>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {decisionLogs.length === 0 ? (
            <p className="text-sm text-gray-500">판정 이력이 없습니다</p>
          ) : (
            decisionLogs.map((log, idx) => (
              <div key={idx} className="text-xs p-1 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-gray-700 flex-shrink-0">{log.time}</span>
                  <span className="text-gray-600 truncate flex-shrink-0">{log.customer}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${DECISION_COLORS[log.decision]}`}>
                    {DECISION_LABELS[log.decision]}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-6 gap-3">
          {(['pending', 'confirmed_auto', 'confirmed_human', 'review', 'rejected', 'asking'] as const).map((state) => {
            const stateBookings = bookings.filter((b) => b.decision === state);
            return (
              <div key={state} className="flex flex-col">
                <h3 className="text-xs font-bold text-gray-800 mb-2">
                  {DECISION_LABELS[state]} ({stateBookings.length})
                </h3>
                <div className="space-y-1 overflow-y-auto max-h-56 pr-1 flex-1">
                  {stateBookings.length === 0 ? (
                    <p className="text-xs text-gray-400">없음</p>
                  ) : (
                    stateBookings.map((booking) => getDecisionCard(booking))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
