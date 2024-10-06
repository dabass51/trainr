// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';

const activityTypes = [
    { value: 'RUNNING', label: 'Running' },
    { value: 'CYCLING', label: 'Cycling' },
    { value: 'WALKING', label: 'Walking' },
    { value: 'SWIMMING', label: 'Swimming' },
    // Add other types as needed
];

const gpsDataSchema = z.object({
    activityName: z.string().min(1, 'Please enter an activity name.'),
    activityType: z.enum(['RUNNING', 'CYCLING', 'SWIMMING']),
    gpsFile: z.custom<FileList>((value) => {
        if (typeof window === 'undefined') {
            return true;
        }
        return value instanceof FileList && value.length > 0;
    }, {
        message: 'Please select a file.',
    }).refine(
        (value) => {
            if (typeof window === 'undefined') {
                return true;
            }
            const file = value[0];
            return file && (file.type === 'application/gpx+xml' || file.name.endsWith('.gpx'));
        },
        {
            message: 'Please upload a .gpx file.',
        }
    ),
});


export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [activities, setActivities] = useState<any[]>([]);

    const form = useForm({
        resolver: zodResolver(gpsDataSchema),
        defaultValues: {
            gpsFile: null,
            activityName: '',
            activityType: ''
        },
    });

    const onSubmit = async (data: any) => {
        const file = data.gpsFile[0];
        const { activityName, activityType } = data;

        const formData = new FormData();
        formData.append('gpsFile', file);
        formData.append('activityName', activityName);
        formData.append('activityType', activityType);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            setMessage('File uploaded and data saved!');
            fetchActivities();
        } else {
            const error = await response.json();
            setMessage(`Upload failed: ${error.error}`);
        }
    };

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

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return null;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Upload GPS Data</h2>

            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="activityName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Activity Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter activity name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="activityType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Activity Type</FormLabel>
                                <FormControl>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <Input placeholder="Select activity type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {activityTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value}>
                                                    {type.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gpsFile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Select a GPX File</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept=".gpx"
                                        onChange={(e) => {
                                            field.onChange(e.target.files);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit">Upload</Button>
                </form>
            </Form>

            {message && <p className="mt-4 text-green-600">{message}</p>}

            <h2 className="text-2xl font-bold mt-8 mb-4">Your Activities</h2>
            {activities.length > 0 ? (
                <ul className="space-y-4">
                    {activities.map((data) => (
                        <li key={data.id} className="border p-4 rounded-lg shadow-sm">
                            <p>
                                <strong>name:</strong> {data.name}
                            </p>
                            <p>
                                <strong>type:</strong> {data.activityType}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No data available.</p>
            )}
        </div>
    );
}
