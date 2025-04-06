'use client';

import { useState, useEffect } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Dumbbell, Footprints, Bike, Trophy } from 'lucide-react';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { useRouter } from 'next/navigation';
import { format } from "date-fns";
import './calendar.css';

interface TrainingUnit {
    id: string;
    type: string;
    description: string;
    instruction: string;
    duration: number;
    intensity: string;
    date: string;
    completed: boolean;
    isEvent?: boolean;
    eventName?: string;
    eventLocation?: string;
    eventUrl?: string;
}

interface TrainingCalendarProps {
    trainingUnits: TrainingUnit[];
}

// Map training types to icons and colors
type TrainingType = 'run' | 'bike' | 'swim' | 'training_block' | 'cross_training' | 'rest' | 'recovery' | 'event';

const typeConfig: Record<TrainingType, { icon: React.ComponentType<any> | (() => JSX.Element); color: string }> = {
    'run': {
        icon: Footprints,
        color: '#059669' // emerald
    },
    'bike': {
        icon: Bike,
        color: '#0891b2' // cyan
    },
    'swim': {
        icon: () => (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12h20M2 12c2-3 4-4 6-4s4 1 6 4c2-3 4-4 6-4s4 1 6 4M2 12c2 3 4 4 6 4s4-1 6-4c2 3 4 4 6 4s4-1 6-4" />
            </svg>
        ),
        color: '#3b82f6' // blue
    },
    'training_block': {
        icon: Dumbbell,
        color: '#4f46e5' // indigo
    },
    'cross_training': {
        icon: () => (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v4M16 2v4M3 10h18M3 14h18M8 18v4M16 18v4" />
            </svg>
        ),
        color: '#db2777' // pink
    },
    'rest': {
        icon: () => (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12zM16 10h-2.5l2.5-4h-4v8h2.5l-2.5 4h4v-8z" />
            </svg>
        ),
        color: '#6b7280' // gray
    },
    'recovery': {
        icon: () => (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 6v6l4 2" />
            </svg>
        ),
        color: '#a855f7' // purple
    },
    'event': {
        icon: () => (
            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2l4 4M18 6l-4-4M6 18l-4-4M2 18l4-4M12 12l-2-2M12 12l2-2M12 12l-2 2M12 12l2 2" />
            </svg>
        ),
        color: '#f59e0b' // amber
    }
};

export default function TrainingCalendar({ trainingUnits }: TrainingCalendarProps) {
    const [date, setDate] = useState<Date>(new Date());
    const router = useRouter();

    // Debug log to see training unit types
    useEffect(() => {
        console.log('Training Units Types:', trainingUnits.map(unit => unit.type));
    }, [trainingUnits]);

    // Group training units by date
    const trainingUnitsByDate = trainingUnits.reduce((acc, unit) => {
        const dateStr = unit.date.split('T')[0];
        if (!acc[dateStr]) {
            acc[dateStr] = [];
        }
        acc[dateStr].push(unit);
        return acc;
    }, {} as Record<string, TrainingUnit[]>);

    // Custom day content renderer for calendar view
    const renderDayContent = (day: Date) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const units = trainingUnitsByDate[dateStr] || [];

        if (units.length === 0) return null;

        return (
            <div className="absolute bottom-1 left-1 right-1">
                <div className="flex flex-wrap gap-1">
                    {units.map((unit) => {
                        const typeStyle = typeConfig[unit.type as TrainingType] || {
                            icon: Dumbbell,
                            color: '#6b7280'
                        };
                        const Icon = typeStyle.icon;

                        return (
                            <HoverCard key={unit.id} openDelay={0} closeDelay={0}>
                                <HoverCardTrigger asChild>
                                    <div 
                                        className="cursor-pointer p-1 rounded-full"
                                        style={{ backgroundColor: typeStyle.color + '33' }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            router.push(`/training-units/${unit.id}`);
                                        }}
                                    >
                                        <Icon className="h-3 w-3" style={{ color: typeStyle.color }} />
                                    </div>
                                </HoverCardTrigger>
                                <HoverCardContent 
                                    className="w-80 bg-popover shadow-lg border rounded-lg" 
                                    side="right" 
                                    align="start"
                                    sideOffset={5}
                                >
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-semibold">{unit.type}</h4>
                                        <p className="text-sm text-muted-foreground break-words">{unit.description}</p>
                                        <p className="text-sm text-muted-foreground break-words">{unit.instruction}</p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs bg-primary/10 px-2 py-1 rounded">
                                                {unit.intensity} intensity
                                            </span>
                                            <span className="text-xs bg-primary/10 px-2 py-1 rounded">
                                                {unit.duration} min
                                            </span>
                                            {unit.completed && (
                                                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded">
                                                    Completed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </HoverCardContent>
                            </HoverCard>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderEventContent = (unit: TrainingUnit) => {
        const typeStyle = typeConfig[unit.type as TrainingType] || typeConfig.training_block;
        const Icon = unit.isEvent ? Trophy : typeStyle.icon;
        const bgColor = unit.isEvent ? 'bg-amber-500' : typeStyle.color;

        return (
            <HoverCard>
                <HoverCardTrigger asChild>
                    <div className={`flex items-center gap-2 p-1 rounded ${bgColor} text-white min-h-[24px] cursor-pointer`}>
                        <Icon className="h-4 w-4" />
                        <span className="text-sm truncate">
                            {unit.isEvent ? unit.eventName : unit.type}
                        </span>
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80" align="start">
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">
                            {unit.isEvent ? '🎉 ' + unit.eventName : unit.type}
                        </h4>
                        {unit.description && (
                            <p className="text-sm">{unit.description}</p>
                        )}
                        {!unit.isEvent ? (
                            <>
                                <p className="text-sm">Duration: {unit.duration} minutes</p>
                                <p className="text-sm">Intensity: {unit.intensity}</p>
                                <p className="text-sm">Status: {unit.completed ? 'Completed' : 'Pending'}</p>
                                {unit.instruction && (
                                    <p className="text-sm">Instructions: {unit.instruction}</p>
                                )}
                            </>
                        ) : (
                            <>
                                {unit.eventLocation && (
                                    <p className="text-sm">Location: {unit.eventLocation}</p>
                                )}
                                {unit.eventUrl && (
                                    <a 
                                        href={unit.eventUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:text-blue-800 underline block"
                                    >
                                        Event Details
                                    </a>
                                )}
                            </>
                        )}
                    </div>
                </HoverCardContent>
            </HoverCard>
        );
    };

    return (
        <div className="w-full">
            <div className="bg-card rounded-lg border shadow p-4">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    className="w-full"
                    classNames={{
                        months: "w-full flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "w-full space-y-4",
                        table: "w-full border-collapse space-y-1",
                        head_row: "flex w-full",
                        row: "flex w-full mt-2",
                        cell: "w-full h-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "w-full h-full p-0 font-normal aria-selected:opacity-100",
                    }}
                    components={{
                        DayContent: ({ date }) => (
                            <div className="relative w-full h-full min-h-[40px] flex items-center justify-center">
                                <div>{format(date, 'd')}</div>
                                {renderDayContent(date)}
                            </div>
                        )
                    }}
                />
            </div>
        </div>
    );
} 