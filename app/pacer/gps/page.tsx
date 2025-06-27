'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TrackPoint {
  lat: number;
  lon: number;
  ele: number; // elevation in meters
  time?: Date;
}

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000; // Earth radius in meters

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Simple cycling speed model per segment based on FTP & grade (very simplified)
function estimateSegmentSpeed(
  ftp: number, // watts
  weightTotal: number, // rider + bike kg
  grade: number // decimal (e.g. 0.05 for 5%)
): number {
  // Physics-inspired model:
  // power = force * velocity
  // force approx = gravity component + rolling resistance + drag (simplified)
  // We'll estimate speed from ftp assuming power matches resistance at steady state

  const g = 9.81;
  const rollingResistanceCoeff = 0.005;
  const airDensity = 1.225;
  const dragCoeffArea = 0.3 * 0.5; // CdA ~0.3 m2 typical cyclist
  // Formula rearranged for velocity (v) approx:
  // power = m*g*v*grade + m*g*v*rollingResistance + 0.5*airDensity*CdA*v^3

  // For rough estimate, solve iteratively or approximate:
  // Let's do a very simple approach ignoring drag for simplicity here:

  const power = ftp; // assume max sustainable power
  const forceGrade = weightTotal * g * grade;
  const forceRolling = weightTotal * g * rollingResistanceCoeff;

  const forceTotal = forceGrade + forceRolling;

  if (forceTotal <= 0) {
    // downhill or flat, max speed limited by drag force (not modeled)
    return 50 * 1000 / 3600; // 50 km/h in m/s max speed downhill flat
  }

  // velocity = power / force
  const velocity = power / forceTotal; // m/s

  // Limit min and max speed to reasonable range
  if (velocity > 15) return 15; // 54 km/h max
  if (velocity < 2) return 2; // 7.2 km/h min climbing speed

  return velocity;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return [h > 0 ? h.toString().padStart(2, '0') : null, m.toString().padStart(2, '0'), s.toString().padStart(2, '0')]
    .filter(Boolean)
    .join(':');
}

// Helper to fit map to bounds
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

// Helper to calculate speed (km/h) for each segment
function getElevationSpeedData(trackPoints: TrackPoint[]) {
  if (trackPoints.length < 2) return [];
  let cumDist = 0;
  const data = trackPoints.map((pt, i) => {
    if (i === 0) return { distance: 0, elevation: pt.ele, speed: 0 };
    const prev = trackPoints[i - 1];
    const segmentDist = haversineDistance(prev.lat, prev.lon, pt.lat, pt.lon); // meters
    cumDist += segmentDist / 1000; // km
    const eleDiff = pt.ele - prev.ele;
    const grade = segmentDist > 0 ? eleDiff / segmentDist : 0;
    // Use default FTP and weight for speed, or could pass as params
    const speedMs = estimateSegmentSpeed(250, 75, grade); // m/s (default values)
    const speedKmh = speedMs * 3.6;
    return { distance: cumDist, elevation: pt.ele, speed: speedKmh };
  });
  return data;
}

function ElevationProfile({ trackPoints }: { trackPoints: TrackPoint[] }) {
  if (trackPoints.length < 2) return null;
  const data = getElevationSpeedData(trackPoints);
  return (
    <div className="mb-6" style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="distance" name="Distance (km)" tickFormatter={(v) => v.toFixed(1)} label={{ value: 'Distance (km)', position: 'insideBottomRight', offset: -5 }} />
          <YAxis yAxisId="left" dataKey="elevation" name="Elevation (m)" label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft' }} />
          <YAxis yAxisId="right" orientation="right" dataKey="speed" name="Speed (km/h)" label={{ value: 'Speed (km/h)', angle: 90, position: 'insideRight' }} />
          <Tooltip formatter={(value: number, name: string) => [value.toFixed(1), name === 'distance' ? 'Distance (km)' : name === 'elevation' ? 'Elevation (m)' : 'Speed (km/h)']} />
          <Line yAxisId="left" type="monotone" dataKey="elevation" stroke="#8884d8" dot={false} name="Elevation (m)" />
          <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#82ca9d" dot={false} name="Speed (km/h)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function FtpRaceTimeEstimator() {
  const [trackPoints, setTrackPoints] = useState<TrackPoint[]>([]);
  const [ftp, setFtp] = useState('250'); // watts
  const [weight, setWeight] = useState('75'); // rider + bike kg
  const [totalDistance, setTotalDistance] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  // Parse uploaded GPX file and extract track points
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(text, 'application/xml');

      const trkpts = Array.from(xmlDoc.getElementsByTagName('trkpt'));

      const points: TrackPoint[] = trkpts.map((pt) => ({
        lat: parseFloat(pt.getAttribute('lat') || '0'),
        lon: parseFloat(pt.getAttribute('lon') || '0'),
        ele: parseFloat(pt.getElementsByTagName('ele')[0]?.textContent || '0'),
      }));

      setTrackPoints(points);
    };
    reader.readAsText(file);
  };

  // Calculate total distance and estimate time when inputs or track points change
  React.useEffect(() => {
    if (trackPoints.length < 2) {
      setTotalDistance(0);
      setEstimatedTime(null);
      return;
    }
    const ftpNum = parseFloat(ftp);
    const weightNum = parseFloat(weight);
    if (isNaN(ftpNum) || isNaN(weightNum)) {
      setEstimatedTime(null);
      return;
    }

    let dist = 0;
    let timeSeconds = 0;

    for (let i = 1; i < trackPoints.length; i++) {
      const p1 = trackPoints[i - 1];
      const p2 = trackPoints[i];

      const segmentDist = haversineDistance(p1.lat, p1.lon, p2.lat, p2.lon); // meters
      if (!segmentDist || isNaN(segmentDist) || segmentDist === 0) continue;
      dist += segmentDist;

      const eleDiff = p2.ele - p1.ele;
      const grade = eleDiff / segmentDist; // decimal grade

      const speed = estimateSegmentSpeed(ftpNum, weightNum, grade); // m/s
      const segmentTime = segmentDist / speed; // seconds

      timeSeconds += segmentTime;
    }

    setTotalDistance(dist / 1000); // km
    setEstimatedTime(timeSeconds);
  }, [trackPoints, ftp, weight]);

  return (
    <div className="max-w-xl mx-auto p-6 font-sans">
      <h1 className="text-2xl font-bold mb-6">FTP-Based Race Time Estimator</h1>

      <div className="mb-4">
        <label className="block mb-2 font-medium" htmlFor="gpx-upload">
          Upload GPX File (Course Track)
        </label>
        <input
          id="gpx-upload"
          type="file"
          accept=".gpx"
          onChange={handleFileUpload}
          className="border border-gray-300 p-2 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="ftp" className="block mb-2 font-medium">
          Enter FTP (Watts)
        </label>
        <input
          id="ftp"
          type="number"
          min="50"
          max="1000"
          value={ftp}
          onChange={(e) => setFtp(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="weight" className="block mb-2 font-medium">
          Enter Rider + Bike Weight (kg)
        </label>
        <input
          id="weight"
          type="number"
          min="30"
          max="200"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full"
        />
      </div>

      <hr className="my-6" />

      <RouteMap trackPoints={trackPoints} />
      <ElevationProfile trackPoints={trackPoints} />

      {trackPoints.length > 1 ? (
        <div>
          <p>
            <strong>Course Distance:</strong> {totalDistance.toFixed(2)} km
          </p>
          {estimatedTime !== null ? (
            <p>
              <strong>Estimated Race Time:</strong> {formatTime(estimatedTime)}
            </p>
          ) : (
            <p>Enter valid FTP and weight to see time estimate.</p>
          )}
        </div>
      ) : (
        <p>Please upload a valid GPX file to start estimation.</p>
      )}
    </div>
  );
}
