import { getTranslations } from '@/app/i18n'

interface ImprintPageProps {
  params: {
    lang: string
  }
}

export default function ImprintPage({ params: { lang } }: ImprintPageProps) {
  const { t } = getTranslations(lang)

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('imprint.title')}</h1>

        <section className="prose dark:prose-invert max-w-none">
          <h2>{t('imprint.companyDetails')}</h2>
          <p>
            Lakt.at UG<br />
            Weissenburgstrasse 6<br />
            50670 Köln<br />
            Germany
          </p>

          <h2>{t('imprint.contact')}</h2>
          <p>
            {t('imprint.email')}: contact@trainingsplatz.com
          </p>

          <h2>{t('imprint.management')}</h2>
          <p>{t('imprint.managingDirector')}: Heiko Plümer</p>

          <h2>{t('imprint.registration')}</h2>
          <p>
            {t('imprint.registrationCourt')}: Amtsgericht Köln<br />
            {t('imprint.registrationNumber')}: HRB 97472
          </p>

          <h2>{t('imprint.responsibility')}</h2>
          <p>{t('imprint.responsibleContent')}: Heiko Plümer</p>

          <h2>{t('imprint.disputeResolution')}</h2>
          <p>{t('imprint.disputeText')}</p>
        </section>
      </div>
    </div>
  )
} 