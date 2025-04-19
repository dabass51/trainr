"use client";

import React, { useEffect } from 'react';
import { Activity, GPSData, TrainingUnit, ActivityType } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, MapPin, Activity as ActivityIcon, Heart, Zap, ArrowUp, RotateCw } from "lucide-react";
import Link from "next/link";
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PerformanceCharts } from "@/components/PerformanceCharts";

export type ActivityWithRelations = {
  id: string;
  name: string;
  activityType: ActivityType;
  userId: string;
  startTime: Date;
  endTime: Date;
  duration: number;  // in seconds
  distance: number | null;  // in meters
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  avgPower: number | null;
  maxPower: number | null;
  avgCadence: number | null;
  maxCadence: number | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
  elevationGain: number | null;
  calories: number | null;
  trainingUnitId: string | null;
  createdAt: Date;
  updatedAt: Date;
  gpsData: GPSData[];
  trainingUnit: TrainingUnit | null;
};

interface ActivityDetailProps {
  activity: ActivityWithRelations;
}

function MapView({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions);
    }
  }, [positions, map]);

  return null;
}

export function ActivityDetail({ activity }: ActivityDetailProps) {
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculatePace = (distanceMeters: number | null | undefined, durationSeconds: number): string => {
    if (!distanceMeters) return "N/A";
    const kilometers = distanceMeters / 1000;
    const hours = durationSeconds / 3600;
    const pace = hours / kilometers; // hours per kilometer
    const paceMinutes = Math.floor(pace * 60);
    const paceSeconds = Math.round((pace * 60 - paceMinutes) * 60);
    return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}/km`;
  };

  const positions = activity.gpsData.map(
    (point) => [point.latitude, point.longitude] as [number, number]
  );

  console.log('Activity GPS Data:', {
    hasGpsData: activity.gpsData.length > 0,
    gpsDataCount: activity.gpsData.length,
    firstPoint: activity.gpsData[0],
    positions: positions.slice(0, 3),
    activity: activity
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{activity.name}</h1>
          <div className="flex items-center gap-2 mt-2 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            <span>{formatDate(activity.startTime)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/activities">Back to Activities</Link>
          </Button>
        </div>
      </div>

      {/* Map Display */}
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle>Activity Route</CardTitle>
          <CardDescription>Your tracked route on the map</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-md overflow-hidden">
            {positions.length > 0 ? (
              <MapContainer
                center={positions[0]}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
                zoomControl={true}
                dragging={true}
                scrollWheelZoom={true}
                doubleClickZoom={true}
                boxZoom={true}
                keyboard={true}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors, &copy; CartoDB"
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
                />
                <Polyline 
                  positions={positions} 
                  color="orange"
                  weight={3}
                  opacity={0.8}
                />
                <MapView positions={positions} />
              </MapContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No GPS data available for this activity.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts */}
      {activity.gpsData.length > 0 && (
        <PerformanceCharts gpsData={activity.gpsData} />
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{formatDuration(activity.duration)}</span>
            </div>
          </CardContent>
        </Card>

        {activity.distance && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Distance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{(activity.distance / 1000).toFixed(2)} km</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pace</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <RotateCw className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{calculatePace(activity.distance, activity.duration)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Heart Rate */}
        {(activity.avgHeartRate || activity.maxHeartRate) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Heart Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {activity.avgHeartRate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-xl font-bold">{activity.avgHeartRate} bpm</p>
                  </div>
                )}
                {activity.maxHeartRate && (
                  <div>
                    <p className="text-sm text-muted-foreground">Maximum</p>
                    <p className="text-xl font-bold">{activity.maxHeartRate} bpm</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Power */}
        {(activity.avgPower || activity.maxPower) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Power
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {activity.avgPower && (
                  <div>
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-xl font-bold">{activity.avgPower} W</p>
                  </div>
                )}
                {activity.maxPower && (
                  <div>
                    <p className="text-sm text-muted-foreground">Maximum</p>
                    <p className="text-xl font-bold">{activity.maxPower} W</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Elevation */}
        {activity.elevationGain && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUp className="h-5 w-5 text-primary" />
                Elevation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="text-sm text-muted-foreground">Total Gain</p>
                <p className="text-xl font-bold">{activity.elevationGain?.toFixed(2)} m</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 