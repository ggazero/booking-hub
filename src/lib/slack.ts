import { supabase } from './supabaseClient';

interface BookingData {
  customer: string;
  service: string;
  date: string;
  time: string;
  address?: string | null;
}

export async function notifySlackBooking(booking: BookingData): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('notify-booking-slack', {
      body: {
        customer: booking.customer,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        address: booking.address || '주소 없음',
      },
    });

    if (error) {
      console.error('Slack 알림 실패:', error);
      return;
    }

    console.log('Slack 알림 전송 완료:', data);
  } catch (err) {
    console.error('Slack 함수 호출 실패:', err);
  }
}
