'use client';

import { Box, LineChart, Target } from 'lucide-react';
import { useTranslation } from '@/provider/LanguageProvider';

export function Features() {
  const { t } = useTranslation();

  return (
    <section className="py-24 px-6 md:px-12 lg:px-24 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="text-lg font-semibold mb-2">{t('features.empower')}</h2>
          <h3 className="text-4xl font-mono mb-6">{t('features.title')}</h3>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('features.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="size-6 text-primary" />
            </div>
            <h4 className="text-2xl font-semibold">{t('features.tailored.title')}</h4>
            <p className="text-muted-foreground">
              {t('features.tailored.description')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <LineChart className="size-6 text-primary" />
            </div>
            <h4 className="text-2xl font-semibold">{t('features.analytics.title')}</h4>
            <p className="text-muted-foreground">
              {t('features.analytics.description')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Box className="size-6 text-primary" />
            </div>
            <h4 className="text-2xl font-semibold">{t('features.tracking.title')}</h4>
            <p className="text-muted-foreground">
              {t('features.tracking.description')}
            </p>
          </div>
        </div>

        <div className="mt-12 flex gap-4">
          <a href="/learn-more" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
            {t('features.learnMore')}
          </a>
          <a href="/auth/signin" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            {t('features.signUp')} →
          </a>
        </div>
      </div>
    </section>
  );
} 