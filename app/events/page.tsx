'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import Link from 'next/link';


export default function EventsList() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]); // Initialize with an empty array
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state

    useEffect(() => {
        async function fetchEvents() {
            try {
                const res = await fetch(`/api/events`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    setEvents(data);
                } else {
                    setEvents([]);
                }
            } catch (error) {
                setError('Failed to fetch events.');
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center">
                <Spinner className="h-8 w-8" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return null;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Events</CardTitle>
                </CardHeader>
                <CardContent>
                    {events.length === 0 ? (
                        <p>No events found. Start by creating one!</p>
                    ) : (
                        <ul className="space-y-2">
                            {events.map((event) => (
                                <li key={event.id}>
                                    <Card className="bg-gray-100 p-4">
                                        <CardTitle>{event.title}</CardTitle>
                                        <p>{new Date(event.date).toLocaleDateString()}</p>

                                        <p>{event.sportType}</p>
                                        <p>{event.distance}</p>
                                        <Link href={`/events/${event.id}/edit/`}>
                                            <Button>edit event</Button>
                                        </Link>
                                    </Card>
                                </li>
                            ))}
                        </ul>
                    )}

                </CardContent>
                <CardFooter>
                    <Link href="/events/create">
                        <Button>create new event</Button>
                    </Link>
                </CardFooter>
            </Card>

        </div>
    );
}
