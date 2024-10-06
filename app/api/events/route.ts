import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {

    const session = await getServerSession( authOptions )

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const events = await prisma.event.findMany({
            where: { userId: session.user.id },
            orderBy: { date: 'asc' },
        });

        return NextResponse.json(events, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching events' }, { status: 500 });
    }
}
