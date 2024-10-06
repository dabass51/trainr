// app/api/ask-llm/route.ts

import { NextRequest, NextResponse } from 'next/server';

// Import your askLlm function
import { askLlm } from '@/lib/tools';

export async function POST(req: NextRequest) {
    try {
        const { prompt } = await req.json();

        if (!prompt || prompt.trim() === '') {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const response = await askLlm(prompt);

        return NextResponse.json({ answer: response });
    } catch (error) {
        console.error('Error in ask-llm API route:', error);
        return NextResponse.json(
            { error: 'Failed to get response from LLM' },
            { status: 500 }
        );
    }
}
