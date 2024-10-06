import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { getDistance } from 'geolib';
import { GPSData, Activity } from '@prisma/client';
import {Textarea} from '@/components/ui/textarea'

interface ActivityPromptGeneratorProps {
    activity: Activity | null;
    gpsData: (GPSData | null)[];
}

export default function ActivityPromptGenerator({
                                                    activity,
                                                    gpsData,
                                                }: ActivityPromptGeneratorProps) {
    const [prompt, setPrompt] = useState('');
    const [llmResponse, setLlmResponse] = useState('');

    useEffect(() => {
        if (activity && activity.activityType && gpsData.length > 1) {
            generatePromptData(activity, gpsData);
        }
    }, [gpsData, activity]);

    useEffect(() => {
        const fetchLlmResponse = async () => {
            if (prompt !== '') {
                try {
                    const response = await fetch('/api/ask-llm', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ prompt }),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }

                    const data = await response.json();
                    setLlmResponse(data.answer);
                } catch (error) {
                    console.error('Error fetching LLM response:', error);
                }
            }
        };

        fetchLlmResponse();
    }, [prompt]);

    const generatePromptData = (activity: Activity, gpsData: (GPSData | null)[]) => {
        const validGpsData = gpsData.filter((point) => point !== null) as GPSData[];

        if (validGpsData.length < 2) {
            return;
        }

        const totalDistance = calculateTotalDistance(validGpsData);
        const totalTime = calculateTotalTime(validGpsData);
        const averagePaceOrSpeed = calculateAveragePaceOrSpeed(
            totalDistance,
            totalTime,
            activity.activityType
        );
        const elevationGain = calculateElevationGain(validGpsData);
        const heartRateData = calculateHeartRateData(validGpsData);
        const splits = generateSplitTimes(validGpsData, activity.activityType);

        const generatedPrompt = generatePrompt(
            activity,
            totalDistance,
            totalTime,
            averagePaceOrSpeed,
            elevationGain,
            heartRateData,
            splits
        );

        setPrompt(generatedPrompt);
    };

    function calculateTotalDistance(gpsData: GPSData[]): number {
        let totalDistance = 0;

        for (let i = 1; i < gpsData.length; i++) {
            const prevPoint = gpsData[i - 1];
            const currPoint = gpsData[i];

            if (
                prevPoint.latitude != null &&
                prevPoint.longitude != null &&
                currPoint.latitude != null &&
                currPoint.longitude != null
            ) {
                const distance = getDistance(
                    { latitude: prevPoint.latitude, longitude: prevPoint.longitude },
                    { latitude: currPoint.latitude, longitude: currPoint.longitude }
                );

                totalDistance += distance;
            }
        }

        return totalDistance; // in meters
    }

    function calculateTotalTime(gpsData: GPSData[]): number {
        if (gpsData.length < 2) {
            return 0;
        }

        const startTime = gpsData[0].time ? new Date(gpsData[0].time).getTime() : 0;
        const endTime = gpsData[gpsData.length - 1].time
            ? new Date(gpsData[gpsData.length - 1].time).getTime()
            : 0;

        return (endTime - startTime) / 1000; // in seconds
    }

    function calculateAveragePaceOrSpeed(
        totalDistance: number,
        totalTime: number,
        activityType: string
    ): number {
        if (activityType === 'RUNNING') {
            const pace = (totalTime / 60) / (totalDistance / 1000); // min/km
            return pace;
        } else {
            const speed = (totalDistance / 1000) / (totalTime / 3600); // km/h
            return speed;
        }
    }

    function calculateElevationGain(gpsData: GPSData[]): number {
        let totalGain = 0;

        for (let i = 1; i < gpsData.length; i++) {
            if (gpsData[i]?.elevation != null && gpsData[i - 1]?.elevation != null) {
                const elevationDiff = gpsData[i].elevation - gpsData[i - 1].elevation;
                if (elevationDiff > 0) {
                    totalGain += elevationDiff;
                }
            }
        }

        return totalGain; // in meters
    }

    function calculateHeartRateData(
        gpsData: GPSData[]
    ): { averageHeartRate: number | null; maxHeartRate: number | null } {
        const heartRates = gpsData
            .filter((data) => data.pulse !== null && data.pulse !== undefined)
            .map((data) => data.pulse as number);

        if (heartRates.length === 0) {
            return { averageHeartRate: null, maxHeartRate: null };
        }

        const totalHeartRate = heartRates.reduce((sum, hr) => sum + hr, 0);
        const averageHeartRate = totalHeartRate / heartRates.length;
        const maxHeartRate = Math.max(...heartRates);

        return { averageHeartRate, maxHeartRate };
    }

    function generateSplitTimes(
        gpsData: GPSData[],
        activityType: string
    ): { splitNumber: number; paceOrSpeed: number }[] {
        const splits: { splitNumber: number; paceOrSpeed: number }[] = [];
        let splitDistance = 0;
        let splitTime = 0;
        let splitNumber = 1;
        const splitInterval = 1000; // meters (1 km splits)

        for (let i = 1; i < gpsData.length; i++) {
            const prevPoint = gpsData[i - 1];
            const currPoint = gpsData[i];

            if (
                prevPoint.latitude != null &&
                prevPoint.longitude != null &&
                currPoint.latitude != null &&
                currPoint.longitude != null &&
                prevPoint.time &&
                currPoint.time
            ) {
                const distance = getDistance(
                    { latitude: prevPoint.latitude, longitude: prevPoint.longitude },
                    { latitude: currPoint.latitude, longitude: currPoint.longitude }
                );

                splitDistance += distance;
                splitTime +=
                    (new Date(currPoint.time).getTime() - new Date(prevPoint.time).getTime()) /
                    1000;

                if (splitDistance >= splitInterval) {
                    let paceOrSpeed: number;

                    if (activityType === 'RUNNING') {
                        paceOrSpeed = (splitTime / 60) / (splitDistance / 1000); // min/km
                    } else {
                        paceOrSpeed = (splitDistance / 1000) / (splitTime / 3600); // km/h
                    }

                    splits.push({ splitNumber, paceOrSpeed });

                    // Reset for next split
                    splitDistance = 0;
                    splitTime = 0;
                    splitNumber++;
                }
            }
        }

        return splits;
    }

    function generatePrompt(
        activity: Activity,
        totalDistance: number,
        totalTime: number,
        averagePaceOrSpeed: number,
        elevationGain: number,
        heartRateData: { averageHeartRate: number | null; maxHeartRate: number | null },
        splits: { splitNumber: number; paceOrSpeed: number }[]
    ): string {
        const totalDistanceKm = (totalDistance / 1000).toFixed(2);

        const hours = Math.floor(totalTime / 3600);
        const minutes = Math.floor((totalTime % 3600) / 60);
        const seconds = Math.floor(totalTime % 60);
        const totalTimeFormatted = `${
            hours > 0 ? hours + 'h ' : ''
        }${minutes}m ${seconds}s`;

        const averagePaceOrSpeedFormatted =
            activity.activityType === 'RUNNING'
                ? `${averagePaceOrSpeed.toFixed(2)} min/km`
                : `${averagePaceOrSpeed.toFixed(2)} km/h`;

        const elevationGainFormatted = `${elevationGain.toFixed(0)} meters`;

        const averageHeartRateFormatted = heartRateData.averageHeartRate
            ? `${heartRateData.averageHeartRate.toFixed(0)} bpm`
            : 'N/A';
        const maxHeartRateFormatted = heartRateData.maxHeartRate
            ? `${heartRateData.maxHeartRate.toFixed(0)} bpm`
            : 'N/A';

        const splitsFormatted = splits
            .map((split) => {
                const paceOrSpeedFormatted =
                    activity.activityType === 'RUNNING'
                        ? `${split.paceOrSpeed.toFixed(2)} min/km`
                        : `${split.paceOrSpeed.toFixed(2)} km/h`;
                return `  - Split ${split.splitNumber}: ${paceOrSpeedFormatted}`;
            })
            .join('\n');

        const prompt = `Hello! I recently completed a ${
            activity.activityType?.toLowerCase()
        } session and would appreciate your insights on my performance. Here are the details:

- **Activity Type:** ${
            // @ts-ignore
            activity.activityType?.charAt(0) + activity.activityType?.slice(1).toLowerCase()
        }
- **Total Distance:** ${totalDistanceKm} km
- **Total Time:** ${totalTimeFormatted}
- **Average ${
            activity.activityType === 'RUNNING' ? 'Pace' : 'Speed'
        }:** ${averagePaceOrSpeedFormatted}
- **Elevation Gain:** ${elevationGainFormatted}
- **Average Heart Rate:** ${averageHeartRateFormatted}
- **Maximum Heart Rate:** ${maxHeartRateFormatted}
- **Split Times:**
${splitsFormatted}

Based on this information, could you please analyze my performance and provide suggestions on how I can improve my training?`;

        return prompt;
    }

    return (
            <ReactMarkdown>{llmResponse}</ReactMarkdown>


    );
}
