declare module 'gpx-parse' {
  interface Point {
    lat: number;
    lon: number;
    elevation: number;
    time: string;
  }

  interface Segment {
    [index: number]: Point;
  }

  interface Track {
    name: string;
    segments: Segment[];
  }

  interface GpxData {
    tracks: Track[];
  }

  export function parseGpx(data: string, callback: (error: Error | null, data: GpxData) => void): void;
} 