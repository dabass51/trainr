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
            Your Company Name GmbH<br />
            Street Name 123<br />
            12345 City<br />
            Germany
          </p>

          <h2>{t('imprint.contact')}</h2>
          <p>
            {t('imprint.phone')}: +49 123 456789<br />
            {t('imprint.email')}: contact@example.com
          </p>

          <h2>{t('imprint.management')}</h2>
          <p>{t('imprint.managingDirector')}: Your Name</p>

          <h2>{t('imprint.registration')}</h2>
          <p>
            {t('imprint.registrationCourt')}: Amtsgericht City<br />
            {t('imprint.registrationNumber')}: HRB 12345<br />
            {t('imprint.vatId')}: DE123456789
          </p>

          <h2>{t('imprint.responsibility')}</h2>
          <p>{t('imprint.responsibleContent')}: Your Name</p>

          <h2>{t('imprint.disputeResolution')}</h2>
          <p>{t('imprint.disputeText')}</p>
        </section>
      </div>
    </div>
  )
} 