// app/activities/[activityId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { GPSData, Activity, ActivityType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import { Bar, BarChart, LineChart, Line, Tooltip, XAxis, YAxis, CartesianGrid,ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import 'leaflet/dist/leaflet.css';
import { getDistance } from 'geolib';
import ActivityPromptGenerator from '@/components/ActivityPromptGenerator';
import { Loader2 } from "lucide-react";


type GPSDataWithActivity = GPSData & { activity: Activity };

export default function ActivityDetailPage() {
    const { data: session, status } = useSession();
    const params = useParams();
    const { activityId } = params;

    const [activity, setActivity] = useState<Activity | null>(null);
    const [gpsData, setGpsData] = useState<GPSDataWithActivity[]>([]);
    const [activityName, setActivityName] = useState('');
    const [activityType, setActivityType] = useState<ActivityType | null>(null);

    const [metricData, setMetricData] = useState<{ elapsedTime: number; value: number }[]>([]);

    useEffect(() => {
        if (session && activityId) {
            void fetchGpsData();
        }
    }, [session, activityId]);

    const fetchGpsData = async () => {
        try {
            const response = await fetch(`/api/activities/${activityId}/gps-data`);
            if (response.ok) {
                const data: GPSDataWithActivity[] = await response.json();

                if (data.length > 0) {
                    setActivityName(data[0].activity.name);
                    setGpsData(data);
                    setActivity(data[0].activity);
                }
            } else {
                setGpsData([]);
            }
        } catch (error) {
            console.error('Error fetching GPS data:', error);
            setGpsData([]);
        }
    };

    useEffect(() => {
        if (gpsData.length > 0) {
            const startTime = new Date(gpsData[0].time).getTime();
            const gpsDataWithElapsedTime = gpsData.map((dataPoint) => {
                const elapsedTime = (new Date(dataPoint.time).getTime() - startTime) / 1000; // in seconds
                return { ...dataPoint, elapsedTime };
            });
            setGpsData(gpsDataWithElapsedTime);
            setActivityName(gpsData[0].activity.name);
            setActivityType(gpsData[0].activity.activityType);
        }
    }, [gpsData]);

    function computeMetrics(gpsData: GPSDataWithActivity[]) {
        const metricData: { elapsedTime: number; value: number }[] = [];
        const startTime = new Date(gpsData[0].time).getTime();

        for (let i = 1; i < gpsData.length; i++) {
            const prevPoint = gpsData[i - 1];
            const currPoint = gpsData[i];

            const distance = getDistance(
                { latitude: prevPoint.latitude, longitude: prevPoint.longitude },
                { latitude: currPoint.latitude, longitude: currPoint.longitude }
            );

            const timeDiff =
                (new Date(currPoint.time).getTime() - new Date(prevPoint.time).getTime()) / 1000; // seconds

            // Filter out unrealistic data
            if (distance < 5 || timeDiff < 5) {
                continue;
            }

            let value: number;
            if (activityType === 'RUNNING') {
                // Calculate pace in min/km
                value = (timeDiff / 60) / (distance / 1000);
            } else if (activityType === 'CYCLING') {
                // Calculate speed in km/h
                value = (distance / 1000) / (timeDiff / 3600);
            } else {
                // Default to speed in km/h
                value = (distance / 1000) / (timeDiff / 3600);
            }

            const elapsedTime =
                (new Date(currPoint.time).getTime() - startTime) / 1000; // in seconds

            metricData.push({
                elapsedTime,
                value,
            });
        }

        return metricData;
    }


    function smoothData(
        data: { elapsedTime: number; value: number }[],
        windowSize: number
    ) {
        const smoothedData: { elapsedTime: number; value: number }[] = [];

        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - windowSize + 1);
            const window = data.slice(start, i + 1);
            const averageValue = window.reduce((sum, p) => sum + p.value, 0) / window.length;

            smoothedData.push({
                elapsedTime: data[i].elapsedTime,
                value: averageValue,
            });
        }

        return smoothedData;
    }

    useEffect(() => {
        if (gpsData.length > 1) {
            const computedMetricData = computeMetrics(gpsData);
            const smoothedMetricData = smoothData(computedMetricData, 5); // Adjust window size as needed
            setMetricData(smoothedMetricData);
        }
    }, [gpsData, activityType]);



    const positions = gpsData.map(
        (point) => [point.latitude, point.longitude] as [number, number]
    );

    function MapView({ positions }: { positions: [number, number][] }) {
        const map = useMap();

        useEffect(() => {
            if (positions.length > 0) {
                map.fitBounds(positions);
            }
        }, [positions, map]);

        return null;
    }

    function formatTime(totalSeconds: number) {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Sign In</h1>
                <Button onClick={() => void signIn()}>Sign In</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold">Sports Activity Summary</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
                                    zoomControl={false}
                                    dragging={false}
                                    scrollWheelZoom={false}
                                    doubleClickZoom={false}
                                    boxZoom={false}
                                    keyboard={false}
                                >
                                    <TileLayer
                                        attribution="&copy; OpenStreetMap contributors, &copy; CartoDB"
                                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png" // Use CartoDB Positron for grayscale
                                    />
                                    <Polyline positions={positions} color="orange" /> {/* Set color to orange */}
                                    <MapView positions={positions} />
                                </MapContainer>
                            ) : (
                                <p>No GPS data available for this activity.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Heart Rate Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Heart Rate</CardTitle>
                        <CardDescription>Beats per minute over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {gpsData.some((data) => data.pulse !== null) ? (
                            <ResponsiveContainer width="100%" height={400}>

                                <LineChart
                                    data={gpsData.filter((data) => data.pulse !== null)}
                                    margin={{top: 5, right: 20, bottom: 5, left: 0}}
                                >
                                    <XAxis
                                        dataKey="elapsedTime"
                                        tickFormatter={(tick) => formatTime(tick)}
                                        label={{value: 'Time', position: 'insideBottomRight', offset: -5}}
                                    />
                                    <YAxis/>
                                    <Tooltip
                                        labelFormatter={(label) => formatTime(label)}
                                    />
                                    <CartesianGrid stroke="#f5f5f5"/>
                                    <Line type="monotone" dataKey="pulse" stroke="#ff7300" yAxisId={0} dot={false}/>
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No heart rate data available for this activity.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Metric Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>{activityType === 'RUNNING' ? 'Pace Chart' : 'Speed Chart'}</CardTitle>
                        <CardDescription>{activityType === 'RUNNING' ? 'Pace in min per km' : 'Speed in km/h over time'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {metricData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={400}>
                            <LineChart
                                width={800}
                                height={300}
                                data={metricData}
                                margin={{top: 5, right: 20, bottom: 5, left: 0}}
                            >
                                <XAxis
                                    dataKey="elapsedTime"
                                    tickFormatter={(tick) => formatTime(tick)}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={-5}
                                />
                                <YAxis
                                    domain={[
                                        Math.min(...metricData.map((p) => p.value)) - 1,
                                        Math.max(...metricData.map((p) => p.value)) + 1,
                                    ]}
                                    tickFormatter={(tick) =>
                                        activityType === 'RUNNING'
                                            ? `${tick.toFixed(2)} min/km`
                                            : `${tick.toFixed(2)} km/h`
                                    }
                                />
                                <Tooltip
                                    labelFormatter={(label) => formatTime(label)}
                                    formatter={(value) => {
                                        const numericValue = Number(value);
                                        const formattedValue = numericValue.toFixed(2);
                                        const unit = activityType === 'RUNNING' ? 'min/km' : 'km/h';
                                        const metricName = activityType === 'RUNNING' ? 'Pace' : 'Speed';

                                        return [`${formattedValue} ${unit}`, metricName];
                                    }}
                                />
                                <CartesianGrid stroke="#f5f5f5"/>
                                <Line type="monotone" dataKey="value" stroke="#8884d8" yAxisId={0} dot={false}/>
                            </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p>No data available for this activity.</p>
                        )}
                    </CardContent>
                </Card>


                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle>AI Analysis</CardTitle>
                        <CardDescription>AI-generated analysis of your effort</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {activity && gpsData.length > 0 ? (
                            <ActivityPromptGenerator activity={activity} gpsData={gpsData}/>
                        ) : (
                            <p>Loading activity data...</p>
                        )}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
