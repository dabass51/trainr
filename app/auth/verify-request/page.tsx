'use client'

import { useTranslation } from '@/provider/LanguageProvider';

export default function VerifyRequest() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary">
            {t('auth.verifyRequest.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t('auth.verifyRequest.description')}
          </p>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>{t('auth.verifyRequest.instruction')}</p>
            <p className="mt-2">{t('auth.verifyRequest.redirectInfo')}</p>
            <p className="mt-2">{t('auth.verifyRequest.spamNote')}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 