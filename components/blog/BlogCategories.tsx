'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/provider/LanguageProvider'

interface BlogCategoriesProps {
  categories: string[]
}

export function BlogCategories({ categories }: BlogCategoriesProps) {
  const { t, language } = useTranslation()
  const pathname = usePathname()

  return (
    <nav className="flex gap-4 mb-8 overflow-x-auto pb-2">
      <Link
        href={`/${language}/blog`}
        className={cn(
          'px-4 py-2 rounded-full transition-colors',
          pathname === `/${language}/blog`
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-muted'
        )}
      >
        {t('blog.categories.all')}
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          href={`/${language}/blog/${category.toLowerCase()}`}
          className={cn(
            'px-4 py-2 rounded-full transition-colors',
            pathname === `/${language}/blog/${category.toLowerCase()}`
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          )}
        >
          {t(`blog.categories.${category.toLowerCase()}`)}
        </Link>
      ))}
    </nav>
  )
} 