import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function PUT(req: Request, { params }: { params: { eventId: string } }) {
    const { title, description, date } = await req.json();
    const { eventId } = params;

    try {
        const updatedEvent = await prisma.event.update({
            where: { id: eventId },
            data: {
                title,
                description,
                date: new Date(date),
            },
        });

        return NextResponse.json(updatedEvent, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating event' }, { status: 500 });
    }
}
