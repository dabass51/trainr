'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Chat from '@/components/Chat';
import {Button} from '@/components/ui/button'
import TrainingUnitsList from '@/components/TrainingUnitsList';
import TrainingCalendar from '@/components/TrainingCalendar';
import { List, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useJob } from '@/provider/JobProvider';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { QuickPrompts } from '@/components/QuickPrompts';

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

type JobStatus = 'IN_PROGRESS' | 'PENDING' | 'COMPLETED' | 'FAILED';

interface Job {
    id: string;
    status: JobStatus;
}

export default function TrainingUnitsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [units, setUnits] = useState<TrainingUnit[]>([]);
    const [isCalendarView, setIsCalendarView] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('trainingViewMode');
            return saved === null ? false : saved === 'calendar';
        }
        return false;
    });
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [job, setJob] = useState<Job | null>(() => {
        if (typeof window !== 'undefined') {
            const savedJob = localStorage.getItem('currentJob');
            return savedJob ? JSON.parse(savedJob) : null;
        }
        return null;
    });
    const [progress, setProgress] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedProgress = localStorage.getItem('currentProgress');
            return savedProgress ? parseInt(savedProgress, 10) : 0;
        }
        return 0;
    });
    const [showProfileAlert, setShowProfileAlert] = useState(false);
    const { toast } = useToast();

    const { setJob: setJobProvider } = useJob();

    // Save job state to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (job) {
                localStorage.setItem('currentJob', JSON.stringify(job));
            } else {
                localStorage.removeItem('currentJob');
            }
        }
    }, [job]);

    // Save progress state to localStorage whenever it changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentProgress', progress.toString());
        }
    }, [progress]);

    useEffect(() => {
        if (session) {
            fetchTrainingUnits();
        }
    }, [session]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (job?.id && job.status === 'IN_PROGRESS') {
            setProgress(prev => {
                const newProgress = Math.min(prev + 10, 90);
                return newProgress;
            });
            
            intervalId = setInterval(async () => {
                try {
                    const response = await fetch(`/api/jobs/status?jobId=${job.id}`);
                    const data = await response.json();
                    
                    if (data.status === 'COMPLETED') {
                        setJob({ ...job, status: 'COMPLETED' });
                        setProgress(100);
                        await fetchTrainingUnits(); // Refresh the training units
                        clearInterval(intervalId);
                        
                        // Clear the stored job and progress when completed
                        localStorage.removeItem('currentJob');
                        localStorage.removeItem('currentProgress');
                    } else if (data.status === 'FAILED') {
                        setJob({ ...job, status: 'FAILED' });
                        setError(data.error || 'Failed to generate training plan');
                        clearInterval(intervalId);
                        
                        // Clear the stored job and progress when failed
                        localStorage.removeItem('currentJob');
                        localStorage.removeItem('currentProgress');
                    }
                } catch (error) {
                    console.error('Error checking job status:', error);
                }
            }, 2000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [job?.id, job?.status]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('trainingViewMode', isCalendarView ? 'calendar' : 'list');
        }
    }, [isCalendarView]);

    const fetchTrainingUnits = async () => {
        const response = await fetch('/api/training-units');
        if (response.ok) {
            const data = await response.json();
            setUnits(data);
        } else {
            setError('Failed to fetch training units');
        }
    };

    const handleComplete = async (id: string, completed: boolean) => {
        const response = await fetch('/api/training-units', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, completed }),
        });

        if (response.ok) {
            fetchTrainingUnits();
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
    };

    const handleDelete = async (id: string) => {
        const response = await fetch(`/api/training-units?id=${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchTrainingUnits();
        }
    };

    const handleDeleteAll = async () => {
        const response = await fetch('/api/training-units?deleteAll=true', {
            method: 'DELETE',
        });

        if (response.ok) {
            fetchTrainingUnits();
            toast({
                title: "Success",
                description: "All training units have been deleted.",
            });
        } else {
            toast({
                title: "Error",
                description: "Failed to delete all training units",
                variant: "destructive",
            });
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
        setError(null);
        setProgress(0);
        localStorage.removeItem('currentJob');
        localStorage.removeItem('currentProgress');
        
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
                    const newJob: Job = {
                        id: data.jobId,
                        status: 'IN_PROGRESS' as const
                    };
                    setJob(newJob);
                    setJobProvider(newJob);
                    localStorage.setItem('currentJob', JSON.stringify(newJob));
                    localStorage.setItem('currentProgress', '0');
                    toast({
                        title: "Generating Plan",
                        description: "Starting to generate your training plan...",
                    });
                }
                setShowProfileAlert(false);
            } else {
                const errorData = await response.json();
                if (errorData.code === 'PROFILE_REQUIRED') {
                    setShowProfileAlert(true);
                }
                setError(errorData.message || errorData.error || 'Failed to generate training plan');
                toast({
                    title: "Error",
                    description: errorData.message || errorData.error || 'Failed to generate training plan',
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error generating training plan:', error);
            setError('An unexpected error occurred');
            toast({
                title: "Error",
                description: 'An unexpected error occurred while generating the training plan',
                variant: "destructive",
            });
        }
    };

    if (status === 'loading') {
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

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Training Units</h1>

            {showProfileAlert && (
                <Alert className="mb-6">
                    <AlertTitle>Profile Required</AlertTitle>
                    <AlertDescription>
                        Please complete your profile before generating a training plan.{' '}
                        <Button 
                            variant="link" 
                            className="p-0 h-auto font-semibold text-primary hover:underline"
                            onClick={() => router.push('/profile')}
                        >
                            Complete Profile
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            {/* Job Status Feedback */}
            {job?.status === 'IN_PROGRESS' && (
                <Card className="mb-6">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-4">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <p className="text-sm font-medium">Generating your training plan...</p>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-sm text-muted-foreground mt-2">
                            This may take a few moments. We&apos;re using AI to create a personalized plan for you.
                        </p>
                    </CardContent>
                </Card>
            )}

            {job?.status === 'COMPLETED' && (
                <Alert className="mb-6" variant="default">
                    <AlertTitle>Training Plan Generated</AlertTitle>
                    <AlertDescription>
                        Your new training plan has been created and is ready to view below.
                    </AlertDescription>
                </Alert>
            )}

            {/* Chat Component for handling prompt and generating plans */}
            <Chat 
                onGeneratePlan={handleGeneratePlan}
                disabled={job?.status === 'IN_PROGRESS'}
            />

            {/* Quick Prompts */}
            <div className="mt-4">
                <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
                <QuickPrompts onPromptSelect={handleGeneratePlan} />
            </div>

            {/* Switch between List View and Calendar View */}
            <div className="mb-4 flex space-x-4">
                <Button
                    variant={!isCalendarView ? 'default' : 'secondary'}
                    onClick={() => setIsCalendarView(false)}
                >
                    <List className="h-4 w-4 mr-2"/>
                    List
                </Button>
                <Button
                    variant={isCalendarView ? 'default' : 'secondary'}
                    onClick={() => setIsCalendarView(true)}
                >
                    <CalendarIcon className="h-4 w-4 mr-2"/>
                    Calendar
                </Button>
            </div>

            {/* Render either List or Calendar based on the view */}
            {isCalendarView ? (
                <TrainingCalendar trainingUnits={units} />
            ) : (
                <TrainingUnitsList 
                    units={units} 
                    onComplete={handleComplete} 
                    onDelete={handleDelete} 
                    onDeleteAll={handleDeleteAll}
                />
            )}

            {error && !showProfileAlert && <div className="text-red-500 mt-4">{error}</div>}
        </div>
    );
}
