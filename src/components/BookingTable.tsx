import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { decide } from '../lib/decide';

interface Booking {
  id: number;
  customer: string;
  kind: string;
  form: string;
  memo: string;
  date: string;
  time: string;
  address: string;
  slots_wanted: string;
  status: string;
  decision: string;
  reason?: string | null;
  options?: string | null;
  slot_assigned?: string | null;
  trace?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface MapBooking extends Booking {
  latitude: number;
  longitude: number;
}

interface BookingTableProps {
  refreshKey: number;
  onBookingSelect?: (booking: MapBooking | null) => void;
  selectedBookingId?: number | null;
  mode?: 'list' | 'review';
}

export function BookingTable({ refreshKey, onBookingSelect, selectedBookingId, mode = 'list' }: BookingTableProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [geocodingId, setGeocodingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [refreshKey]);

  async function fetchBookings() {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select('id, customer, kind, form, memo, date, time, address, slots_wanted, status, decision, reason, options, slot_assigned, trace, latitude, longitude')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setBookings(data || []);
    } catch (error) {
      console.error('목록 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  }

  async function geocodeAddress(address: string): Promise<{ lat: number; lon: number } | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = (await response.json()) as Array<{ lat: string; lon: string }>;

      if (data.length === 0) {
        return null;
      }

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    } catch (err) {
      console.error('지오코딩 실패:', err);
      return null;
    }
  }

  async function handleRowClick(booking: Booking) {
    if (!booking.address) {
      setError('주소 정보 없음');
      onBookingSelect?.(null);
      return;
    }

    setError('');

    let mapBooking: MapBooking;

    if (booking.latitude !== null && booking.latitude !== undefined &&
        booking.longitude !== null && booking.longitude !== undefined) {
      mapBooking = {
        ...booking,
        latitude: booking.latitude,
        longitude: booking.longitude,
      };
      onBookingSelect?.(mapBooking);
    } else {
      setGeocodingId(booking.id);

      const coords = await geocodeAddress(booking.address);

      if (!coords) {
        setError('주소를 찾을 수 없습니다');
        onBookingSelect?.(null);
        setGeocodingId(null);
        return;
      }

      mapBooking = {
        ...booking,
        latitude: coords.lat,
        longitude: coords.lon,
      };

      onBookingSelect?.(mapBooking);
      setGeocodingId(null);
    }
  }

  async function toggleStatus(id: number, currentStatus: string) {
    const newStatus = currentStatus === 'pending' ? 'confirmed' : 'pending';
    try {
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);

      if (updateError) throw updateError;
      fetchBookings();
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  }

  async function executeDecision(bookingId: number) {
    try {
      const booking = bookings.find((b) => b.id === bookingId);
      if (!booking) return;

      const result = decide(booking, bookings, false);

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

      if (result.slotAssigned) updateData.slot_assigned = result.slotAssigned;
      if (result.trace && result.trace.length > 0) {
        updateData.trace = result.trace.join('\n');
      }

      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', bookingId);

      if (updateError) {
        console.error('판정 저장 오류:', updateError);
        throw updateError;
      }
      fetchBookings();
    } catch (error) {
      console.error('판정 실패:', error);
    }
  }

  async function updateDecision(id: number, newDecision: string, slotAssigned?: string) {
    try {
      const updateData: any = { decision: newDecision };
      if (slotAssigned) {
        updateData.slot_assigned = slotAssigned;
      }
      const { error: updateError } = await supabase
        .from('bookings')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;
      fetchBookings();
    } catch (error) {
      console.error('상태 변경 실패:', error);
    }
  }

  const displayBookings = mode === 'review'
    ? bookings.filter((b: any) => ['pending', 'review', 'rejected', 'asking'].includes(b.decision))
    : bookings;

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (displayBookings.length === 0) {
    return <div className="text-center py-8 text-gray-500">
      {mode === 'review' ? '미확정 예약이 없습니다' : '예약이 없습니다'}
    </div>;
  }

  if (mode === 'review') {
    const getDecisionBadge = (decision: string) => {
      const badgeMap: Record<string, string> = {
        pending: 'bg-gray-100 text-gray-800',
        confirmed_auto: 'bg-green-100 text-green-800',
        confirmed_human: 'border-2 border-green-600 text-green-800 bg-white',
        review: 'bg-yellow-100 text-yellow-800',
        rejected: 'bg-red-100 text-red-800',
        asking: 'bg-blue-100 text-blue-800',
      };
      return badgeMap[decision] || 'bg-gray-100 text-gray-800';
    };

    const getDecisionLabel = (decision: string) => {
      const labelMap: Record<string, string> = {
        pending: '대기',
        confirmed_auto: '확정(자동)',
        confirmed_human: '확정(수동)',
        review: '검토',
        rejected: '거절',
        asking: '입력대기',
      };
      return labelMap[decision] || decision;
    };

    return (
      <div>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <div className="space-y-2">
          {displayBookings.map((booking: any) => (
            <div key={booking.id} className="bg-white border border-gray-300 rounded p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-bold">{booking.customer}</p>
                  <p className="text-sm text-gray-600">{booking.kind} / {booking.form} ({booking.date})</p>
                  <p className="text-sm text-gray-600">희망: {booking.slots_wanted}</p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-medium ${getDecisionBadge(booking.decision)}`}>
                  {getDecisionLabel(booking.decision)}
                </span>
              </div>

              {booking.decision === 'pending' && !booking.reason && (
                <button
                  onClick={() => executeDecision(booking.id)}
                  className="mb-3 px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                >
                  판정
                </button>
              )}

              {booking.reason && <p className="text-sm mb-3">{booking.reason}</p>}

              {booking.decision === 'pending' && (() => {
                const result = decide(booking, bookings, false);
                return result.decision === 'pending' && result.candidate ? (
                  <button
                    onClick={() => updateDecision(booking.id, 'confirmed_human', result.candidate)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
                  >
                    후보 {result.candidate} 확정
                  </button>
                ) : null;
              })()}

              {booking.decision === 'review' && booking.options && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 mb-2">동점 상황 - 한 쪽을 선택해주세요</p>
                  {booking.options.split(',').map((customer: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        updateDecision(booking.id, 'confirmed_human');
                        const otherCustomer = booking.options.split(',').find((_c: string, i: number) => i !== idx);
                        if (otherCustomer) {
                          const otherBooking = bookings.find((b: any) => b.customer === otherCustomer.trim() && b.date === booking.date && b.decision === 'pending');
                          if (otherBooking) {
                            updateDecision(otherBooking.id, 'pending');
                          }
                        }
                      }}
                      className="w-full px-3 py-2 bg-yellow-600 text-white rounded text-sm font-medium hover:bg-yellow-700 text-left"
                    >
                      {customer.trim()} 이 쪽으로 확정
                    </button>
                  ))}
                </div>
              )}

              {booking.trace && (
                <details className="mt-3 text-xs">
                  <summary className="cursor-pointer text-blue-600 hover:underline">과정 보기</summary>
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <ol className="list-decimal list-inside space-y-1 text-gray-700">
                      {booking.trace.split('\n').map((line: string, idx: number) => (
                        line.trim() && <li key={idx}>{line.trim()}</li>
                      ))}
                    </ol>
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">고객사</th>
              <th className="border border-gray-300 px-4 py-2 text-left">종류</th>
              <th className="border border-gray-300 px-4 py-2 text-left">형태</th>
              <th className="border border-gray-300 px-4 py-2 text-left">메모</th>
              <th className="border border-gray-300 px-4 py-2 text-left">날짜</th>
              <th className="border border-gray-300 px-4 py-2 text-left">희망 슬롯</th>
              <th className="border border-gray-300 px-4 py-2 text-left">위치</th>
              <th className="border border-gray-300 px-4 py-2 text-left">상태</th>
            </tr>
          </thead>
          <tbody>
            {displayBookings.map((booking: any) => (
              <tr
                key={booking.id}
                onClick={() => handleRowClick(booking)}
                className={`cursor-pointer transition-colors ${
                  selectedBookingId === booking.id ? 'bg-blue-100' : 'hover:bg-gray-50'
                }`}
              >
                <td className="border border-gray-300 px-4 py-2">{booking.customer}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.kind}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.form}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.memo}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.date}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.slots_wanted}</td>
                <td className="border border-gray-300 px-4 py-2" onClick={(e) => e.stopPropagation()}>
                  {booking.address ? (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(booking.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      {booking.address}
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => toggleStatus(booking.id, booking.status)}
                    disabled={geocodingId === booking.id}
                    className={`px-3 py-1 rounded font-medium cursor-pointer ${
                      booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    } ${geocodingId === booking.id ? 'opacity-50' : ''}`}
                  >
                    {booking.status === 'pending' ? '대기' : '확정'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
