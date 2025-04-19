import { format } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getBlogPost, getBlogPosts, markdownToHtml } from '@/lib/blog'
import { Badge } from '@/components/ui/badge'
import { getTranslations } from '@/app/i18n'

interface PostPageProps {
  params: {
    lang: string
    slug: string
  }
}

export default async function PostPage({ params: { lang, slug } }: PostPageProps) {
  const { t } = getTranslations(lang)
  const post = getBlogPost(slug, lang)
  
  if (!post) {
    notFound()
  }

  const content = await markdownToHtml(post.content)
  const locale = lang === 'de' ? de : enUS
  
  // Get related posts (same category, different post)
  const relatedPosts = getBlogPosts(lang)
    .filter(p => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3)

  return (
    <article className="container py-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/${lang}/blog`}
          className="text-sm text-muted-foreground hover:underline mb-8 inline-block"
        >
          ← {t('blog.backToOverview')}
        </Link>

        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Badge variant="secondary">{post.category}</Badge>
            <time className="text-sm text-muted-foreground">
              {format(new Date(post.date), 'PPP', { locale })}
            </time>
            <span className="text-sm text-muted-foreground">
              {post.readingTime} {t('blog.readingTime')}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <p className="text-xl text-muted-foreground">{post.description}</p>
        </header>

        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">{t('blog.relatedPosts')}</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/${lang}/blog/posts/${post.slug}`}
                  className="block group"
                >
                  <h3 className="font-semibold group-hover:underline mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {post.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
} 