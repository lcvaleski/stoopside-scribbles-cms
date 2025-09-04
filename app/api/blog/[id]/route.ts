import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { writeFile, readFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import type { BlogPost, BlogFormData } from '../../../types/blog'

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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const posts = await getPosts()
    const post = posts.find(p => p.id === params.id)
    
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    return NextResponse.json(post)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data: BlogFormData = await request.json()
    const posts = await getPosts()
    const index = posts.findIndex(p => p.id === params.id)
    
    if (index === -1) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    const updatedPost: BlogPost = {
      ...posts[index],
      ...data,
      updatedAt: new Date().toISOString(),
      publishedAt: data.status === 'published' && !posts[index].publishedAt 
        ? new Date().toISOString() 
        : posts[index].publishedAt
    }
    
    posts[index] = updatedPost
    await savePosts(posts)
    
    return NextResponse.json(updatedPost)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const session = await getServerSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const posts = await getPosts()
    const filteredPosts = posts.filter(p => p.id !== params.id)
    
    if (posts.length === filteredPosts.length) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }
    
    await savePosts(filteredPosts)
    
    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}