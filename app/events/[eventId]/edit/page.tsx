'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Import useParams to get eventId
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditEvent() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { eventId } = useParams();

    useEffect(() => {
        async function fetchEvent() {
            if (!eventId) return;

            const res = await fetch(`/api/events/${eventId}`);
            const data = await res.json();

            setTitle(data.title);
            setDescription(data.description);
            setDate(new Date(data.date).toISOString().split('T')[0]); // Format date for input
        }

        fetchEvent();
    }, [eventId]);

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch(`/api/events/${eventId}/edit`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, date }),
        });

        setLoading(false);

        if (res.ok) {
            router.push('/events'); // Redirect to the events list page
        } else {
            console.error('Error updating event');
        }
    };

    if (!eventId) {
        return <p>Loading event data...</p>; // Handle the case where eventId is not available yet
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Edit Event</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium">
                            Title
                        </label>
                        <Input
                            id="title"
                            type="text"
                            placeholder="Event title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium">
                            Description
                        </label>
                        <Textarea
                            id="description"
                            placeholder="Event description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="date" className="block text-sm font-medium">
                            Date
                        </label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Event'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
