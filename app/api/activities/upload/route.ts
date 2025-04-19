import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { parseFitFile, parseGpxFile } from '@/lib/activity-parser';
import { ActivityType } from '@prisma/client';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const activityTypeStr = formData.get('activityType') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!activityTypeStr || !Object.values(ActivityType).includes(activityTypeStr as ActivityType)) {
      return NextResponse.json({ error: 'Valid activity type is required' }, { status: 400 });
    }

    const activityType = activityTypeStr as ActivityType;

    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (!fileType || !['fit', 'gpx'].includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type. Only .fit and .gpx files are supported' }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Parse file based on type
    const parsedActivity = fileType === 'fit'
      ? await parseFitFile(buffer)
      : await parseGpxFile(buffer, activityType);

    // Detailed duration logging
    console.log('Activity duration details:');
    console.log('File type:', fileType);
    console.log('Raw duration:', parsedActivity.duration);
    console.log('Start time:', parsedActivity.startTime.toISOString());
    console.log('End time:', parsedActivity.endTime.toISOString());
    console.log('Calculated duration from timestamps:', Math.round((new Date(parsedActivity.endTime).getTime() - new Date(parsedActivity.startTime).getTime()) / 1000));

    // Create activity in database
    const activity = await prisma.activity.create({
      data: {
        userId: session.user.id,
        name: parsedActivity.name,
        activityType: parsedActivity.activityType,
        startTime: parsedActivity.startTime,
        endTime: parsedActivity.endTime,
        duration: parsedActivity.duration,
        distance: parsedActivity.distance,
        avgHeartRate: parsedActivity.avgHeartRate,
        maxHeartRate: parsedActivity.maxHeartRate,
        avgPower: parsedActivity.avgPower,
        maxPower: parsedActivity.maxPower,
        avgCadence: parsedActivity.avgCadence,
        maxCadence: parsedActivity.maxCadence,
        avgSpeed: parsedActivity.avgSpeed,
        maxSpeed: parsedActivity.maxSpeed,
        elevationGain: parsedActivity.elevationGain,
        calories: parsedActivity.calories,
      },
    });

    console.log('Stored activity details:');
    console.log('Activity ID:', activity.id);
    console.log('Stored duration:', activity.duration);
    console.log('Stored start time:', activity.startTime.toISOString());
    console.log('Stored end time:', activity.endTime.toISOString());
    console.log('Stored calculated duration:', Math.round((activity.endTime.getTime() - activity.startTime.getTime()) / 1000));

    // Create GPS points
    if (parsedActivity.gpsPoints.length > 0) {
      await prisma.gPSData.createMany({
        data: parsedActivity.gpsPoints.map(point => ({
          activityId: activity.id,
          userId: session.user.id,
          latitude: point.latitude,
          longitude: point.longitude,
          elevation: point.elevation,
          time: point.time,
          pulse: point.heartRate,
          watts: point.power,
        })),
      });
    }

    // Find potential matching training units
    const startOfDay = new Date(parsedActivity.startTime);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedActivity.startTime);
    endOfDay.setHours(23, 59, 59, 999);

    const matchingTrainingUnits = await prisma.trainingUnit.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        completed: false,
      },
    });

    return NextResponse.json({
      activity,
      matchingTrainingUnits,
    });
  } catch (error) {
    console.error('Error uploading activity:', error);
    return NextResponse.json(
      { error: 'Failed to process activity file' },
      { status: 500 }
    );
  }
} 