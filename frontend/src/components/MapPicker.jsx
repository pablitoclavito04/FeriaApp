import { MapContainer, ImageOverlay, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';
import planoFeria from '../assets/plano_feria.png';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Bounds del plano (ajusta estos valores según tu imagen)
const bounds = [[0, 0], [1052, 1514]];

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
        center={[526, 757]}
        zoom={-1}
        crs={L.CRS.Simple}
        style={{ height: '500px', width: '100%', borderRadius: '8px' }}
        minZoom={-2}
        maxZoom={3}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        whenReady={(map) => {
          map.target.fitBounds(bounds);
        }}
      >
        <ImageOverlay url={planoFeria} bounds={bounds} />
        <LocationPicker onLocationSelect={handleLocationSelect} />
        {marker && <Marker position={marker} />}
      </MapContainer>
    </div>
  );
};

export default MapPicker;