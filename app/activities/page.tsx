// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link'

const activityTypes = [
    { value: 'RUNNING', label: 'Running' },
    { value: 'CYCLING', label: 'Cycling' },
    { value: 'WALKING', label: 'Walking' },
    { value: 'SWIMMING', label: 'Swimming' },
    // Add other types as needed
];

export default function Activity() {
    const { data: session, status } = useSession();
    const [activities, setActivities] = useState<any[]>([]);

    const fetchActivities = async () => {
        const response = await fetch('/api/activities');
        if (response.ok) {
            const data = await response.json();
            setActivities(data);
        } else {
            setActivities([]);
        }
    };

    useEffect(() => {
        if (session) fetchActivities();
    }, [session]);

    if (status === 'loading') return <p>Loading...</p>;

    if (!session) {
        return (
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Sign In</h1>
                <Button onClick={() => signIn()}>Sign In</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">

            <h2 className="text-2xl font-bold mt-8 mb-4">Your Activities</h2>
            {activities.length > 0 ? (
                <ul className="space-y-4">
                    {activities.map((data) => (
                        <li key={data.id} className="border p-4 rounded-lg shadow-sm">
                            <p>
                                <strong>name:</strong> <Link href={`/activities/${data.id}`}>{data.name}</Link>
                            </p>
                            <p>
                                <strong>type:</strong> {data.activityType}
                            </p>
                            <Link href={`/activities/${data.id}`}>more</Link>

                        </li>
                    ))}
                </ul>
            ) : (
                <p>No data available.</p>
            )}
        </div>
    );
}
