"use client"

import Link from "next/link";
import { ThemeToggle } from '@/components/theme-toggle';
import { Signout } from "@/components/signout";
import { useTranslation } from "@/provider/LanguageProvider";

interface HeaderNavProps {
  isAuthenticated: boolean;
}

export function HeaderNav({ isAuthenticated }: HeaderNavProps) {
  const { t } = useTranslation();

  return (
    <>
      <nav className="hidden lg:flex items-center gap-8">
        <Link href="/" className="hover:text-yellow-400 transition duration-300">
          {t('navigation.home')}
        </Link>
        {isAuthenticated ? (
          <>
            <Link href="/training-units" className="hover:text-yellow-400 transition duration-300">
              {t('navigation.trainings')}
            </Link>
            <Link href="/weight" className="hover:text-yellow-400 transition duration-300">
              {t('navigation.weight')}
            </Link>
            <Link href="/events" className="hover:text-yellow-400 transition duration-300">
              {t('navigation.events')}
            </Link>
            <Link href="/activities" className="hover:text-yellow-400 transition duration-300">
              {t('navigation.activities')}
            </Link>
            <Link href="/profile" className="hover:text-yellow-400 transition duration-300">
              {t('navigation.profile')}
            </Link>
            <Link href="/activities/upload" className="hover:text-yellow-400 transition duration-300">
              {t('navigation.upload')}
            </Link>
            <Signout />
          </>
        ) : (
          <>
            <Link href="/auth/signin" className="hover:text-yellow-400 transition duration-300">
              {t('navigation.signIn')}
            </Link>
          </>
        )}
        <ThemeToggle />
      </nav>
    </>
  );
} 