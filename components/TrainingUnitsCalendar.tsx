"use client"

import { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Dumbbell, Footprints, Bike, Star } from 'lucide-react'

interface TrainingUnit {
    id: string
    type: string
    description: string
    instruction: string
    date: string
    completed: boolean
}

interface TrainingCalendarProps {
    trainingUnits: TrainingUnit[]
    onDaySelect: (selectedDays: Date[]) => void
    specialEvents: string[] // Array of date strings for special events
}

const typeIcons: { [key: string]: React.ReactNode } = {
    'strength': <Dumbbell className="h-4 w-4" />,
    'cardio': <Footprints className="h-4 w-4" />,
    'cycling': <Bike className="h-4 w-4" />,
    // Add more types and icons as needed
}

export default function TrainingCalendar({ trainingUnits, onDaySelect, specialEvents }: TrainingCalendarProps) {
    const [selectedDays, setSelectedDays] = useState<Date[]>([])

    const handleDaySelect = (days: Date[] | undefined) => {
        console.log('asdaddas')
        if (days) {
            setSelectedDays(days);
            onDaySelect(days);
        } else {
            setSelectedDays([]);
            onDaySelect([]);
        }
    };

    const renderDay = (day: Date) => {
        const dateString = day.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format

        const dayTrainingUnits = trainingUnits.filter(unit => {
            const unitDateString = unit.date.split('T')[0]; // Convert to YYYY-MM-DD format
            return unitDateString === dateString;
        });

        const isSpecialEvent = specialEvents.includes(dateString);

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className={cn(
                                "w-full h-full p-2 flex flex-col items-center justify-center rounded-md",
                                "transition-all duration-200 ease-in-out",
                                selectedDays.some(d => d.toDateString() === day.toDateString()) && "bg-primary/20",
                                isSpecialEvent && "border-2 border-yellow-400"
                            )}
                        >
                            <span className="">{day.getDate()}</span>
                            {dayTrainingUnits.length > 0 && (
                                <div className="flex flex-col space-y-1 mt-1 items-center">
                                    {dayTrainingUnits.map((unit, index) => (
                                        <Badge
                                            key={unit.id}
                                            variant={unit.completed ? "default" : "outline"}
                                            className="p-0 flex items-center"
                                        >
                                            {typeIcons[unit.type] || <Star className="h-3 w-3 mr-1" />}

                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        {dayTrainingUnits.map(unit => (
                            <div key={unit.id}>
                                <strong>{unit.type}</strong>: {unit.description}
                                <p>{unit.instruction}</p>
                            </div>
                        ))}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };


    return (
        <Calendar
            components={{
                Day: ({ date, ...props }) => (
                    <div {...props}>
                        {renderDay(date)}
                    </div>
                ),
            }}
        />
    )
}
