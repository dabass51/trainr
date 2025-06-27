'use client';

import React, { useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return [
    h > 0 ? h.toString().padStart(2, '0') : null,
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0'),
  ].filter(Boolean).join(':');
}

type InputMode = 'distance_time' | 'distance_pace' | 'time_pace';
type UnitSystem = 'metric' | 'imperial';

export default function RunningPaceCalculator() {
  const [inputMode, setInputMode] = useState<InputMode>('distance_time');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState(''); // hh:mm:ss or mm:ss
  const [pace, setPace] = useState(''); // mm:ss per km or mile
  const [splitDistance, setSplitDistance] = useState('1');
  const [sport, setSport] = useState<'running' | 'cycling' | 'swimming'>('running');

  // Presets for running and cycling
  const runningPresets = [
    { label: '5K', km: 5, mi: 3.11 },
    { label: '10K', km: 10, mi: 6.21 },
    { label: 'Half', km: 21.0975, mi: 13.11 },
    { label: 'Marathon', km: 42.195, mi: 26.22 },
  ];
  const cyclingPresets = [
    { label: '10K', km: 10, mi: 6.21 },
    { label: '20K', km: 20, mi: 12.43 },
    { label: '40K', km: 40, mi: 24.85 },
    { label: '100K', km: 100, mi: 62.14 },
  ];
  const swimmingPresets = [
    { label: '50', m: 50, yd: 50 },
    { label: '100', m: 100, yd: 100 },
    { label: '200', m: 200, yd: 200 },
    { label: '400', m: 400, yd: 400 },
    { label: '800', m: 800, yd: 800 },
    { label: '1500', m: 1500, yd: 1650 }, // 1650yd ~ 1500m
    { label: '2.5K', m: 2500, yd: 2750 },
    { label: '5K', m: 5000, yd: 5500 },
    { label: '10K', m: 10000, yd: 11000 },
  ];
  const activePresets = sport === 'running' ? runningPresets : sport === 'cycling' ? cyclingPresets : swimmingPresets;

  // Clear distance when switching sport for clarity
  React.useEffect(() => {
    setDistance('');
  }, [sport, unitSystem]);

  function parseTime(str: string): number | null {
    const parts = str.split(':').map(p => parseInt(p.trim(), 10));
    if (parts.some(isNaN)) return null;
    if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
    if (parts.length === 2) return parts[0]*60 + parts[1];
    if (parts.length === 1) return parts[0];
    return null;
  }

  const isRunning = sport === 'running';
  const isCycling = sport === 'cycling';
  const paceOrSpeedLabel = isRunning
    ? `Pace (min/${unitSystem === 'metric' ? 'km' : 'mile'})`
    : isCycling
      ? `Speed (${unitSystem === 'metric' ? 'km/h' : 'mph'})`
      : `Pace (min/${unitSystem === 'metric' ? '100m' : '100yd'})`;
  const paceOrSpeedPlaceholder = isRunning
    ? 'e.g. 05:00'
    : isCycling
      ? unitSystem === 'metric' ? 'e.g. 30' : 'e.g. 18'
      : 'e.g. 01:45';

  const results = useMemo(() => {
    const dist = parseFloat(distance);
    if (isNaN(dist) || dist <= 0) return null;

    let timeSec = parseTime(time);
    let paceSec = null;
    let speed = null;

    if (isRunning) {
      if (inputMode === 'distance_time') {
        if (timeSec === null) return null;
        paceSec = timeSec / dist;
        return { paceSec, timeSec, dist };
      } else if (inputMode === 'distance_pace') {
        const paceParts = pace.split(':').map(p => parseInt(p.trim(), 10));
        if (paceParts.some(isNaN)) return null;
        paceSec = paceParts.length === 2 ? paceParts[0]*60 + paceParts[1] : paceParts[0];
        timeSec = paceSec * dist;
        return { paceSec, timeSec, dist };
      } else if (inputMode === 'time_pace') {
        const paceParts = pace.split(':').map(p => parseInt(p.trim(), 10));
        if (paceParts.some(isNaN)) return null;
        paceSec = paceParts.length === 2 ? paceParts[0]*60 + paceParts[1] : paceParts[0];
        if (timeSec === null) return null;
        const distCalc = timeSec / paceSec;
        return { paceSec, timeSec, dist: distCalc };
      }
    } else if (isCycling) {
      if (inputMode === 'distance_time') {
        if (timeSec === null) return null;
        speed = dist / (timeSec / 3600); // km/h or mph
        return { speed, timeSec, dist };
      } else if (inputMode === 'distance_pace') {
        speed = parseFloat(pace);
        if (isNaN(speed) || speed <= 0) return null;
        timeSec = dist / speed * 3600;
        return { speed, timeSec, dist };
      } else if (inputMode === 'time_pace') {
        speed = parseFloat(pace);
        if (isNaN(speed) || speed <= 0) return null;
        if (timeSec === null) return null;
        const distCalc = speed * (timeSec / 3600);
        return { speed, timeSec, dist: distCalc };
      }
    } else {
      // Swimming: use meters/yards and pace per 100m/100yd
      const swimDist = dist; // meters or yards
      if (inputMode === 'distance_time') {
        if (timeSec === null) return null;
        paceSec = timeSec / (swimDist / 100); // seconds per 100m/100yd
        return { paceSec, timeSec, dist: swimDist };
      } else if (inputMode === 'distance_pace') {
        const paceParts = pace.split(':').map(p => parseInt(p.trim(), 10));
        if (paceParts.some(isNaN)) return null;
        paceSec = paceParts.length === 2 ? paceParts[0]*60 + paceParts[1] : paceParts[0];
        timeSec = paceSec * (swimDist / 100);
        return { paceSec, timeSec, dist: swimDist };
      } else if (inputMode === 'time_pace') {
        const paceParts = pace.split(':').map(p => parseInt(p.trim(), 10));
        if (paceParts.some(isNaN)) return null;
        paceSec = paceParts.length === 2 ? paceParts[0]*60 + paceParts[1] : paceParts[0];
        if (timeSec === null) return null;
        const distCalc = (timeSec / paceSec) * 100;
        return { paceSec, timeSec, dist: distCalc };
      }
    }
    return null;
  }, [distance, time, pace, inputMode, sport, unitSystem]);

  const splits = useMemo(() => {
    if (!results) return [];
    const splitDist = parseFloat(splitDistance);
    if (isNaN(splitDist) || splitDist <= 0) return [];

    const numSplits = Math.ceil(results.dist / splitDist);
    const splitsArr = [];
    let cumulativeTime = 0;
    let cumulativeDistance = 0;
    for (let i = 1; i <= numSplits; i++) {
      const distSplit = i === numSplits ? results.dist - splitDist*(i-1) : splitDist;
      let timeSplit;
      if (isRunning) {
        timeSplit = results.paceSec !== undefined ? results.paceSec * distSplit : 0;
      } else if (isCycling) {
        timeSplit = results.speed !== undefined && results.speed > 0 ? distSplit / results.speed * 3600 : 0;
      } else {
        // Swimming: paceSec is per 100m/100yd
        timeSplit = results.paceSec !== undefined ? results.paceSec * (distSplit / 100) : 0;
      }
      cumulativeTime += timeSplit;
      cumulativeDistance += distSplit;
      splitsArr.push({ splitNumber: i, dist: distSplit, cumulativeDistance, time: timeSplit, cumulativeTime });
    }
    return splitsArr;
  }, [results, splitDistance, sport]);

  return (
    <div className="max-w-lg mx-auto p-6 font-sans">
      <h1 className="text-2xl font-semibold mb-6">Running Pace Calculator</h1>

      <div className="mb-4">
        <Label htmlFor="sport">Sport</Label>
        <Select value={sport} onValueChange={(val) => setSport(val as 'running' | 'cycling' | 'swimming')}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="cycling">Cycling</SelectItem>
              <SelectItem value="swimming">Swimming</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <Label htmlFor="inputMode">Input Mode</Label>
        <Select value={inputMode} onValueChange={(val) => setInputMode(val as InputMode)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select input mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="distance_time">Distance + Time → Pace</SelectItem>
              <SelectItem value="distance_pace">Distance + Pace → Time</SelectItem>
              <SelectItem value="time_pace">Time + Pace → Distance</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6 flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="unitSystem">Unit System</Label>
          <Select value={unitSystem} onValueChange={(val) => setUnitSystem(val as UnitSystem)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select unit system" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="metric">Metric (km, min/km)</SelectItem>
                <SelectItem value="imperial">Imperial (miles, min/mile)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <button
          type="button"
          className="ml-2 px-3 py-2 rounded border bg-muted hover:bg-accent text-xs font-medium"
          onClick={() => setUnitSystem(unitSystem === 'metric' ? 'imperial' : 'metric')}
          aria-label="Switch unit system"
        >
          {unitSystem === 'metric' ? 'Switch to Imperial' : 'Switch to Metric'}
        </button>
      </div>

      {(inputMode === 'distance_time' || inputMode === 'distance_pace') && (
        <div className="mb-6">
          <Label htmlFor="distance">
            Distance (
              {sport === 'running' ? (unitSystem === 'metric' ? 'km' : 'miles') :
               sport === 'cycling' ? (unitSystem === 'metric' ? 'km' : 'miles') :
               unitSystem === 'metric' ? 'meters' : 'yards'}
            )
          </Label>
          <div className="flex gap-2 mb-2">
            {(sport === 'running' || sport === 'cycling') &&
              (activePresets as { label: string; km: number; mi: number }[]).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="px-2 py-1 text-xs rounded bg-muted hover:bg-accent border"
                  onClick={() => setDistance(unitSystem === 'metric' ? String(preset.km) : String(preset.mi))}
                >
                  {preset.label}
                </button>
              ))}
            {sport === 'swimming' &&
              (activePresets as { label: string; m: number; yd: number }[]).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="px-2 py-1 text-xs rounded bg-muted hover:bg-accent border"
                  onClick={() => setDistance(unitSystem === 'metric' ? String(preset.m) : String(preset.yd))}
                >
                  {preset.label}
                </button>
              ))}
          </div>
          <Input
            type="number"
            id="distance"
            min={0}
            step="any"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            placeholder={
              sport === 'running' || sport === 'cycling'
                ? (unitSystem === 'metric' ? 'e.g. 10' : 'e.g. 6.21')
                : (unitSystem === 'metric' ? 'e.g. 400' : 'e.g. 400')
            }
          />
        </div>
      )}

      {(inputMode === 'distance_time' || inputMode === 'time_pace') && (
        <div className="mb-6">
          <Label htmlFor="time">Time (hh:mm:ss or mm:ss)</Label>
          <Input
            type="text"
            id="time"
            placeholder="e.g. 00:50:00"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      )}

      {(inputMode === 'distance_pace' || inputMode === 'time_pace') && (
        <div className="mb-6">
          <Label htmlFor="pace">{paceOrSpeedLabel}</Label>
          <Input
            type="text"
            id="pace"
            placeholder={paceOrSpeedPlaceholder}
            value={pace}
            onChange={(e) => setPace(e.target.value)}
          />
        </div>
      )}

      <div className="mb-6">
        <Label htmlFor="splitDistance">Split Distance ({unitSystem === 'metric' ? 'km' : 'miles'})</Label>
        <Input
          type="number"
          id="splitDistance"
          min={0}
          step="any"
          value={splitDistance}
          onChange={(e) => setSplitDistance(e.target.value)}
          placeholder="e.g. 1"
        />
      </div>

      <hr className="my-6" />

      {!results ? (
        <p className="text-sm text-muted-foreground">Please fill in all required fields with valid values.</p>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <p className="mb-1">
            Distance: <strong>{results.dist.toFixed(2)}</strong> {unitSystem === 'metric' ? (isRunning ? 'km' : 'km') : (isRunning ? 'miles' : 'miles')}
          </p>
          <p className="mb-1">
            Time: <strong>{formatTime(results.timeSec)}</strong>
          </p>
          {isRunning ? (
            <p className="mb-4">
              Pace: <strong>
                {results.paceSec !== undefined ? (
                  <>
                    {Math.floor(results.paceSec / 60).toString().padStart(2, '0')}:
                    {(results.paceSec % 60).toFixed(0).padStart(2, '0')}
                  </>
                ) : '--:--'}
              </strong> min/{unitSystem === 'metric' ? 'km' : 'mile'}
            </p>
          ) : isCycling ? (
            <p className="mb-4">
              Speed: <strong>{results.speed !== undefined ? results.speed.toFixed(2) : '--'}</strong> {unitSystem === 'metric' ? 'km/h' : 'mph'}
            </p>
          ) : (
            <p className="mb-4">
              Pace: <strong>
                {results.paceSec !== undefined ? (
                  <>
                    {Math.floor(results.paceSec / 60).toString().padStart(2, '0')}:
                    {(results.paceSec % 60).toFixed(0).padStart(2, '0')}
                  </>
                ) : '--:--'}
              </strong> min/{unitSystem === 'metric' ? '100m' : '100yd'}
            </p>
          )}

          <h3 className="text-lg font-semibold mb-2">Splits</h3>
          <table className="w-full border-collapse border border-border">
            <thead>
              <tr>
                <th className="border border-border px-2 py-1 text-center">Split</th>
                <th className="border border-border px-2 py-1 text-center">Distance ({unitSystem === 'metric' ? 'km' : 'mi'})</th>
                <th className="border border-border px-2 py-1 text-center">Cumulative Distance ({unitSystem === 'metric' ? 'km' : 'mi'})</th>
                <th className="border border-border px-2 py-1 text-center">Time</th>
                <th className="border border-border px-2 py-1 text-center">Cumulative Time</th>
              </tr>
            </thead>
            <tbody>
              {splits.map((s) => (
                <tr key={s.splitNumber} className="border border-border">
                  <td className="border border-border px-2 py-1 text-center">{s.splitNumber}</td>
                  <td className="border border-border px-2 py-1 text-center">{sport === 'swimming' ? s.dist.toFixed(0) : s.dist.toFixed(2)}</td>
                  <td className="border border-border px-2 py-1 text-center">{sport === 'swimming' ? s.cumulativeDistance.toFixed(0) : s.cumulativeDistance.toFixed(2)}</td>
                  <td className="border border-border px-2 py-1 text-center">{formatTime(s.time)}</td>
                  <td className="border border-border px-2 py-1 text-center">{formatTime(s.cumulativeTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
