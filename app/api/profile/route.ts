// app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized - No valid session or user ID' }, { status: 401 });
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
        });

        if (!profile) {
            return NextResponse.json(null);
        }

        return NextResponse.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Error fetching profile' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    console.log('session', session);

    if (!session?.user?.id) {
        console.error('No valid session or user ID');
        return NextResponse.json({ 
            error: 'Unauthorized - No valid session or user ID',
            details: { session: session ? 'exists' : 'missing', userId: session?.user?.id }
        }, { status: 401 });
    }

    try {
        const body = await request.json();
        console.log('Received profile data:', { userId: session.user.id, ...body });

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
            trainingSchedule,
            preferredDisciplines,
            weeklyTrainingHours,
        } = body;

        const profile = await prisma.profile.upsert({
            where: { userId: session.user.id },
            update: {
                firstName,
                lastName,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender,
                height,
                weight,
                fitnessLevel,
                trainingHistory,
                weeklyTrainingDays: [], // This will be derived from trainingSchedule
                weeklyEffort: parseInt(availableTrainingTime) || 0,
                trainingSchedule,
                preferredDisciplines,
            },
            create: {
                userId: session.user.id,
                firstName,
                lastName,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                gender,
                height,
                weight,
                fitnessLevel,
                trainingHistory,
                weeklyTrainingDays: [], // This will be derived from trainingSchedule
                weeklyEffort: parseInt(availableTrainingTime) || 0,
                trainingSchedule,
                preferredDisciplines,
            },
        });

        console.log('Profile updated successfully:', profile);
        return NextResponse.json(profile);
    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json({ 
            error: 'Error updating profile',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
