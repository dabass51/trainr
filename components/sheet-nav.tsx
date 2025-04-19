"use client"

import Link from "next/link";
import { ThemeToggle } from '@/components/theme-toggle';
import { Signout } from "@/components/signout";
import { HomeIcon } from "@/components/icons";
import { CalendarDays, Home, Upload, User, Activity } from "lucide-react";
import { useTranslation } from "@/provider/LanguageProvider";

interface SheetNavProps {
  isAuthenticated: boolean;
}

export function SheetNav({ isAuthenticated }: SheetNavProps) {
  const { t } = useTranslation();

  return (
    <div className="py-6 space-y-6">
      <Link href="/" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
        <HomeIcon className="h-5 w-5" />
        {t('navigation.home')}
      </Link>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
      {isAuthenticated ? (
        <>
          <Link href="/training-units" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
            {t('navigation.trainings')}
          </Link>
          <Link href="/weight" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
            {t('navigation.weight')}
          </Link>
          <Link href="/events" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
            <CalendarDays className="h-5 w-5" />
            {t('navigation.events')}
          </Link>
          <Link href="/activities" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
            <Activity className="h-5 w-5" />
            {t('navigation.activities')}
          </Link>
          <Link href="/profile" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
            {t('navigation.profile')}
          </Link>
          <Link href="/activities/upload" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
            {t('navigation.upload')}
          </Link>
          <Signout />
        </>
      ) : (
        <>
          <Link href="/auth/signin" className="flex items-center gap-2 text-lg font-medium hover:text-yellow-400">
            {t('navigation.signIn')}
          </Link>
        </>
      )}
    </div>
  );
} 