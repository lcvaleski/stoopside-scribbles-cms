import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import type { BlogPost, BlogFormData } from '../../types/blog'

const DATA_DIR = path.join(process.cwd(), 'data')
const POSTS_FILE = path.join(DATA_DIR, 'posts.json')

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
  if (!existsSync(POSTS_FILE)) {
    await writeFile(POSTS_FILE, JSON.stringify([]))
  }
}

async function getPosts(): Promise<BlogPost[]> {
  await ensureDataDir()
  const data = await readFile(POSTS_FILE, 'utf-8')
  return JSON.parse(data)
}

async function savePosts(posts: BlogPost[]) {
  await ensureDataDir()
  await writeFile(POSTS_FILE, JSON.stringify(posts, null, 2))
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

export async function POST(request: NextRequest) {
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