// app/api/gps-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type ActivityWithGPS = Prisma.ActivityGetPayload<{
    include: { gpsData: true }
}>;

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const activities = await prisma.activity.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                gpsData: {
                    orderBy: {
                        time: 'asc'
                    }
                }
            }
        });

        // Return activities with recalculated duration if needed
        const processedActivities = activities.map((activity: ActivityWithGPS) => {
            let calculatedDuration;
            
            // Try to calculate duration from GPS data first
            if (activity.gpsData && activity.gpsData.length >= 2) {
                const firstPoint = activity.gpsData[0];
                const lastPoint = activity.gpsData[activity.gpsData.length - 1];
                calculatedDuration = Math.round(
                    (new Date(lastPoint.time).getTime() - new Date(firstPoint.time).getTime()) / 1000
                );
            } else {
                // Fallback to activity start/end time
                calculatedDuration = Math.round(
                    (new Date(activity.endTime).getTime() - new Date(activity.startTime).getTime()) / 1000
                );
            }
            
            console.log(`Activity ${activity.id}:`, {
                name: activity.name,
                originalDuration: activity.duration,
                calculatedDuration,
                startTime: activity.startTime,
                endTime: activity.endTime,
                gpsPoints: activity.gpsData?.length || 0,
                firstGpsTime: activity.gpsData?.[0]?.time,
                lastGpsTime: activity.gpsData?.[activity.gpsData?.length - 1]?.time
            });

            const { gpsData, ...activityWithoutGps } = activity;
            
            return {
                ...activityWithoutGps,
                duration: activity.duration === 0 || !activity.duration ? calculatedDuration : activity.duration
            };
        });

        return NextResponse.json(processedActivities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json(
            { error: 'Error fetching activities' },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
