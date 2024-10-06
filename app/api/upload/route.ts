// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';
import { ActivityType } from '@prisma/client';

import { parseStringPromise } from 'xml2js';

export async function POST(req: NextRequest) {
    const session = await getServerSession({ req, ...authOptions });

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('gpsFile') as File | null;
        const activityName = formData.get('activityName') as ActivityType | null | undefined;
        const activityType = formData.get('activityType') as ActivityType | null | undefined;

        if (!file || !activityName) {
            return NextResponse.json({ error: 'Missing file or activity name' }, { status: 400 });
        }

        const activity = await prisma.activity.create({
            data: {
                name: activityName,
                activityType: activityType,
                userId: session.user.id,
            },
        });

        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);
        const fileContent = fileBuffer.toString('utf-8');

        const parsedData = await parseStringPromise(fileContent);
        const trackPoints = parsedData.gpx.trk[0].trkseg[0].trkpt;

        const dataToInsert = trackPoints.map((pt: any) => ({
            latitude: parseFloat(pt.$.lat),
            longitude: parseFloat(pt.$.lon),
            elevation: parseFloat(pt.ele?.[0]) || 0,
            time: new Date(pt.time?.[0]),
            pulse: pt.extensions?.[0]?.['gpxtpx:TrackPointExtension']?.[0]?.['gpxtpx:hr']?.[0]
                ? parseInt(pt.extensions[0]['gpxtpx:TrackPointExtension'][0]['gpxtpx:hr'][0])
                : null,
            watts: pt.extensions?.[0]?.['power']?.[0]
                ? parseInt(pt.extensions[0]['power'][0])
                : null,
            userId: session.user.id,
            activityId: activity.id,
        }));

        await prisma.gPSData.createMany({ data: dataToInsert });

        return NextResponse.json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
