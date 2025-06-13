// app/activities/page.tsx
import { Metadata } from "next";
import { ActivitiesList } from "@/components/ActivitiesList";

const activityTypes = [
    { value: 'RUNNING', label: 'Running' },
    { value: 'CYCLING', label: 'Cycling' },
    { value: 'WALKING', label: 'Walking' },
    { value: 'SWIMMING', label: 'Swimming' },
    // Add other types as needed
];

export const metadata: Metadata = {
  title: "Activities | Trainer",
  description: "View and manage your training activities",
};

export default function ActivitiesPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="text-muted-foreground">View and manage your training activities</p>
        </div>
      </div>
      <ActivitiesList />
    </div>
  );
}
