"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivityType } from "@prisma/client";

interface TrainingUnit {
  id: string;
  type: string;
  description: string;
  date: string;
  duration: number;
  intensity: string;
}

interface Activity {
  id: string;
  name: string;
  activityType: string;
  startTime: string;
  endTime: string;
  duration: number;
  distance?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
}

export function ActivityUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedActivity, setUploadedActivity] = useState<Activity | null>(null);
  const [matchingUnits, setMatchingUnits] = useState<TrainingUnit[]>([]);
  const [selectedType, setSelectedType] = useState<ActivityType>("RUNNING");
  const { toast } = useToast();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!fileType || !['fit', 'gpx'].includes(fileType)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a .fit or .gpx file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('activityType', selectedType);

      const response = await fetch('/api/activities/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadedActivity(data.activity);
      setMatchingUnits(data.matchingTrainingUnits);

      toast({
        title: "Activity uploaded",
        description: "Your activity has been successfully uploaded.",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your activity.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMatchTrainingUnit = async (trainingUnitId: string) => {
    if (!uploadedActivity) return;

    try {
      const response = await fetch(`/api/activities/${uploadedActivity.id}/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trainingUnitId }),
      });

      if (!response.ok) {
        throw new Error('Matching failed');
      }

      toast({
        title: "Activity matched",
        description: "Activity has been matched with the training unit.",
      });

      // Remove the matched unit from the list
      setMatchingUnits(units => units.filter(unit => unit.id !== trainingUnitId));
    } catch (error) {
      console.error('Matching error:', error);
      toast({
        title: "Matching failed",
        description: "There was an error matching the activity.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Activity</CardTitle>
          <CardDescription>
            Upload your activity file from Garmin, Strava, or other devices.
            Supported formats: .fit, .gpx
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Activity Type</label>
              <Select value={selectedType} onValueChange={(value: ActivityType) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select activity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RUNNING">Running</SelectItem>
                  <SelectItem value="CYCLING">Cycling</SelectItem>
                  <SelectItem value="SWIMMING">Swimming</SelectItem>
                  <SelectItem value="TRIATHLON">Triathlon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              type="file"
              accept=".fit,.gpx"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadedActivity && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Activity</CardTitle>
            <CardDescription>Details of your uploaded activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Name:</strong> {uploadedActivity.name}</p>
              <p><strong>Type:</strong> {uploadedActivity.activityType}</p>
              <p><strong>Date:</strong> {new Date(uploadedActivity.startTime).toLocaleString()}</p>
              <p><strong>Duration:</strong> {Math.round(uploadedActivity.duration / 60)} minutes</p>
              {uploadedActivity.distance && (
                <p><strong>Distance:</strong> {(uploadedActivity.distance / 1000).toFixed(2)} km</p>
              )}
              {uploadedActivity.avgHeartRate && (
                <p><strong>Avg Heart Rate:</strong> {uploadedActivity.avgHeartRate} bpm</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {matchingUnits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Matching Training Units</CardTitle>
            <CardDescription>
              These training units were scheduled for the same day. Select one to match with your activity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matchingUnits.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{unit.type}</h4>
                    <p className="text-sm text-gray-500">{unit.description}</p>
                    <p className="text-sm">
                      Duration: {unit.duration} minutes | Intensity: {unit.intensity}
                    </p>
                  </div>
                  <Button onClick={() => handleMatchTrainingUnit(unit.id)}>
                    Match
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 