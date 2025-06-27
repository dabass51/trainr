import React from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
  time?: Date;
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  React.useEffect(() => {
    if (positions.length > 1) {
      map.fitBounds(positions);
    }
  }, [positions, map]);
  return null;
}

function RouteMap({ trackPoints }: { trackPoints: TrackPoint[] }) {
  if (typeof window === 'undefined' || trackPoints.length < 2) return null;
  const positions = trackPoints.map(pt => [pt.lat, pt.lon] as [number, number]);
  return (
    <div className="mb-6" style={{ height: 400 }}>
      <MapContainer style={{ height: '100%', width: '100%' }} center={positions[0]} zoom={13} scrollWheelZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
        />
        <Polyline positions={positions} color="blue" />
        <FitBounds positions={positions} />
      </MapContainer>
    </div>
  );
}

export default RouteMap; 