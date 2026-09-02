import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface BookingFormProps {
  onSuccess: () => void;
}

export function BookingForm({ onSuccess }: BookingFormProps) {
  const [customer, setCustomer] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!customer || !service || !date || !time) {
      setError('필수 항목을 모두 입력해주세요');
      return;
    }

    setLoading(true);
    try {
      const { error: insertError } = await supabase.from('bookings').insert({
        customer,
        service,
        date,
        time,
        address: address || null,
        status: 'pending',
        via: 'form',
      });

      if (insertError) throw insertError;

      setCustomer('');
      setService('');
      setDate('');
      setTime('');
      setAddress('');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '예약 추가 실패');
      console.error('예약 추가 실패:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4">새 예약 추가</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="고객사"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="text"
            placeholder="서비스"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>
        <input
          type="text"
          placeholder="주소 (선택)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '추가 중...' : '예약하기'}
        </button>
      </form>
    </div>
  );
}
