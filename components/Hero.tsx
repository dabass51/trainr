import { Bell } from 'lucide-react';
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from "next/link"

export async function Hero() {
    const session = await getServerSession(authOptions)

    return (
        <section className="py-32">
            <div className="container">
                <Badge
                    variant="outline"
                    className="mb-4 max-w-full text-sm font-normal lg:mb-10 lg:py-2 lg:pl-2 lg:pr-5"
                >
                  <span className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Bell className="size-4" />
                  </span>
                    <p className="truncate whitespace-nowrap">
                        start our beta program now
                    </p>
                </Badge>
                <h1 className="mb-6 text-4xl font-bold leading-none tracking-tighter md:text-[7vw] lg:text-8xl">
                    Unlock Your Potential with AI-Generated Training Plans.
                </h1>
                <p className="max-w-2xl text-muted-foreground md:text-[2vw] lg:text-xl">
                    Transform your fitness journey with personalized, AI-powered training plans. Get workouts tailored to your goals, lifestyle, and progress — your perfect training partner, always adapting to help you succeed.
                </p>
                <div className="mt-6 flex flex-col gap-4 sm:flex-row lg:mt-10">
                    <Button size={'lg'} className="w-full md:w-auto">
                        start now
                    </Button>





                <Link href="/auth/signin" className="flex items-center gap-2 text-lg font-medium">
                    <Button size={'lg'} variant={'outline'} className="w-full md:w-auto">
                    Sign in
                    </Button>
                </Link>
                </div>
            </div>
        </section>
    );
};
