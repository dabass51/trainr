// app/api/gps-data/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import { prisma } from '../../../lib/prisma';

export async function GET(req: NextRequest) {
    const session = await getServerSession({ req, ...authOptions });

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const data = await prisma.activity.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(data);
    } catch (error) {
        console.error('Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
