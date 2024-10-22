'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SportType = 'RUNNING' | 'CYCLING' | 'SWIMMING' | 'TRIATHLON';


export default function CreateEvent() {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [sportType, setSportType] = useState<SportType>('RUNNING');
    const [distance, setDistance] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const router = useRouter();

    const handleSportTypeChange = (value: string) => {
        setSportType(value as SportType);
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/events/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, date, sportType, distance }),
        });

        setLoading(false);

        if (res.ok) {
            console.log('Event created');
            router.push('/events');
        } else {
            console.error('Error creating event');
        }
    };

    const distanceOptions: Record<SportType, string[]> = {
        RUNNING: ['5K', '10K', 'Half Marathon', 'Marathon'],
        CYCLING: ['20K', '50K', '100K', '200K'],
        SWIMMING: ['500m', '1K', '2K', '5K', 'Open Water'],
        TRIATHLON: ['Sprint', 'Olympic', 'Half Ironman', 'Ironman'],
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Event</CardTitle>
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

                    <div>
                        <label htmlFor="sportType" className="block text-sm font-medium">
                            Type of Sport
                        </label>
                        <Select value={sportType} onValueChange={handleSportTypeChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select sport type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RUNNING">Running</SelectItem>
                                <SelectItem value="CYCLING">Cycling</SelectItem>
                                <SelectItem value="SWIMMING">Swimming</SelectItem>
                                <SelectItem value="TRIATHLON">Triathlon</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {sportType && (
                        <div>
                            <label htmlFor="distance" className="block text-sm font-medium">
                                Distance/Event Type
                            </label>
                            <Select value={distance} onValueChange={setDistance}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select distance or event type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {distanceOptions[sportType].map((option) => (
                                        <SelectItem key={option} value={option}>
                                            {option}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <Button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Event'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
