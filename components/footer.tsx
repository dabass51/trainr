'use client'

import {Instagram} from 'lucide-react'
import { Separator } from '@/components/ui/separator';
import { useTranslation } from '@/app/i18n/client';
import Link from 'next/link';
import { LanguageSelector } from '@/components/language-selector';

export function Footer() {
  const { t, lang } = useTranslation();
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: t('footer.product'),
      links: [
        { name: t('footer.links.overview'), href: '#' },
        { name: t('footer.links.pricing'), href: '#' },
        { name: t('footer.links.features'), href: '#' },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { name: t('footer.links.about'), href: '#' },
        { name: t('footer.links.team'), href: '#' },
        { name: t('footer.links.blog'), href: '#' },
        { name: t('footer.links.contact'), href: '#' },
      ],
    }
  ];

  return (
      <section className="py-32">
        <div className="container">
          <footer>
            <Separator className="my-14" />
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {sections.map((section, sectionIdx) => (
                  <div key={sectionIdx}>
                    <h3 className="mb-4 font-bold">{section.title}</h3>
                    <ul className="space-y-4 text-muted-foreground">
                      {section.links.map((link, linkIdx) => (
                          <li
                              key={linkIdx}
                              className="font-medium hover:text-primary"
                          >
                            <a href={link.href}>{link.name}</a>
                          </li>
                      ))}
                    </ul>
                  </div>
              ))}
              <div>
                <h3 className="mb-4 font-bold">{t('footer.tools')}</h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="font-medium hover:text-primary">
                    <Link href={`/${lang}/blog`}>{t('blog.title')}</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="mb-4 font-bold">{t('footer.legal')}</h3>
                <ul className="space-y-4 text-muted-foreground">
                  <li className="font-medium hover:text-primary">
                    <Link href={`/${lang}/terms`}>{t('terms.title')}</Link>
                  </li>
                  <li className="font-medium hover:text-primary">
                    <Link href={`/${lang}/privacy`}>{t('privacy.title')}</Link>
                  </li>
                  <li className="font-medium hover:text-primary">
                    <Link href={`/${lang}/imprint`}>{t('imprint.title')}</Link>
                  </li>
                </ul>
                <h3 className="mb-4 mt-8 font-bold">{t('footer.social')}</h3>
                <ul className="flex items-center space-x-6 text-muted-foreground">
                  <li className="font-medium hover:text-primary">
                    <a href="#">
                      <Instagram />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <Separator className="my-14" />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                © {currentYear} Lakt.at UG. {t('footer.copyright')}
              </p>
              <LanguageSelector />
            </div>
          </footer>
        </div>
      </section>
  );
};
