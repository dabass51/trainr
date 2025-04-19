'use client'

import { Button } from "@/components/ui/button"
import { useTranslation } from "@/provider/LanguageProvider"

export function LanguageSelector() {
  const { language, setLanguage } = useTranslation()

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
      >
        EN
      </Button>
      <Button
        variant={language === 'de' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('de')}
      >
        DE
      </Button>
    </div>
  )
} 