// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
        });
        return NextResponse.json(profile);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching profile' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await request.json();
        const {
            firstName,
            lastName,
            dateOfBirth,
            gender,
            height,
            weight,
            fitnessLevel,
            trainingHistory,
            availableTrainingTime,
        } = body;

        const profile = await prisma.profile.upsert({
            where: { userId: session.user.id },
            update: {
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                height,
                weight,
                fitnessLevel,
                trainingHistory,
                availableTrainingTime,
            },
            create: {
                userId: session.user.id,
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                height,
                weight,
                fitnessLevel,
                trainingHistory,
                availableTrainingTime,
            },
        });
        console.log(profile)

        return NextResponse.json(profile);
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error }, { status: 500 });
    }
}
