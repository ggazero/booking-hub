import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Booking {
  id: number;
  customer: string;
  service: string;
  date: string;
  time: string;
  address: string;
  status: string;
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
}

export function BookingTable({ refreshKey, onBookingSelect, selectedBookingId }: BookingTableProps) {
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
        .select('id, customer, service, date, time, address, status, latitude, longitude')
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

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  if (bookings.length === 0) {
    return <div className="text-center py-8 text-gray-500">예약이 없습니다</div>;
  }

  return (
    <div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">고객사</th>
              <th className="border border-gray-300 px-4 py-2 text-left">서비스</th>
              <th className="border border-gray-300 px-4 py-2 text-left">날짜</th>
              <th className="border border-gray-300 px-4 py-2 text-left">시간</th>
              <th className="border border-gray-300 px-4 py-2 text-left">위치</th>
              <th className="border border-gray-300 px-4 py-2 text-left">상태</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                onClick={() => handleRowClick(booking)}
                className={`cursor-pointer transition-colors ${
                  selectedBookingId === booking.id ? 'bg-blue-100' : 'hover:bg-gray-50'
                }`}
              >
                <td className="border border-gray-300 px-4 py-2">{booking.customer}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.service}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.date}</td>
                <td className="border border-gray-300 px-4 py-2">{booking.time}</td>
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
