import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trainingUnit = await prisma.trainingUnit.findUnique({
            where: {
                id: params.id,
            },
        });

        if (!trainingUnit) {
            return NextResponse.json({ error: 'Training unit not found' }, { status: 404 });
        }

        if (trainingUnit.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json(trainingUnit);
    } catch (error) {
        console.error('Error fetching training unit:', error);
        return NextResponse.json({ error: 'Failed to fetch training unit' }, { status: 500 });
    }
} 