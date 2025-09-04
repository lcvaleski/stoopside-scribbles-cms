export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  images: string[]
  author: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
  publishedAt?: string
  tags?: string[]
  metaDescription?: string
}

export interface BlogFormData {
  title: string
  slug: string
  content: string
  excerpt?: string
  featuredImage?: string
  status: 'draft' | 'published'
  tags?: string[]
  metaDescription?: string
}