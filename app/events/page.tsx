'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Calendar, MapPin, Trophy, Plus, Edit } from "lucide-react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

interface Event {
    id: string;
    title: string;
    date: string;
    sportType: string;
    distance: number;
    location?: string;
}

export default function EventsList() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return null;
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Error</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Events</CardTitle>
                        <CardDescription>Manage your upcoming sports events</CardDescription>
                    </div>
                    <Link href="/events/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Event
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {events.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground mb-4">No events found. Start by creating one!</p>
                            <Link href="/events/create">
                                <Button variant="outline">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Your First Event
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {events.map((event) => (
                                <Card key={event.id} className="overflow-hidden">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle>{event.title}</CardTitle>
                                                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    <span>{new Date(event.date).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</span>
                                                </div>
                                            </div>
                                            <Link href={`/events/${event.id}/edit/`}>
                                                <Button variant="outline" size="sm">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pb-4">
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary">
                                                <Trophy className="h-3 w-3 mr-1" />
                                                {event.sportType}
                                            </Badge>
                                            {event.distance && (
                                                <Badge variant="secondary">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {event.distance} km
                                                </Badge>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
