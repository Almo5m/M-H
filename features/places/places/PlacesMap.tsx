'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export interface Place {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  visited: boolean;
}

function markerIcon(visited: boolean) {
  const color = visited ? '#C7A96B' : '#8E6873';
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:999px;background:${color};border:2px solid #FFFBF6;box-shadow:0 0 0 1px ${color}55;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function ClickCatcher({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export function PlacesMap({
  places,
  picking,
  onPick,
  onSelect,
}: {
  places: Place[];
  picking: boolean;
  onPick: (lat: number, lng: number) => void;
  onSelect: (id: string) => void;
}) {
  useEffect(() => {
    // Leaflet's default marker asset URLs break under bundlers — we use
    // custom divIcons everywhere so this just prevents console noise.
    delete (L.Icon.Default.prototype as any)._getIconUrl;
  }, []);

  return (
    <MapContainer center={[30.0444, 31.2357]} zoom={11} scrollWheelZoom style={{ height: 420, width: '100%', borderRadius: 16 }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {picking && <ClickCatcher onPick={onPick} />}
      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={markerIcon(place.visited)}
          eventHandlers={{ click: () => onSelect(place.id) }}
        />
      ))}
    </MapContainer>
  );
}
