'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Chat from '@/components/Chat';
import {Button} from '@/components/ui/button'
import TrainingUnitsList from '@/components/TrainingUnitsList';
import TrainingUnitsCalendar from '@/components/TrainingUnitsCalendar';
import { List, Calendar } from 'lucide-react';
import { useJob } from '@/provider/JobProvider';


interface TrainingUnit {
    id: string;
    type: string;
    description: string;
    instruction: string;
    duration: number;
    intensity: string;
    date: string;
    completed: boolean;
}

export default function TrainingUnitsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [units, setUnits] = useState<TrainingUnit[]>([]);
    const [isCalendarView, setIsCalendarView] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const { setJob } = useJob();

    useEffect(() => {
        if (session) {
            fetchTrainingUnits();
        }
    }, [session]);

    const fetchTrainingUnits = async () => {
        const response = await fetch('/api/training-units');
        if (response.ok) {
            const data = await response.json();
            setUnits(data);
        } else {
            setError('Failed to fetch training units');
        }
    };

    const handleComplete = async (id: string) => {
        const response = await fetch('/api/training-units', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, completed: true }),
        });

        if (response.ok) {
            fetchTrainingUnits();
        }
    };

    const handleDelete = async (id: string) => {
        const response = await fetch(`/api/training-units?id=${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchTrainingUnits();
        }
    };

    const handleDateClick = (selectedDays: Date[]) => {
        console.log('asdasd')
        if (selectedDays.length > 0) {
            const date = selectedDays[0].toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
            setSelectedDate(date);
        } else {
            setSelectedDate(null);
        }
        setIsCalendarView(false);
    };

    const handleGeneratePlan = async (prompt: string) => {
        try {
            const response = await fetch('/api/generate-training-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.jobId) {
                    setJob({ id: data.jobId, status: 'IN_PROGRESS' });
                }
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to generate training plan');
            }
        } catch (error) {
            console.error('Error generating training plan:', error);
            setError('An unexpected error occurred');
        }
    };

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (status === 'unauthenticated') {
        router.push('/auth/signin');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Training Units</h1>

            {/* Chat Component for handling prompt and generating plans */}
            <Chat onGeneratePlan={handleGeneratePlan}/>

            {/* Switch between List View and Calendar View */}
            <div className="mb-4 flex space-x-4">
                <Button
                    variant={!isCalendarView ? 'default' : 'secondary'}
                    onClick={() => setIsCalendarView(false)}
                >
                    <List/>
                </Button>
                <Button
                    variant={isCalendarView ? 'default' : 'secondary'}
                    onClick={() => setIsCalendarView(true)}
                >
                    <Calendar/>
                </Button>
            </div>


            {/* Render either List or Calendar based on the view */}
            {isCalendarView ? (
                <TrainingUnitsCalendar trainingUnits={units} onDaySelect={handleDateClick} specialEvents={[]}/>
                ) : (
                <TrainingUnitsList units={units} onComplete={handleComplete} onDelete={handleDelete}/>
            )}

            {error && <div className="text-red-500">{error}</div>}
        </div>
    );
}
