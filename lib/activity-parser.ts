import { FitParser } from 'fit-file-parser';
import { DOMParser } from 'xmldom';
import { gpx } from '@tmcw/togeojson';
import { ActivityType } from '@prisma/client';
import type { Feature, FeatureCollection, LineString } from 'geojson';

interface ParsedActivity {
  name: string;
  activityType: ActivityType;
  startTime: Date;
  endTime: Date;
  duration: number;
  distance?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  avgPower?: number;
  maxPower?: number;
  avgCadence?: number;
  maxCadence?: number;
  avgSpeed?: number;
  maxSpeed?: number;
  elevationGain?: number;
  calories?: number;
  gpsPoints: {
    latitude: number;
    longitude: number;
    elevation: number;
    time: Date;
    heartRate?: number;
    power?: number;
  }[];
}

export async function parseFitFile(buffer: Buffer): Promise<ParsedActivity> {
  const fitParser = new FitParser({
    force: true,
    speedUnit: 'ms',
    lengthUnit: 'm',
    temperatureUnit: 'celsius',
    elapsedRecordField: true,
    mode: 'cascade',
  });

  return new Promise((resolve, reject) => {
    fitParser.parse(buffer, (error: Error | null, data: any) => {
      if (error) {
        reject(error);
        return;
      }

      try {
        const sessions = data.sessions[0];
        const records = data.records;

        // Determine activity type
        let activityType: ActivityType;
        switch (sessions.sport.toLowerCase()) {
          case 'running':
            activityType = 'RUNNING';
            break;
          case 'cycling':
            activityType = 'CYCLING';
            break;
          case 'swimming':
            activityType = 'SWIMMING';
            break;
          default:
            activityType = 'RUNNING'; // Default to running
        }

        const gpsPoints = records.map((record: any) => ({
          latitude: record.position_lat,
          longitude: record.position_long,
          elevation: record.altitude,
          time: new Date(record.timestamp),
          heartRate: record.heart_rate,
          power: record.power,
        }));

        // Log duration calculation details for FIT file
        console.log('FIT Duration calculation details:');
        console.log('Session total elapsed time:', sessions.total_elapsed_time);
        console.log('Session start time:', sessions.start_time);
        console.log('Session end time:', sessions.timestamp);
        console.log('Calculated duration from timestamps:', Math.round((new Date(sessions.timestamp).getTime() - new Date(sessions.start_time).getTime()) / 1000));
        console.log('Number of GPS points:', gpsPoints.length);
        console.log('First GPS point time:', gpsPoints[0]?.time?.toISOString());
        console.log('Last GPS point time:', gpsPoints[gpsPoints.length - 1]?.time?.toISOString());

        // Ensure duration is an integer and use total_elapsed_time if available
        const duration = Math.round(sessions.total_elapsed_time || 
          (new Date(sessions.timestamp).getTime() - new Date(sessions.start_time).getTime()) / 1000);

        const activity: ParsedActivity = {
          name: `${activityType} Activity`,
          activityType,
          startTime: new Date(sessions.start_time),
          endTime: new Date(sessions.timestamp),
          duration,
          distance: sessions.total_distance,
          avgHeartRate: sessions.avg_heart_rate,
          maxHeartRate: sessions.max_heart_rate,
          avgPower: sessions.avg_power,
          maxPower: sessions.max_power,
          avgCadence: sessions.avg_cadence,
          maxCadence: sessions.max_cadence,
          avgSpeed: sessions.avg_speed,
          maxSpeed: sessions.max_speed,
          elevationGain: sessions.total_ascent,
          calories: sessions.total_calories,
          gpsPoints,
        };

        resolve(activity);
      } catch (err) {
        reject(new Error('Error parsing FIT file: ' + err));
      }
    });
  });
}

export async function parseGpxFile(buffer: Buffer, activityType: ActivityType): Promise<ParsedActivity> {
  try {
    // Parse GPX XML
    const parser = new DOMParser();
    const gpxDoc = parser.parseFromString(buffer.toString(), 'application/xml');
    
    // Convert to GeoJSON
    const geoJson = gpx(gpxDoc) as FeatureCollection;
    
    // Find the track feature
    const track = geoJson.features.find(f => f.geometry.type === 'LineString') as Feature<LineString> | undefined;
    if (!track) {
      throw new Error('No track found in GPX file');
    }

    // Extract coordinates and timestamps
    const coordinates = track.geometry.coordinates;
    
    // Try to get time data from different possible locations
    let times: string[] = [];
    if (track.properties?.coordTimes) {
      times = track.properties.coordTimes as string[];
    } else if (track.properties?.time) {
      // Some GPX files store a single time for the track
      const trackTime = new Date(track.properties.time as string);
      times = coordinates.map((_, i) => {
        const time = new Date(trackTime.getTime() + i * 1000); // Add 1 second per point
        return time.toISOString();
      });
    } else {
      // If no time data is found, use current time with 1-second intervals
      const now = new Date();
      times = coordinates.map((_, i) => {
        const time = new Date(now.getTime() + i * 1000);
        return time.toISOString();
      });
    }

    // Create GPS points with proper time handling
    const points = coordinates.map((coord: number[], i: number) => {
      const time = new Date(times[i]);
      return {
        longitude: coord[0],
        latitude: coord[1],
        elevation: coord[2] || 0,
        time,
      };
    });

    // Get track name
    const name = (track.properties?.name as string) || 'GPX Activity';

    // Calculate duration from first and last timestamps
    const startTime = points[0].time;
    const endTime = points[points.length - 1].time;
    const calculatedDuration = Math.max(1, Math.round((endTime.getTime() - startTime.getTime()) / 1000));

    console.log('GPX Duration calculation details:');
    console.log('Start time:', startTime.toISOString());
    console.log('End time:', endTime.toISOString());
    console.log('Raw time difference (ms):', endTime.getTime() - startTime.getTime());
    console.log('Calculated duration (s):', calculatedDuration);
    console.log('Number of GPS points:', points.length);
    console.log('Time source:', track.properties?.coordTimes ? 'coordTimes' : track.properties?.time ? 'track time' : 'generated');

    // Calculate distance (in meters)
    let distance = 0;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      distance += calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }

    // Calculate elevation gain
    let elevationGain = 0;
    for (let i = 1; i < points.length; i++) {
      const diff = points[i].elevation - points[i - 1].elevation;
      if (diff > 0) elevationGain += diff;
    }

    const activity: ParsedActivity = {
      name,
      activityType,
      startTime,
      endTime,
      duration: calculatedDuration,
      distance,
      elevationGain,
      gpsPoints: points,
    };

    return activity;
  } catch (err) {
    console.error('GPX parsing error details:', err);
    throw new Error('Error parsing GPX file: ' + err);
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
} 