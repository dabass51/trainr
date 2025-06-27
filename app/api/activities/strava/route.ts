import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';
import { ActivityType, Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    console.log( 'session' )
    console.log( session )

    if (!session?.user?.id) {
        console.error('No session or user ID found');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get the user's Strava tokens
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                stravaAccessToken: true,
                stravaRefreshToken: true,
                stravaTokenExpiresAt: true,
            },
        });

        if (!user?.stravaAccessToken) {
            console.error('No Strava account found for user:', session.user.id);
            return NextResponse.json({ error: 'Strava account not connected' }, { status: 401 });
        }

        // Check if token is expired
        if (user.stravaTokenExpiresAt && user.stravaTokenExpiresAt < new Date()) {
            console.log('Token expired, refreshing...');
            // Token is expired, refresh it
            const response = await fetch('https://www.strava.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID,
                    client_secret: process.env.STRAVA_CLIENT_SECRET,
                    grant_type: 'refresh_token',
                    refresh_token: user.stravaRefreshToken,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to refresh Strava token:', errorText);
                throw new Error(`Failed to refresh Strava token: ${errorText}`);
            }

            const data = await response.json();
            console.log('Successfully refreshed token');

            // Update the user with new tokens
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    stravaAccessToken: data.access_token,
                    stravaRefreshToken: data.refresh_token,
                    stravaTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
                },
            });

            user.stravaAccessToken = data.access_token;
        }
        // Fetch activities from Strava
        const after = request.nextUrl.searchParams.get('after');
        const before = request.nextUrl.searchParams.get('before');
        
        const params = new URLSearchParams({
            per_page: '30',
            page: '1',
        });
        
        if (after) params.append('after', after);
        if (before) params.append('before', before);

        console.log('Fetching activities from Strava...');
        const activitiesResponse = await fetch(
            `https://www.strava.com/api/v3/athlete/activities?${params.toString()}`,
            {
                headers: {
                    'Authorization': `Bearer ${user.stravaAccessToken}`,
                },
            }
        );

        if (!activitiesResponse.ok) {
            const errorText = await activitiesResponse.text();
            console.error('Failed to fetch Strava activities:', errorText);
            throw new Error(`Failed to fetch Strava activities: ${errorText}`);
        }

        const activities = await activitiesResponse.json();
        console.log(`Fetched ${activities.length} activities from Strava`);

        // Process and store activities
        const processedActivities = await Promise.all(activities.map(async (activity: any) => {
            try {
                // Map Strava activity type to our ActivityType
                let activityType: ActivityType = ActivityType.RUNNING;
                switch (activity.type.toUpperCase()) {
                    case 'RIDE':
                        activityType = ActivityType.CYCLING;
                        break;
                    case 'SWIM':
                        activityType = ActivityType.SWIMMING;
                        break;
                    case 'TRIATHLON':
                        activityType = ActivityType.TRIATHLON;
                        break;
                }

                const startTime = new Date(activity.start_date);
                const endTime = new Date(startTime.getTime() + activity.elapsed_time * 1000);

                // Create or update activity in our database
                const existingActivity = await prisma.activity.findFirst({
                    where: {
                        AND: [
                            { userId: session.user.id },
                            { name: activity.name },
                            {
                                startTime: {
                                    equals: startTime
                                }
                            }
                        ]
                    },
                });

                if (existingActivity) {
                    console.log(`Activity already exists: ${activity.name}`);
                    return existingActivity;
                }

                // Fetch detailed activity data including GPS points
                console.log(`Fetching detailed data for activity: ${activity.name} (ID: ${activity.id})`);
                let streams: any[] = [];
                try {
                    const detailedResponse = await fetch(
                        `https://www.strava.com/api/v3/activities/${activity.id}/streams?keys=latlng,altitude,time,heartrate,cadence,watts,velocity_smooth`,
                        {
                            headers: {
                                'Authorization': `Bearer ${user.stravaAccessToken}`,
                            },
                        }
                    );

                    if (!detailedResponse.ok) {
                        const errorText = await detailedResponse.text();
                        console.log(`No detailed data available for activity ${activity.name} (ID: ${activity.id}): ${errorText}`);
                        // Continue without GPS data
                    } else {
                        streams = await detailedResponse.json();
                        console.log(`Fetched ${streams.length} streams for activity: ${activity.name}`);
                        console.log('Stream types:', streams.map((s: any) => s.type));
                    }
                } catch (error) {
                    console.log(`Error fetching detailed data for activity ${activity.name} (ID: ${activity.id}):`, error);
                    // Continue without GPS data
                }

                // Process GPS points
                const gpsPoints = streams.find((s: any) => s.type === 'latlng')?.data || [];
                const altitudes = streams.find((s: any) => s.type === 'altitude')?.data || [];
                const timestamps = streams.find((s: any) => s.type === 'time')?.data || [];
                const heartRates = streams.find((s: any) => s.type === 'heartrate')?.data || [];
                const cadences = streams.find((s: any) => s.type === 'cadence')?.data || [];
                const powers = streams.find((s: any) => s.type === 'watts')?.data || [];
                const velocities = streams.find((s: any) => s.type === 'velocity_smooth')?.data || [];

                console.log(`Found ${gpsPoints.length} GPS points for activity ${activity.name}`);

                // First create the activity with GPS data
                const newActivity = await prisma.activity.create({
                    data: {
                        user: {
                            connect: { id: session.user.id }
                        },
                        name: activity.name,
                        activityType,
                        startTime,
                        endTime,
                        duration: Math.round(activity.elapsed_time),
                        distance: activity.distance,
                        avgHeartRate: activity.average_heartrate || null,
                        maxHeartRate: activity.max_heartrate || null,
                        avgPower: activity.average_watts || null,
                        maxPower: activity.max_watts || null,
                        avgCadence: activity.average_cadence || null,
                        maxCadence: activity.max_cadence || null,
                        avgSpeed: activity.average_speed || null,
                        maxSpeed: activity.max_speed || null,
                        elevationGain: activity.total_elevation_gain || null,
                        calories: activity.calories || null,
                        gpsData: gpsPoints.length > 0 ? {
                            create: gpsPoints.map((point: [number, number], index: number) => ({
                                latitude: point[0],
                                longitude: point[1],
                                elevation: altitudes[index] || 0,
                                time: new Date(startTime.getTime() + (timestamps[index] || 0) * 1000),
                                pulse: heartRates[index] || null,
                                watts: powers[index] || null,
                                userId: session.user.id,
                            })),
                        } : undefined,
                    },
                    include: {
                        gpsData: true,
                    },
                });

                console.log(`Created activity ${activity.name} with ${newActivity.gpsData?.length || 0} GPS points`);

                return newActivity;
            } catch (error) {
                console.error(`Error processing activity ${activity.name}:`, error);
                throw error;
            }
        }));

        console.log(`Successfully processed ${processedActivities.length} activities`);
        return NextResponse.json(processedActivities);
    } catch (error) {
        console.error('Error in Strava activities sync:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to sync activities' },
            { status: 500 }
        );
    }
} 