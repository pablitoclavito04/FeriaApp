import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const MapPicker = ({ onLocationSelect, initialPosition }) => {
  const [marker, setMarker] = useState(initialPosition || null);

  const handleLocationSelect = (latlng) => {
    setMarker(latlng);
    onLocationSelect(latlng);
  };

  return (
    <div className="map-picker">
      <p className="map-instructions">Click on the map to select the caseta location</p>
      <MapContainer
        center={[36.6850, -6.1261]}
        zoom={15}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <LocationPicker onLocationSelect={handleLocationSelect} />
        {marker && <Marker position={marker} />}
      </MapContainer>
    </div>
  );
};

export default MapPicker;