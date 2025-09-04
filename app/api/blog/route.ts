import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { readJsonFile, writeJsonFile } from '@/lib/gcs'
import type { BlogPost, BlogFormData } from '../../types/blog'

const POSTS_FILE = 'blog-data/posts.json'

async function getPosts(): Promise<BlogPost[]> {
  const posts = await readJsonFile<BlogPost[]>(POSTS_FILE)
  return posts || []
}

async function savePosts(posts: BlogPost[]) {
  await writeJsonFile(POSTS_FILE, posts)
}

export async function GET() {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const posts = await getPosts()
    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data: BlogFormData = await request.json()
    const posts = await getPosts()
    
    const newPost: BlogPost = {
      id: Date.now().toString(),
      ...data,
      images: [],
      author: session.user?.name || 'Anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publishedAt: data.status === 'published' ? new Date().toISOString() : undefined
    }
    
    posts.push(newPost)
    await savePosts(posts)
    
    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}