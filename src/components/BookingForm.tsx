import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '../lib/supabaseClient';
import { notifySlackBooking } from '../lib/slack';
import { createCalendarEvent } from '../lib/googleCalendar';

interface BookingFormProps {
  onSuccess: () => void;
}

interface VerifiedAddress {
  latitude: number;
  longitude: number;
}

interface GeocodedCoords {
  latitude: number;
  longitude: number;
}

export function BookingForm({ onSuccess }: BookingFormProps) {
  const [customer, setCustomer] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [baseAddress, setBaseAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState<VerifiedAddress | null>(null);
  const [geocodedCoords, setGeocodedCoords] = useState<GeocodedCoords | null>(null);
  const [verifyError, setVerifyError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [mapHeight, setMapHeight] = useState(350);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  async function geocodeAddress(addr: string): Promise<VerifiedAddress | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}`
      );
      const data = (await response.json()) as Array<{ lat: string; lon: string }>;

      if (data.length === 0) {
        return null;
      }

      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } catch (err) {
      console.error('지오코딩 실패:', err);
      return null;
    }
  }

  async function handleAddressVerify() {
    if (!baseAddress.trim()) {
      setVerifyError('기본주소를 입력해주세요');
      return;
    }

    setVerifying(true);
    setVerifyError('');

    const verified = await geocodeAddress(baseAddress);

    if (!verified) {
      setVerifyError('주소를 찾을 수 없습니다');
      setVerifiedAddress(null);
      setGeocodedCoords(null);
      setVerifying(false);
      return;
    }

    setVerifiedAddress(verified);
    setGeocodedCoords({
      latitude: verified.latitude,
      longitude: verified.longitude,
    });
    setVerifying(false);
  }

  function handleBaseAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setBaseAddress(e.target.value);
    setVerifiedAddress(null);
    setGeocodedCoords(null);
    setVerifyError('');
  }

  function handleDetailAddressChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDetailAddress(e.target.value);
  }

  function handleMouseDown() {
    const startY = event instanceof MouseEvent ? event.clientY : 0;
    const startHeight = mapHeight;

    function handleMouseMove(e: MouseEvent) {
      const delta = e.clientY - startY;
      const newHeight = Math.max(250, Math.min(600, startHeight + delta));
      setMapHeight(newHeight);
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 0);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!customer || !service || !date || !time) {
      setError('필수 항목을 모두 입력해주세요');
      return;
    }

    const fullAddress = detailAddress.trim()
      ? `${baseAddress} ${detailAddress}`
      : baseAddress || null;

    setLoading(true);
    try {
      const insertData: any = {
        customer,
        service,
        date,
        time,
        address: fullAddress,
        status: 'pending',
        via: 'form',
      };

      if (geocodedCoords) {
        insertData.latitude = geocodedCoords.latitude;
        insertData.longitude = geocodedCoords.longitude;
      }

      const { error: insertError } = await supabase.from('bookings').insert(insertData);

      if (insertError) throw insertError;

      const finalAddress = detailAddress.trim()
        ? `${baseAddress} ${detailAddress}`
        : baseAddress;

      notifySlackBooking({
        customer,
        service,
        date,
        time,
        address: finalAddress,
      });

      try {
        await createCalendarEvent({
          customer,
          service,
          date,
          time,
          address: finalAddress,
        });
      } catch (calendarError) {
        console.warn('Google Calendar 동기화 실패:', calendarError);
        setError('예약은 저장되었으나 Google Calendar 동기화에 실패했습니다.');
      }

      setCustomer('');
      setService('');
      setDate('');
      setTime('');
      setBaseAddress('');
      setDetailAddress('');
      setVerifiedAddress(null);
      setGeocodedCoords(null);
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

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="기본주소 (선택)"
              value={baseAddress}
              onChange={handleBaseAddressChange}
              className="flex-1 border border-gray-300 rounded px-3 py-2"
            />
            <button
              type="button"
              onClick={handleAddressVerify}
              disabled={verifying || !baseAddress.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:bg-gray-400"
            >
              {verifying ? '확인 중...' : '주소 확인'}
            </button>
          </div>

          <input
            type="text"
            placeholder="상세주소 (동/호수/층 등)"
            value={detailAddress}
            onChange={handleDetailAddressChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />

          {verifyError && <div className="text-red-600 text-sm">{verifyError}</div>}
          {verifiedAddress && (
            <div className="text-green-600 text-sm font-medium">✓ 주소 확인 완료</div>
          )}

          {verifiedAddress && (
            <div
              ref={mapContainerRef}
              className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
              style={{ height: `${mapHeight}px` }}
            >
              <MapContainer
                center={[verifiedAddress.latitude, verifiedAddress.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                key={`${verifiedAddress.latitude}-${verifiedAddress.longitude}`}
                ref={mapInstanceRef as any}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[verifiedAddress.latitude, verifiedAddress.longitude]} />
              </MapContainer>

              <div
                onMouseDown={handleMouseDown}
                className="absolute bottom-0 right-0 w-6 h-6 bg-gray-400 hover:bg-gray-600 cursor-se-resize opacity-70"
                style={{
                  backgroundImage: `
                    linear-gradient(135deg, transparent 50%, currentColor 50%),
                    linear-gradient(225deg, transparent 50%, currentColor 50%)
                  `,
                  backgroundSize: '3px 3px',
                  backgroundPosition: 'bottom right',
                  backgroundRepeat: 'repeat-x',
                }}
                title="드래그로 크기 조절 (250~600px)"
              />
            </div>
          )}
        </div>

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
