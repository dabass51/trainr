'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

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

    useEffect(() => {
        async function pollJobStatus(jobId: string) {
            try {
                const res = await fetch(`/api/jobs/status?jobId=${jobId}`);
                const data: Job = await res.json();

                if (data.status === 'COMPLETED' || data.status === 'FAILED') {
                    setJob(data);
                } else {
                    setTimeout(() => pollJobStatus(jobId), 5000); // Poll every 5 seconds
                }
            } catch (error) {
                console.error('Error polling job status:', error);
            }
        }

        if (job && job.status === 'IN_PROGRESS') {
            pollJobStatus(job.id);
        }
    }, [job]);

    return (
        <JobContext.Provider value={{ job, setJob }}>
            {children}
            {job && (job.status === 'COMPLETED' || job.status === 'FAILED') && (
                <div className="toast">
                    {job.status === 'COMPLETED'
                        ? `Job completed: ${job.result}`
                        : `Job failed: ${job.error}`}
                </div>
            )}
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
