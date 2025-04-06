// app/api/generate-training-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { promptAndAnswer } from '@/lib/tools';
import { prisma } from '@/lib/prisma';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Check if user has a profile
        const userProfile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
        });

        if (!userProfile) {
            return NextResponse.json({ 
                error: 'Profile not found',
                message: 'Please complete your profile before generating a training plan',
                code: 'PROFILE_REQUIRED'
            }, { status: 400 });
        }

        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const job = await prisma.job.create({
            data: {
                userId: session.user.id,
                prompt,
                status: 'IN_PROGRESS',
            },
        });

        processTrainingPlan(job.id, prompt, session.user.id);

        return NextResponse.json({ jobId: job.id });
    } catch (error) {
        console.error('Error generating training plan:', error);
        return NextResponse.json({ error: 'Error generating training plan' }, { status: 500 });
    }
}

async function processTrainingPlan(jobId: string, prompt: string, userId: string) {
    try {
        console.log(`Starting job processing for job ID: ${jobId}`);

        // Set job status to IN_PROGRESS
        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: { status: 'IN_PROGRESS' },
        });
        console.log(`Job ${jobId} set to IN_PROGRESS`);

        const result = await promptAndAnswer(prompt, userId);
        console.log(`Received result for job ${jobId}:`, result);

        // Update the job status to COMPLETED with the result
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: 'COMPLETED',
                result: JSON.stringify(result),
            },
        });
        console.log(`Job ${jobId} completed successfully`);
    } catch (error) {
        console.error(`Error processing job ${jobId}:`, error);
        await prisma.job.update({
            where: { id: jobId },
            data: {
                status: 'FAILED',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });
    }
}
