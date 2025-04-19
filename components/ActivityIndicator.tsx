'use client';

import { ActivityType } from "@prisma/client";
import { Activity } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useRouter } from "next/navigation";

interface ActivityIndicatorProps {
    date: Date;
    activities: {
        id: string;
        name: string;
        activityType: ActivityType;
        duration: number;
        distance: number | null;
    }[];
}

const activityTypeColors: Record<ActivityType, string> = {
    RUNNING: '#059669', // emerald
    CYCLING: '#0891b2', // cyan
    SWIMMING: '#3b82f6', // blue
    TRIATHLON: '#4f46e5', // indigo
};

export function ActivityIndicator({ date, activities }: ActivityIndicatorProps) {
    const router = useRouter();

    if (activities.length === 0) return null;

    return (
        <div className="absolute top-1 right-1">
            <HoverCard>
                <HoverCardTrigger asChild>
                    <div 
                        className="cursor-pointer p-1 rounded-full bg-primary/10 hover:bg-primary/20"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/activities?date=${date.toISOString().split('T')[0]}`);
                        }}
                    >
                        <Activity className="h-3 w-3 text-primary" />
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80" align="end">
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Activities</h4>
                        {activities.map((activity) => (
                            <div key={activity.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="h-2 w-2 rounded-full" 
                                        style={{ backgroundColor: activityTypeColors[activity.activityType] }}
                                    />
                                    <span className="text-sm">{activity.name}</span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {activity.distance ? `${(activity.distance / 1000).toFixed(1)} km` : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                </HoverCardContent>
            </HoverCard>
        </div>
    );
} 