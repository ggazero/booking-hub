import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { notifySlackBooking } from '../lib/slack';
import { createCalendarEvent } from '../lib/googleCalendar';
import { judge } from '../lib/judge';

interface BookingFormProps {
  onSuccess: () => void;
}

const SLOTS = ['오전', '오후-1', '오후-2'] as const;
type Slot = typeof SLOTS[number];

export function BookingForm({ onSuccess }: BookingFormProps) {
  const [customer, setCustomer] = useState('');
  const [kind, setKind] = useState('');
  const [form, setForm] = useState('');
  const [memo, setMemo] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<Slot[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [judgeResult, setJudgeResult] = useState<ReturnType<typeof judge> | null>(null);

  function handleSlotToggle(slot: Slot) {
    setSelectedSlots((prev) => {
      const newSlots = prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot];
      updateJudgeResult(newSlots);
      return newSlots;
    });
  }

  function updateJudgeResult(slots: Slot[]) {
    const result = judge({
      customer,
      kind,
      form,
      date,
      slotsWanted: slots,
      address,
    });
    setJudgeResult(result);
  }

  function handleFieldChange() {
    updateJudgeResult(selectedSlots);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const result = judge({
      customer,
      kind,
      form,
      date,
      slotsWanted: selectedSlots,
      address,
    });

    if (result.route === 'ask') {
      setError(result.message || '필수 항목을 확인해주세요');
      return;
    }

    const slotsWantedStr = selectedSlots.join(',');

    setLoading(true);
    try {
      const insertData: any = {
        customer,
        kind,
        form,
        memo,
        address: form === '외근' ? address : '',
        date,
        time: '',
        slots_wanted: slotsWantedStr,
        decision: 'pending',
        status: 'pending',
        service: memo,
        via: 'form',
      };

      const { error: insertError } = await supabase.from('bookings').insert(insertData);

      if (insertError) throw insertError;

      try {
        await notifySlackBooking({
          customer,
          service: memo,
          date,
          time: slotsWantedStr,
          address: address || '',
        });
      } catch (slackError) {
        console.warn('Slack 알림 실패:', slackError);
      }

      try {
        if (form === '외근' && address) {
          await createCalendarEvent({
            customer,
            service: memo,
            date,
            time: slotsWantedStr,
            address,
          });
        }
      } catch (calendarError) {
        console.warn('Google Calendar 동기화 실패:', calendarError);
      }

      setCustomer('');
      setKind('');
      setForm('');
      setMemo('');
      setAddress('');
      setDate('');
      setSelectedSlots([]);
      setJudgeResult(null);
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
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">고객사</label>
            <input
              type="text"
              value={customer}
              onChange={(e) => {
                setCustomer(e.target.value);
                handleFieldChange();
              }}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">종류</label>
            <select
              value={kind}
              onChange={(e) => {
                setKind(e.target.value);
                handleFieldChange();
              }}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">선택해주세요</option>
              <option value="서울">서울</option>
              <option value="경기">경기</option>
              <option value="지방">지방</option>
              <option value="내부">내부</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">형태</label>
            <select
              value={form}
              onChange={(e) => {
                setForm(e.target.value);
                handleFieldChange();
              }}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">선택해주세요</option>
              <option value="외근">외근</option>
              <option value="온라인">온라인</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="미팅, 기획 회의 등"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          {form === '외근' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">위치 *</label>
              <input
                type="text"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  handleFieldChange();
                }}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          )}

          {form === '온라인' && address && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">위치</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="선택 사항"
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          )}

          {form === '온라인' && !address && (
            <div>
              <button
                type="button"
                onClick={() => setAddress('')}
                className="text-sm text-gray-500"
              >
                위치 추가 (선택)
              </button>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                handleFieldChange();
              }}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">희망 슬롯</label>
            <div className="space-y-2">
              {SLOTS.map((slot) => (
                <label key={slot} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSlots.includes(slot)}
                    onChange={() => handleSlotToggle(slot)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">
                    {slot === '오전' && '오전 10-12'}
                    {slot === '오후-1' && '오후-1 13-15'}
                    {slot === '오후-2' && '오후-2 15-17'}
                  </span>
                  {selectedSlots.includes(slot) && (
                    <span className="text-sm font-bold text-blue-600">
                      {selectedSlots.indexOf(slot) + 1}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          {judgeResult && (
            <div
              className={`flex items-center gap-2 mb-4 p-3 rounded ${
                judgeResult.badge === 'blue'
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-green-50 text-green-700'
              }`}
            >
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  judgeResult.badge === 'blue' ? 'bg-blue-600' : 'bg-green-600'
                }`}
              />
              {judgeResult.route === 'ask' ? judgeResult.message : '예약 가능'}
            </div>
          )}

          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          <button
            type="submit"
            disabled={loading || judgeResult?.route === 'ask'}
            className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '추가 중...' : '예약하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
