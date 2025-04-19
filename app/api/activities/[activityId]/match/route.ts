import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { trainingUnitId } = await request.json();

    if (!trainingUnitId) {
      return NextResponse.json({ error: 'Training unit ID is required' }, { status: 400 });
    }

    // Verify activity belongs to user
    const activity = await prisma.activity.findUnique({
      where: { id: params.activityId },
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    if (activity.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify training unit belongs to user
    const trainingUnit = await prisma.trainingUnit.findUnique({
      where: { id: trainingUnitId },
    });

    if (!trainingUnit) {
      return NextResponse.json({ error: 'Training unit not found' }, { status: 404 });
    }

    if (trainingUnit.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update activity with training unit ID and mark training unit as completed
    const [updatedActivity, updatedTrainingUnit] = await prisma.$transaction([
      prisma.activity.update({
        where: { id: params.activityId },
        data: { trainingUnitId },
      }),
      prisma.trainingUnit.update({
        where: { id: trainingUnitId },
        data: { completed: true },
      }),
    ]);

    return NextResponse.json({
      activity: updatedActivity,
      trainingUnit: updatedTrainingUnit,
    });
  } catch (error) {
    console.error('Error matching activity:', error);
    return NextResponse.json(
      { error: 'Error matching activity with training unit' },
      { status: 500 }
    );
  }
} 