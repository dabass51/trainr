'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useTranslation as useI18nTranslation } from '@/app/i18n/client'
import { useTranslation } from '@/provider/LanguageProvider'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = 'cookieConsent'

export function CookieBanner() {
  const { language, t } = useTranslation()
  const [mounted, setMounted] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    setMounted(true)
    const savedPreferences = localStorage.getItem(COOKIE_CONSENT_KEY)
    
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences)
        setPreferences({
          necessary: true,
          analytics: Boolean(parsed.analytics),
          marketing: Boolean(parsed.marketing),
        })
        setShowBanner(false)
      } catch (e) {
        console.error('Error parsing cookie preferences:', e)
        localStorage.removeItem(COOKIE_CONSENT_KEY)
      }
    }
  }, [])

  // Re-render when language changes
  useEffect(() => {
    if (mounted) {
      // Force re-render of translations
      const element = document.querySelector('.cookie-banner-message')
      if (element) {
        element.textContent = t('cookies.banner.message')
      }
    }
  }, [language, mounted, t])

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs))
    setPreferences(prefs)
    setShowBanner(false)
    setShowPreferences(false)
  }

  const handleAcceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
    })
  }

  const handleRejectAll = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    })
  }

  const handleSavePreferences = () => {
    savePreferences(preferences)
  }

  if (!mounted) return null

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-50">
          <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground cookie-banner-message">
                {t('cookies.banner.message')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowPreferences(true)}>
                {t('cookies.banner.customize')}
              </Button>
              <Button variant="outline" onClick={handleRejectAll}>
                {t('cookies.banner.rejectAll')}
              </Button>
              <Button onClick={handleAcceptAll}>
                {t('cookies.banner.acceptAll')}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('cookies.preferences.title')}</DialogTitle>
            <DialogDescription>
              {t('cookies.preferences.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('cookies.preferences.necessary')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('cookies.preferences.necessaryDescription')}
                </p>
              </div>
              <Switch checked disabled />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('cookies.preferences.analytics')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('cookies.preferences.analyticsDescription')}
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, analytics: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('cookies.preferences.marketing')}</Label>
                <p className="text-sm text-muted-foreground">
                  {t('cookies.preferences.marketingDescription')}
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, marketing: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleRejectAll}>
              {t('cookies.preferences.rejectAll')}
            </Button>
            <Button onClick={handleSavePreferences}>
              {t('cookies.preferences.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
} 