import { getTranslations } from '@/app/i18n'

interface TermsPageProps {
  params: {
    lang: string
  }
}

export default function TermsPage({ params: { lang } }: TermsPageProps) {
  const { t } = getTranslations(lang)

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('terms.title')}</h1>

        <section className="prose dark:prose-invert max-w-none">
          <h2>{t('terms.scope.title')}</h2>
          <p>{t('terms.scope.content')}</p>

          <h2>{t('terms.contract.title')}</h2>
          <p>{t('terms.contract.content')}</p>

          <h2>{t('terms.prices.title')}</h2>
          <p>{t('terms.prices.content')}</p>

          <h2>{t('terms.payment.title')}</h2>
          <p>{t('terms.payment.content')}</p>

          <h2>{t('terms.delivery.title')}</h2>
          <p>{t('terms.delivery.content')}</p>

          <h2>{t('terms.warranty.title')}</h2>
          <p>{t('terms.warranty.content')}</p>

          <h2>{t('terms.liability.title')}</h2>
          <p>{t('terms.liability.content')}</p>

          <h2>{t('terms.privacy.title')}</h2>
          <p>{t('terms.privacy.content')}</p>

          <h2>{t('terms.jurisdiction.title')}</h2>
          <p>{t('terms.jurisdiction.content')}</p>

          <h2>{t('terms.severability.title')}</h2>
          <p>{t('terms.severability.content')}</p>
        </section>
      </div>
    </div>
  )
} 