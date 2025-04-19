import { getBlogPosts, getCategories } from '@/lib/blog'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogCategories } from '@/components/blog/BlogCategories'
import { getTranslations } from '@/app/i18n'

interface BlogPageProps {
  params: {
    lang: string
  }
}

export default function BlogPage({ params: { lang } }: BlogPageProps) {
  const { t } = getTranslations(lang)
  const posts = getBlogPosts(lang)
  const categories = getCategories(lang)

  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('blog.title')}</h1>
        <p className="text-xl text-muted-foreground">
          {t('blog.description')}
        </p>
      </div>

      <BlogCategories categories={categories} />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  )
} 