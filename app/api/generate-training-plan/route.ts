// app/api/generate-training-plan/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { promptAndAnswer } from '@/lib/tools';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
        }

        const result = await promptAndAnswer(prompt, session.user.id);

        return NextResponse.json({ message: 'Ollama says:', result });
    } catch (error) {
        console.error('Error generating training plan:', error);
        return NextResponse.json({ error: 'Error generating training plan' }, { status: 500 });
    }
}
