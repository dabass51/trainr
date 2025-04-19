'use client'

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react'
import { useParams, useRouter, usePathname } from 'next/navigation'
import enMessages from '@/messages/en.json'
import deMessages from '@/messages/de.json'

type Language = 'en' | 'de'
type Messages = typeof enMessages

const messages: Record<Language, Messages> = {
  en: enMessages,
  de: deMessages,
}

const LANGUAGE_KEY = 'preferred_language'

function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('de')) return 'de'
  return 'en'
}

function getSavedLanguage(): Language {
  if (typeof window === 'undefined') return 'en'
  
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    if (saved && (saved === 'en' || saved === 'de')) {
      return saved
    }
  } catch (e) {
    console.error('Error reading language from localStorage:', e)
  }
  
  return getBrowserLanguage()
}

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
})

type Props = {
  children: ReactNode
}

export function LanguageProvider({ children }: Props) {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const urlLang = params?.lang as Language
  const [language, setLanguageState] = useState<Language>(urlLang || getSavedLanguage())
  const [mounted, setMounted] = useState(false)

  // Initialize language on mount
  useEffect(() => {
    setMounted(true)
    if (!urlLang) {
      const savedLang = getSavedLanguage()
      if (savedLang !== language) {
        setLanguageState(savedLang)
        // Update URL to match saved language
        if (pathname) {
          const newPath = pathname.replace(`/${language}`, `/${savedLang}`)
          router.push(newPath)
        }
      }
    }
  }, [])

  // Update language state when URL changes
  useEffect(() => {
    if (urlLang && urlLang !== language) {
      setLanguageState(urlLang)
      try {
        localStorage.setItem(LANGUAGE_KEY, urlLang)
      } catch (e) {
        console.error('Error saving language to localStorage:', e)
      }
    }
  }, [urlLang, language])

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang)
    // Save to localStorage
    try {
      localStorage.setItem(LANGUAGE_KEY, newLang)
    } catch (e) {
      console.error('Error saving language to localStorage:', e)
    }
    // Update URL to reflect language change
    if (pathname) {
      const newPath = pathname.replace(`/${language}`, `/${newLang}`)
      router.push(newPath)
    }
  }, [language, pathname, router])

  const t = useCallback((key: string) => {
    const keys = key.split('.')
    let value: any = messages[language]
    
    for (const k of keys) {
      if (value === undefined) return key
      value = value[k]
    }
    
    return value || key
  }, [language])

  const contextValue = {
    language,
    setLanguage,
    t
  }

  // Don't render until we've determined the language
  if (!mounted) return null

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
} 