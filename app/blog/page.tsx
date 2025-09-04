'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { BlogPost } from '../types/blog'

export default function BlogPostsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/blog')
      if (!response.ok) throw new Error('Failed to fetch posts')
      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError('Failed to load blog posts')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const response = await fetch(`/api/blog/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete post')
      
      setPosts(posts.filter(post => post.id !== id))
    } catch (err) {
      alert('Failed to delete post')
      console.error(err)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-semibold">
                CMS Dashboard
              </Link>
              <Link href="/blog" className="text-gray-900 font-medium">
                Blog Posts
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/blog/new"
                className="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                New Post
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Blog Posts</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="mb-4">No blog posts yet.</p>
                <Link
                  href="/blog/new"
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Create your first post →
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {posts.map((post) => (
                  <li key={post.id}>
                    <div className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {post.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              /{post.slug}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            post.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        {post.excerpt && (
                          <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="mt-2 text-sm text-gray-500">
                          <span>By {post.author}</span>
                          <span className="mx-2">•</span>
                          <span>
                            {new Date(post.updatedAt).toLocaleDateString()}
                          </span>
                          {post.tags && post.tags.length > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{post.tags.join(', ')}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <Link
                          href={`/blog/edit/${post.id}`}
                          className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900 border border-indigo-300 rounded-md hover:bg-indigo-50"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-900 border border-red-300 rounded-md hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}