'use client'

import { useParams } from 'next/navigation'
import { getTranslations } from '.'

export function useTranslation() {
  const params = useParams()
  const lang = params?.lang as string || 'en'
  return getTranslations(lang)
} 