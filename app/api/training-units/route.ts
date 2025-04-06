// app/api/training-units/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {prisma} from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const trainingUnits = await prisma.trainingUnit.findMany({
            where: { userId: session.user?.id },
            orderBy: {
                date: 'asc'
            }
        });
        return NextResponse.json(trainingUnits);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching training units' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { type, description, duration, instruction, intensity, date } = body;

        const trainingUnit = await prisma.trainingUnit.create({
            data: {
                userId: session.user?.id,
                type,
                description,
                instruction,
                duration,
                intensity,
                date: new Date(date),
            },
        });

        return NextResponse.json(trainingUnit);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating training unit' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json({ error: 'Training unit ID is required' }, { status: 400 });
        }

        const trainingUnit = await prisma.trainingUnit.update({
            where: { 
                id,
                userId: session.user?.id 
            },
            data: updateData
        });

        return NextResponse.json(trainingUnit);
    } catch (error) {
        console.error('Error updating training unit:', error);
        return NextResponse.json({ error: 'Error updating training unit' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const deleteAll = searchParams.get('deleteAll') === 'true';

        if (deleteAll) {
            // Delete all training units for the current user
            await prisma.trainingUnit.deleteMany({
                where: {
                    userId: session.user.id
                }
            });
            return NextResponse.json({ message: 'All training units deleted successfully' });
        } else if (id) {
            // Delete single training unit
            const trainingUnit = await prisma.trainingUnit.findUnique({
                where: { id },
                select: { userId: true }
            });

            if (!trainingUnit) {
                return NextResponse.json({ error: 'Training unit not found' }, { status: 404 });
            }

            if (trainingUnit.userId !== session.user.id) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }

            await prisma.trainingUnit.delete({
                where: { id }
            });
            return NextResponse.json({ message: 'Training unit deleted successfully' });
        } else {
            return NextResponse.json({ error: 'Missing id or deleteAll parameter' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error deleting training unit(s):', error);
        return NextResponse.json({ error: 'Failed to delete training unit(s)' }, { status: 500 });
    }
}
