import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust based on your project structure
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
    const { title, description, date } = await req.json();

    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.user.id) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const event = await prisma.event.create({
            data: {
                title,
                description,
                date: new Date(date),
                user: { connect: { id: session.user.id } }, // Connect event with a user via userId
            },
        });

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Error creating event' }, { status: 500 });
    }
}
