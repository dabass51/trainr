// app/activities/[activityId]/page.tsx
import { Metadata } from "next";
import { ActivityDetail } from "@/components/ActivityDetail";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

type ActivityWithRelations = Prisma.ActivityGetPayload<{
  include: {
    gpsData: true;
    trainingUnit: true;
  };
}>;

interface Props {
  params: {
    activityId: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return {
      title: "Activity Not Found | Trainer",
    };
  }

  const activity = await prisma.activity.findUnique({
    where: {
      id: params.activityId,
      userId: session.user.id,
    },
  });

  if (!activity) {
    return {
      title: "Activity Not Found | Trainer",
    };
  }

  return {
    title: `${activity.name} | Trainer`,
    description: `Details for ${activity.name} on ${new Date(activity.startTime).toLocaleDateString()}`,
  };
}

export default async function ActivityPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    notFound();
  }

  const activity = await prisma.activity.findUnique({
    where: {
      id: params.activityId,
      userId: session.user.id,
    },
    include: {
      gpsData: true,
      trainingUnit: true,
    },
  }) as ActivityWithRelations | null;

  if (!activity) {
    notFound();
  }

  // Convert dates to Date objects
  const activityWithDates = {
    ...activity,
    startTime: new Date(activity.startTime),
    endTime: new Date(activity.endTime),
    createdAt: new Date(activity.createdAt),
    updatedAt: new Date(activity.updatedAt),
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <ActivityDetail activity={activityWithDates} />
    </div>
  );
}
