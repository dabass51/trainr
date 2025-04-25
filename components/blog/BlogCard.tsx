'use client'

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/provider/LanguageProvider'
import type { BlogPost } from '@/lib/blog'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  const { t, language } = useTranslation()
  const locale = language === 'de' ? de : enUS

  return (
    <Card className="flex flex-col h-full">
      {post.image && (
        <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <Badge variant="secondary">{post.category}</Badge>
          <span className="text-sm text-muted-foreground">
            {format(new Date(post.date), 'PPP', { locale })}
          </span>
        </div>
        <Link
          href={`/${language}/blog/posts/${post.slug}`}
          className="hover:underline"
        >
          <h3 className="text-xl font-semibold mt-2">{post.title}</h3>
        </Link>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{post.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Link
          href={`/${language}/blog/posts/${post.slug}`}
          className="text-sm font-medium hover:underline"
        >
          {t('blog.readMore')} →
        </Link>
        <span className="text-sm text-muted-foreground">
          {post.readingTime} {t('blog.readingTime')}
        </span>
      </CardFooter>
    </Card>
  )
} 