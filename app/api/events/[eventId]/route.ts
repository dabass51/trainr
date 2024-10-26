import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { eventId: string } }) {
    const { eventId } = params;

    console.log(eventId)

    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json(event, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching event' }, { status: 500 });
    }
}
