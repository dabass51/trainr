import { Activity, GPSData, TrainingUnit } from "@prisma/client";

export interface ActivityWithRelations extends Activity {
  gpsData: GPSData[];
  trainingUnit: TrainingUnit | null;
} 