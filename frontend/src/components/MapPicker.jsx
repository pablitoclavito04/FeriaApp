import { MapContainer, ImageOverlay, Marker, useMapEvents } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import planoFeria from '../assets/plano_feria.png';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Backend origin for served map images (empty in the Docker/production build,
// so /uploads goes through the same nginx proxy as the panel).
const BACKEND_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');

// Default plan size, used when the fair has no map of its own (backward compat).
const DEFAULT_BOUNDS = [[0, 0], [1052, 1514]];

// Captures clicks on the map and reports the clicked coordinates upward.
const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

// Single-stall location editor: shows the fair plan and lets the admin click
// to place (or move) one marker, reporting its coordinates to the parent form.
// mapImage / mapBounds come from the caseta's fair so the marker is drawn on
// the SAME image (and same dimensions) the positions were calibrated against —
// including a cropped map. Falls back to the bundled default plan if absent.
const MapPicker = ({ onLocationSelect, initialPosition, mapImage, mapBounds }) => {
  const [marker, setMarker] = useState(initialPosition || null);

  // Sync the marker when the parent opens a DIFFERENT caseta. useState only
  // reads initialPosition on first mount, so without this the marker would stay
  // on the first-edited caseta's position for every subsequent edit (which is
  // why every caseta appeared to share the same location).
  useEffect(() => {
    setMarker(initialPosition || null);
  }, [initialPosition?.lat, initialPosition?.lng]);

  const handleLocationSelect = (latlng) => {
    setMarker(latlng);
    onLocationSelect(latlng);
  };

  // Leaflet CRS.Simple bounds are [[0,0],[height,width]].
  const bounds =
    mapBounds?.width && mapBounds?.height
      ? [[0, 0], [mapBounds.height, mapBounds.width]]
      : DEFAULT_BOUNDS;
  const imageUrl = mapImage ? `${BACKEND_ORIGIN}${encodeURI(mapImage)}` : planoFeria;
  const center = [bounds[1][0] / 2, bounds[1][1] / 2];

  return (
    <div className="map-picker">
      <p className="map-instructions">Click on the map to select the caseta location</p>
      <MapContainer
        center={center}
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
        <ImageOverlay url={imageUrl} bounds={bounds} />
        <LocationPicker onLocationSelect={handleLocationSelect} />
        {marker && <Marker position={marker} />}
      </MapContainer>
    </div>
  );
};

export default MapPicker;