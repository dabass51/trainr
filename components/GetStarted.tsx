'use client';

import { Box } from 'lucide-react';
import { useTranslation } from '@/provider/LanguageProvider';
import Link from 'next/link';

export function GetStarted() {
  const { t } = useTranslation();

  const steps = [
    {
      id: 1,
      title: t('getStarted.steps.download.title'),
      description: t('getStarted.steps.download.description'),
    },
    {
      id: 2,
      title: t('getStarted.steps.profile.title'),
      description: t('getStarted.steps.profile.description'),
    },
    {
      id: 3,
      title: t('getStarted.steps.plan.title'),
      description: t('getStarted.steps.plan.description'),
    },
  ];

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-lg font-bold mb-2">{t('getStarted.subtitle')}</h2>
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
            <h3 className="text-4xl font-mono leading-tight max-w-2xl">
              {t('getStarted.title')}
            </h3>
            <p className="text-lg text-muted-foreground max-w-xl">
              {t('getStarted.description')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.id} className="space-y-4">
              <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Box className="size-6 text-primary" />
              </div>
              <h4 className="text-2xl font-mono">
                {step.title}
              </h4>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href="/learn-more"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            {t('getStarted.learnMore')}
          </Link>
          <Link
            href="/auth/signin"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {t('getStarted.signUp')} →
          </Link>
        </div>
      </div>
    </section>
  );
} 