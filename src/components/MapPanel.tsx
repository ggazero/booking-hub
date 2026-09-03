import { useState } from 'react';
import { MapContainer, TileLayer, Popup, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapBooking {
  id: number;
  customer: string;
  service: string;
  date: string;
  time: string;
  address: string;
  latitude: number;
  longitude: number;
}

const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const seoulCenter: [number, number] = [37.5665, 126.978];

export function MapPanel({ selectedBooking }: { selectedBooking: MapBooking | null }) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(seoulCenter);

  if (selectedBooking && (mapCenter[0] !== selectedBooking.latitude || mapCenter[1] !== selectedBooking.longitude)) {
    setMapCenter([selectedBooking.latitude, selectedBooking.longitude]);
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">예약 위치 지도</h2>

      <div className="rounded-lg overflow-hidden border border-gray-200">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '500px', width: '100%' }}
          key={`${mapCenter[0]}-${mapCenter[1]}`}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {selectedBooking && (
            <Marker
  position={[selectedBooking.latitude, selectedBooking.longitude]}
  icon={defaultIcon}
>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{selectedBooking.customer}</p>
                  <p className="text-gray-600">{selectedBooking.service}</p>
                  <p className="text-gray-600">
                    {selectedBooking.date} {selectedBooking.time}
                  </p>
                  <p className="text-gray-600 mt-2">{selectedBooking.address}</p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
