'use client';

import { Check } from 'lucide-react';
import { useTranslation } from '@/provider/LanguageProvider';
import Link from 'next/link';
import Image from 'next/image';

export function Elevate() {
  const { t } = useTranslation();

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <h2 className="text-lg font-semibold">{t('elevate.subtitle')}</h2>
          <h3 className="text-4xl font-mono leading-tight">{t('elevate.title')}</h3>
          <p className="text-lg text-muted-foreground">
            {t('elevate.description')}
          </p>

          <ul className="space-y-4">
            {['insight', 'strategy', 'efficiency'].map((key) => (
              <li key={key} className="flex items-start gap-3">
                <div className="mt-1 size-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="size-3 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">
                  {t(`elevate.benefits.${key}`)}
                </span>
              </li>
            ))}
          </ul>

          <div className="flex gap-4 pt-4">
            <Link
              href="/learn-more"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              {t('elevate.learnMore')}
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              {t('elevate.signUp')} →
            </Link>
          </div>
        </div>

        <div className="relative aspect-square w-full rounded-lg bg-muted">
          <Image
            src="/mood_4.jpg"
            alt="Mood"
            fill
            className="object-cover rounded-lg"
          />
        </div>
      </div>
    </section>
  );
} 