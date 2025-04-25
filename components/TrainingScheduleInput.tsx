'use client';

import React from 'react';
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export interface DaySchedule {
    sport: string;
    effort: number;
}

interface TrainingScheduleInputProps {
    value: { [key: string]: DaySchedule };
    onChange: (schedule: { [key: string]: DaySchedule }) => void;
}

const DAYS = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];

const SPORTS = ['RUNNING', 'CYCLING', 'SWIMMING', 'TRIATHLON'];

export const TrainingScheduleInput: React.FC<TrainingScheduleInputProps> = ({
    value,
    onChange
}) => {
    const [selectedDays, setSelectedDays] = React.useState<string[]>(
        Object.keys(value || {})
    );
    const [showDetailedSchedule, setShowDetailedSchedule] = React.useState(false);

    // Calculate total weekly training hours
    const totalWeeklyHours = React.useMemo(() => {
        return Object.values(value || {}).reduce((total, day) => total + (day.effort || 0), 0);
    }, [value]);

    // Update selectedDays when value changes
    React.useEffect(() => {
        setSelectedDays(Object.keys(value || {}));
    }, [value]);

    const handleDayToggle = (day: string) => {
        const newSelectedDays = selectedDays.includes(day)
            ? selectedDays.filter(d => d !== day)
            : [...selectedDays, day];
        
        setSelectedDays(newSelectedDays);
        
        const newSchedule = { ...value };
        if (!newSelectedDays.includes(day)) {
            delete newSchedule[day];
        } else if (!newSchedule[day]) {
            newSchedule[day] = { sport: 'RUNNING', effort: 1 };
        }
        
        onChange(newSchedule);
    };

    const handleSportChange = (sport: string, day: string) => {
        const newSchedule = {
            ...value,
            [day]: { ...value[day], sport }
        };
        onChange(newSchedule);
    };

    const handleEffortChange = (effortStr: string, day: string) => {
        const effort = Math.max(0, Math.min(24, parseInt(effortStr) || 0));
        const newSchedule = {
            ...value,
            [day]: { ...value[day], effort }
        };
        onChange(newSchedule);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Label className="text-base">Detailed Training Schedule</Label>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Enable this to specify your training schedule in detail, including which days you train and what type of training you do.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Switch
                    checked={showDetailedSchedule}
                    onCheckedChange={setShowDetailedSchedule}
                />
            </div>

            {showDetailedSchedule && (
                <>
                    <div className="flex justify-end">
                        <div className="text-sm text-muted-foreground">
                            Total: {totalWeeklyHours} hours/week
                        </div>
                    </div>
                    <div>
                        <Label className="text-base">Training Days</Label>
                        <p className="text-sm text-muted-foreground mb-4">
                            Select the days you want to train
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                            {DAYS.map((day) => (
                                <Button
                                    key={day}
                                    type="button"
                                    variant={selectedDays.includes(day) ? "default" : "outline"}
                                    onClick={() => handleDayToggle(day)}
                                    className="w-full"
                                >
                                    {day.charAt(0).toUpperCase() + day.slice(1)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {selectedDays.length > 0 && (
                        <div className="space-y-4">
                            <Label className="text-base">Training Schedule</Label>
                            <div className="grid gap-4">
                                {selectedDays.map((day) => (
                                    <div key={day} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 border rounded-lg">
                                        <div className="font-medium">
                                            {day.charAt(0).toUpperCase() + day.slice(1)}
                                        </div>
                                        <Select
                                            value={value[day]?.sport || 'RUNNING'}
                                            onValueChange={(sport) => handleSportChange(sport, day)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {SPORTS.map((sport) => (
                                                    <SelectItem key={sport} value={sport}>
                                                        {sport.charAt(0) + sport.slice(1).toLowerCase()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                max="24"
                                                value={value[day]?.effort || 1}
                                                onChange={(e) => handleEffortChange(e.target.value, day)}
                                                className="w-20"
                                            />
                                            <span className="text-muted-foreground">hours</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}; 