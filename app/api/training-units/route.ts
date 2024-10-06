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
            orderBy:
                {
                    date: 'desc'
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
        const { id, type, description, duration, intensity, date, completed } = body;

        const trainingUnit = await prisma.trainingUnit.update({
            where: { id, userId: session.user?.id },
            data: {
                type,
                description,
                duration,
                intensity,
                date: new Date(date),
                completed,
            },
        });

        return NextResponse.json(trainingUnit);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating training unit' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Training unit ID is required' }, { status: 400 });
        }

        await prisma.trainingUnit.delete({
            where: { id, userId: session.user?.id },
        });

        return NextResponse.json({ message: 'Training unit deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting training unit' }, { status: 500 });
    }
}
