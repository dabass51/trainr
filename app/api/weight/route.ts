import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {

        const session = await getServerSession( authOptions )

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!session.user.id) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        const weights = await prisma.weightEntry.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'asc' },
        });

        if (!weights) {
            return NextResponse.json({ message: 'weights not found' }, { status: 404 });
        }

        return NextResponse.json(weights, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { weight, unit, date } = await req.json();

    const session = await getServerSession( authOptions )

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.id) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    try {
        const existingEntry = await prisma.weightEntry.findFirst({
            where: {
                userId: session.user.id,
                date: new Date(date).toISOString(),
            },
        });

        if (existingEntry) {
            await prisma.weightEntry.update({
                where: { id: existingEntry.id },
                data: { weight: parseFloat(weight), unit },
            });
        } else {
            await prisma.weightEntry.create({
                data: {
                    userId:session.user.id,
                    weight: parseFloat(weight),
                    unit,
                    date: new Date(date).toISOString(),
                },
            });
        }

        return NextResponse.json({ message: 'Weight entry saved' }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const { id, weight, unit } = await req.json();

    if (!id || !weight || !unit) {
        return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const weightEntry = await prisma.weightEntry.findUnique({
            where: { id }
        });

        if (!weightEntry || weightEntry.userId !== session.user.id) {
            return NextResponse.json({ message: 'Invalid user or entry not found' }, { status: 403 });
        }

        if (weightEntry.userId !== session.user.id) {
            return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
        }

        const updatedEntry = await prisma.weightEntry.update({
            where: { id },
            data: {
                weight: parseFloat(weight),
                unit,
            },
        });

        return NextResponse.json(updatedEntry, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
    }
}
