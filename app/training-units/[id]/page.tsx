'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
    Calendar, 
    Clock, 
    Activity, 
    CheckCircle2, 
    XCircle,
    Dumbbell,
    Footprints,
    Bike,
    ArrowLeft
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

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

const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'run':
            return <Footprints className="h-5 w-5" />;
        case 'bike':
            return <Bike className="h-5 w-5" />;
        default:
            return <Dumbbell className="h-5 w-5" />;
    }
};

const getIntensityColor = (intensity: string) => {
    switch (intensity.toLowerCase()) {
        case 'low':
            return 'bg-green-100 text-green-800';
        case 'medium':
            return 'bg-yellow-100 text-yellow-800';
        case 'high':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const LoadingSkeleton = () => (
    <div className="container mx-auto px-4 py-8 max-w-full">
        <div className="h-10 w-40 mb-6">
            <Skeleton className="h-full w-full" />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-40" />
                    </div>

                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-32" />
                    </div>

                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-36" />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-20 w-full" />
                    </div>

                    <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-8">
                <Skeleton className="h-10 w-40" />
            </div>
        </div>
    </div>
);

export default function TrainingUnitPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [unit, setUnit] = useState<TrainingUnit | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrainingUnit = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/training-units/${params.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setUnit(data);
                } else {
                    toast({
                        title: "Error",
                        description: "Failed to fetch training unit",
                        variant: "destructive",
                    });
                    router.push('/training-units');
                }
            } catch (error) {
                console.error('Error fetching training unit:', error);
                toast({
                    title: "Error",
                    description: "Failed to fetch training unit",
                    variant: "destructive",
                });
                router.push('/training-units');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrainingUnit();
    }, [params.id, router, toast]);

    const handleComplete = async (completed: boolean) => {
        try {
            const response = await fetch('/api/training-units', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: params.id, completed }),
            });

            if (response.ok) {
                setUnit(prev => prev ? { ...prev, completed } : null);
                toast({
                    title: completed ? "Training Unit Completed" : "Training Unit Uncompleted",
                    description: completed ? "Training unit marked as completed!" : "Training unit marked as pending.",
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to update training unit status",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error updating training unit:', error);
            toast({
                title: "Error",
                description: "Failed to update training unit status",
                variant: "destructive",
            });
        }
    };

    if (isLoading) {
        return <LoadingSkeleton />;
    }

    if (!unit) {
        return null;
    }

    const formattedDate = new Date(unit.date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="container mx-auto px-4 py-8 max-w-full">
            <Button
                variant="ghost"
                onClick={() => router.push('/training-units')}
                className="mb-6"
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Training Units
            </Button>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        {getTypeIcon(unit.type)}
                        <h1 className="text-2xl font-bold">{unit.type}</h1>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        unit.completed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                        {unit.completed ? 'Completed' : 'Pending'}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>{formattedDate}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{unit.duration} minutes</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <Activity className="h-4 w-4 text-gray-500" />
                            <span className={`px-2 py-1 rounded ${getIntensityColor(unit.intensity)}`}>
                                {unit.intensity} intensity
                            </span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h4 className="font-medium">Description</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{unit.description}</p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium">Instructions</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{unit.instruction}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-8">
                    <Button
                        variant={unit.completed ? "destructive" : "default"}
                        onClick={() => handleComplete(!unit.completed)}
                        className="gap-2"
                    >
                        {unit.completed ? (
                            <>
                                <XCircle className="h-4 w-4" />
                                Mark as Incomplete
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Mark as Complete
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
} 