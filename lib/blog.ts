import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

export type BlogPost = {
  slug: string
  title: string
  date: string
  category: string
  description: string
  content: string
  readingTime: number
  lang: string
  image?: string
}

const WORDS_PER_MINUTE = 200

export function getBlogPosts(lang: string): BlogPost[] {
  const postsDirectory = path.join(process.cwd(), 'content/blog', lang)
  const filenames = fs.readdirSync(postsDirectory)
  
  const posts = filenames
    .filter(filename => filename.endsWith('.md'))
    .map(filename => {
      const filePath = path.join(postsDirectory, filename)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data, content } = matter(fileContents)
      
      const wordCount = content.split(/\s+/g).length
      const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE)
      
      return {
        slug: filename.replace(/\.md$/, ''),
        title: data.title,
        date: data.date,
        category: data.category,
        description: data.description,
        content: content,
        readingTime,
        lang,
        image: data.image
      }
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  return posts
}

export function getBlogPost(slug: string, lang: string): BlogPost | null {
  try {
    const filePath = path.join(process.cwd(), 'content/blog', lang, `${slug}.md`)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)
    
    const wordCount = content.split(/\s+/g).length
    const readingTime = Math.ceil(wordCount / WORDS_PER_MINUTE)
    
    return {
      slug,
      title: data.title,
      date: data.date,
      category: data.category,
      description: data.description,
      content: content,
      readingTime,
      lang,
      image: data.image
    }
  } catch {
    return null
  }
}

export function getCategories(lang: string): string[] {
  const posts = getBlogPosts(lang)
  const categories = new Set(posts.map(post => post.category))
  return Array.from(categories)
}

export async function markdownToHtml(markdown: string) {
  const result = await remark().use(html).process(markdown)
  return result.toString()
} 