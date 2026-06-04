import { MapContainer, ImageOverlay, Marker, useMap, useMapEvents } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix default marker icon (same as MapPicker).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Backend origin where /uploads images are served. Derived from the API URL
// (strip the trailing /api), falling back to the dev backend.
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BACKEND_ORIGIN = apiUrl.replace(/\/api\/?$/, '');

// Build a numbered, color-coded marker icon. Green = confident/selected,
// red = needs review, grey = deselected (won't be saved).
const numberIcon = (number, { review, selected }) => {
  const color = !selected ? '#9ca3af' : review ? '#ef4444' : '#16a34a';
  return L.divIcon({
    className: 'caseta-review-marker',
    html: `<div style="
      background:${color};color:#fff;border:1px solid #fff;border-radius:50%;
      width:22px;height:22px;display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:600;box-shadow:0 1px 2px rgba(0,0,0,.4);
    ">${number ?? '?'}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

// Read-only review map: shows every detected caseta as a numbered marker on the
// uploaded fair map. Clicking a marker toggles whether it will be saved.
// Inside a modal the map container has no size at mount time, so Leaflet
// mis-measures it (markers clump, image overlay won't fit). Recalculate once
// laid out.
const FitOnReady = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => {
      map.invalidateSize();
      map.fitBounds(bounds);
    }, 100);
    return () => clearTimeout(id);
  }, [map, bounds]);
  return null;
};

// Click an empty spot on the map to add a caseta there.
const AddOnClick = ({ onAdd }) => {
  useMapEvents({
    click(e) {
      onAdd(e.latlng);
    },
  });
  return null;
};

// Review map: each detected caseta is a numbered marker on the uploaded fair
// map. Click a marker to include/exclude it, drag it to fix its position, or
// click an empty spot to add a new one.
const MapReview = ({ mapUrl, bounds, casetas, selectedIds, onToggle, onMove, onAdd, height = '500px' }) => {
  const url = mapUrl?.startsWith('http') ? mapUrl : `${BACKEND_ORIGIN}${mapUrl}`;
  const center = [bounds[1][0] / 2, bounds[1][1] / 2];

  return (
    <div className="map-picker">
      <p className="map-instructions">Click a marker to toggle it, drag to reposition, click the map to add one</p>
      <MapContainer
        center={center}
        zoom={-1}
        crs={L.CRS.Simple}
        style={{ height, width: '100%', borderRadius: '8px' }}
        minZoom={-2}
        maxZoom={3}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        whenReady={(map) => {
          map.target.fitBounds(bounds);
        }}
      >
        <ImageOverlay url={url} bounds={bounds} />
        <FitOnReady bounds={bounds} />
        {onAdd && <AddOnClick onAdd={onAdd} />}
        {casetas.map((c) => {
          const selected = selectedIds.has(c.id);
          return (
            <Marker
              key={c.id}
              position={[c.location.x, c.location.y]}
              icon={numberIcon(c.number, { review: c.review, selected })}
              draggable={Boolean(onMove)}
              eventHandlers={{
                click: () => onToggle(c.id),
                dragend: (e) => onMove && onMove(c.id, e.target.getLatLng()),
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapReview;
