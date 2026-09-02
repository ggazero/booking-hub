import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Booking {
  date: string;
  status: string;
}

export function StatCards({ refreshKey }: { refreshKey: number }) {
  const [todayCount, setTodayCount] = useState(0);
  const [confirmRate, setConfirmRate] = useState(0);
  const [weekCount, setWeekCount] = useState(0);

  useEffect(() => {
    calculateStats();
  }, [refreshKey]);

  async function calculateStats() {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('date, status');

      if (error) throw error;

      const bookings = (data || []) as Booking[];

      const today = new Date().toISOString().split('T')[0];

      const todayBookings = bookings.filter((b) => b.date === today).length;
      setTodayCount(todayBookings);

      const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length;
      const rate =
        bookings.length > 0
          ? Math.round((confirmedCount / bookings.length) * 1000) / 10
          : 0;
      setConfirmRate(rate);

      const now = new Date();
      const dayOfWeek = now.getDay();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4);
      weekEnd.setHours(23, 59, 59, 999);

      const weekStartStr = weekStart.toISOString().split('T')[0];
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      const weekBookings = bookings.filter(
        (b) => b.date >= weekStartStr && b.date <= weekEndStr
      ).length;
      setWeekCount(weekBookings);
    } catch (error) {
      console.error('통계 계산 실패:', error);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-3xl font-bold text-blue-600">{todayCount}</div>
        <div className="text-gray-600 text-sm mt-2">오늘 예약</div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-3xl font-bold text-green-600">{confirmRate}%</div>
        <div className="text-gray-600 text-sm mt-2">확정률</div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="text-3xl font-bold text-purple-600">{weekCount}</div>
        <div className="text-gray-600 text-sm mt-2">이번 주 총</div>
      </div>
    </div>
  );
}
