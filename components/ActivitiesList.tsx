"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityType } from "@prisma/client";
import { CalendarIcon, Clock, MapPin, Activity, Trash2, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Activity {
  id: string;
  name: string;
  activityType: ActivityType;
  startTime: string;
  endTime: string;
  duration: number;
  distance?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  elevationGain?: number;
}

export function ActivitiesList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActivityType | "ALL">("ALL");
  const { toast } = useToast();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    fetchActivities();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/activities");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const data = await response.json();
      setActivities(data);
      setError(null);
    } catch (err) {
      setError("Error loading activities");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, activityId: string) => {
    e.preventDefault(); // Prevent navigation from Link
    e.stopPropagation(); // Prevent event bubbling to the Link component
    
    if (!confirm("Are you sure you want to delete this activity?")) {
      return;
    }

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Activity not found. It may have been already deleted.");
        }
        throw new Error(data.error || "Failed to delete activity");
      }

      toast({
        title: "Activity deleted",
        description: "The activity has been successfully deleted.",
      });

      // Remove the activity from the state
      setActivities(activities.filter(activity => activity.id !== activityId));
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete the activity.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const filteredActivities = filter === "ALL"
    ? activities
    : activities.filter(activity => activity.activityType === filter);

  if (loading) {
    return <div>Loading activities...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select 
          value={filter} 
          onValueChange={(value: ActivityType | "ALL") => setFilter(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Activities</SelectItem>
            <SelectItem value="RUNNING">Running</SelectItem>
            <SelectItem value="CYCLING">Cycling</SelectItem>
            <SelectItem value="SWIMMING">Swimming</SelectItem>
            <SelectItem value="TRIATHLON">Triathlon</SelectItem>
          </SelectContent>
        </Select>

        <Link href="/activities/upload">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </Link>
      </div>

      {loading ? (
        <div>Loading activities...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No activities found.</p>
          <Link href="/activities/upload" className="mt-4 inline-block">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add your first activity
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="relative">
              <Link href={`/activities/${activity.id}`}>
                <Card className="hover:bg-muted/50 transition-colors group relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDelete(e, activity.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <CardTitle className="text-lg font-medium">
                        {activity.name}
                      </CardTitle>
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        {new Date(activity.startTime).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDuration(activity.duration)}</span>
                      </div>
                      {activity.distance && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{(activity.distance / 1000).toFixed(2)} km</span>
                        </div>
                      )}
                      {activity.elevationGain && (
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 text-muted-foreground"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M2 22 12 2l10 20" />
                          </svg>
                          <span>{activity.elevationGain.toFixed(2)}m</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 