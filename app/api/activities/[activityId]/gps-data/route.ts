// app/api/activities/[activityId]/gps-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { activityId: string } }
) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { activityId } = params;

  try {
    const gpsData = await prisma.gPSData.findMany({
      where: {
        activityId: activityId,
        userId: session.user.id,
      },
      include: {
        activity: true,
      },
      orderBy: { time: 'asc' },
    });

    if (gpsData.length === 0) {
      return NextResponse.json(
        { error: 'No GPS data found for this activity' },
        { status: 404 }
      );
    }

    return NextResponse.json(gpsData);
  } catch (error) {
    console.error('Fetch GPS Data Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GPS data' },
      { status: 500 }
    );
  }
}
