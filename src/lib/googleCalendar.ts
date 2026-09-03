import { supabase } from './supabaseClient';

interface BookingData {
  customer: string;
  service: string;
  date: string;
  time: string;
  address?: string | null;
}

export async function createCalendarEvent(booking: BookingData): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('create-calendar-event', {
      body: {
        customer: booking.customer,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        address: booking.address || '주소 없음',
      },
    });

    if (error) {
      console.error('Google Calendar 연동 실패:', error);
      throw new Error('Google Calendar 동기화에 실패했습니다');
    }

    console.log('Google Calendar 이벤트 생성 완료:', data);
  } catch (err) {
    console.error('Calendar Edge Function 호출 실패:', err);
    throw err;
  }
}
