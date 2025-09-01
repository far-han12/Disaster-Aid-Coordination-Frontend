'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
export default function RequestsMap({ requests, userLocation }) {
  if (!userLocation) {
    return <div className="flex items-center justify-center h-full bg-muted rounded-lg"><p>Getting your location...</p></div>;
  }

  return (
    <MapContainer center={[userLocation.latitude, userLocation.longitude]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Marker for the user's location */}
      <Marker  position={[userLocation.latitude, userLocation.longitude]} icon={redIcon}>
        <Popup>Your Location</Popup>
      </Marker>

      {/* Markers for aid requests */}
      {requests.map(request => (
        <Marker key={request.id} position={[request.latitude, request.longitude]}>
          <Popup>
            <strong>{request.aid_type}</strong><br />
            Status: {request.status}<br />
            Urgency: {request.urgency}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}