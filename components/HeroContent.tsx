'use client'

import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from "next/link"
import { useTranslation } from '@/provider/LanguageProvider';

export function HeroContent() {
    const { t } = useTranslation();

    return (
        <>
            <Badge
                variant="outline"
                className="mb-4 max-w-full text-sm font-normal backdrop-blur-sm lg:mb-10 lg:py-2 lg:pl-2 lg:pr-5"
            >
                <span className="mr-2 flex size-8 shrink-0 items-center justify-center rounded-full ">
                    <Bell className="size-4" />
                </span>
                <p className="truncate whitespace-nowrap">
                    {t('home.beta')}
                </p>
            </Badge>
            <h1 className="mb-6 text-4xl font-mono leading-none tracking-tighter text-white md:text-[7vw] lg:text-8xl">
                {t('home.title')}
            </h1>
            <p className="max-w-2xl md:text-[2vw] lg:text-xl">
                {t('home.description')}
            </p>
            <div className="mt-6 flex flex-col gap-4 sm:flex-row lg:mt-10">
                <Link href="/auth/signin" className="flex items-center gap-2 text-lg font-medium">
                    <Button size={'lg'} variant={'default'} className="w-full md:w-auto">
                        {t('navigation.signIn')}
                    </Button>
                </Link>
            </div>
        </>
    );
} 