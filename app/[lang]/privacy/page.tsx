import { getTranslations } from '@/app/i18n'

interface PrivacyPageProps {
  params: {
    lang: string
  }
}

export default function PrivacyPage({ params: { lang } }: PrivacyPageProps) {
  const { t } = getTranslations(lang)

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('privacy.title')}</h1>

        <section className="prose dark:prose-invert max-w-none">
          <h2>{t('privacy.responsible.title')}</h2>
          <p>{t('privacy.responsible.content')}</p>

          <h2>{t('privacy.overview.title')}</h2>
          <p>{t('privacy.overview.content')}</p>

          <h2>{t('privacy.data.title')}</h2>
          <p>{t('privacy.data.content')}</p>

          <h2>{t('privacy.legal.title')}</h2>
          <p>{t('privacy.legal.content')}</p>

          <h2>{t('privacy.collection.title')}</h2>
          <p>{t('privacy.collection.content')}</p>

          <h2>{t('privacy.cookies.title')}</h2>
          <p>{t('privacy.cookies.content')}</p>

          <h2>{t('privacy.analytics.title')}</h2>
          <p>{t('privacy.analytics.content')}</p>

          <h2>{t('privacy.thirdParty.title')}</h2>
          <p>{t('privacy.thirdParty.content')}</p>

          <h2>{t('privacy.rights.title')}</h2>
          <p>{t('privacy.rights.content')}</p>

          <h2>{t('privacy.changes.title')}</h2>
          <p>{t('privacy.changes.content')}</p>

          <h2>{t('privacy.contact.title')}</h2>
          <p>{t('privacy.contact.content')}</p>
        </section>
      </div>
    </div>
  )
} 