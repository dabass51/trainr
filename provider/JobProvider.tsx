'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from "@/components/ui/use-toast"

interface Job {
    id: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    result?: string;
    error?: string;
}

interface JobContextType {
    job: Job | null;
    setJob: (job: Job | null) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export function JobProvider({ children }: { children: ReactNode }) {
    const [job, setJob] = useState<Job | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        async function pollJobStatus(jobId: string) {
            try {
                const res = await fetch(`/api/jobs/status?jobId=${jobId}`);
                const data: Job = await res.json();

                if (data.status === 'COMPLETED' || data.status === 'FAILED') {
                    setJob(data);
                    // Show toast notification based on status
                    if (data.status === 'COMPLETED') {
                        toast({
                            title: "Success",
                            description: "Training plan generated successfully!",
                        });
                    } else {
                        toast({
                            title: "Error",
                            description: data.error || "Failed to generate training plan",
                            variant: "destructive",
                        });
                    }
                } else {
                    setTimeout(() => pollJobStatus(jobId), 5000); // Poll every 5 seconds
                }
            } catch (error) {
                console.error('Error polling job status:', error);
                toast({
                    title: "Error",
                    description: "Error checking job status",
                    variant: "destructive",
                });
            }
        }

        if (job && job.status === 'IN_PROGRESS') {
            pollJobStatus(job.id);
        }
    }, [job, toast]);

    return (
        <JobContext.Provider value={{ job, setJob }}>
            {children}
        </JobContext.Provider>
    );
}

export function useJob() {
    const context = useContext(JobContext);
    if (!context) {
        throw new Error('useJob must be used within a JobProvider');
    }
    return context;
}
