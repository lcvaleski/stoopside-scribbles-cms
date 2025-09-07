'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Post {
  id: string
  title: string
  content: string
  date: string
  published: boolean
}

export default function EditPost({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [post, setPost] = useState<Post>({
    id: '',
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    published: false
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && params.id !== 'new') {
      fetchPost()
    } else if (params.id === 'new') {
      setLoading(false)
    }
  }, [status, router, params.id])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      if (data) setPost(data)
    } catch (error) {
      console.error('Error fetching post:', error)
      alert('Failed to load post')
      router.push('/posts')
    } finally {
      setLoading(false)
    }
  }

  const savePost = async () => {
    setSaving(true)
    try {
      if (params.id === 'new') {
        // Create new post
        const { error } = await supabase
          .from('posts')
          .insert([{
            title: post.title,
            content: post.content,
            date: post.date,
            published: post.published
          }])

        if (error) throw error
      } else {
        // Update existing post
        const { error } = await supabase
          .from('posts')
          .update({
            title: post.title,
            content: post.content,
            date: post.date,
            published: post.published
          })
          .eq('id', params.id)

        if (error) throw error
      }

      router.push('/posts')
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/posts')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold">
              {params.id === 'new' ? 'New Post' : 'Edit Post'}
            </h1>
          </div>
          <button
            onClick={savePost}
            disabled={saving || !post.title || !post.content}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Post Form */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter post title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Write your post content here..."
            />
          </div>

          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={post.date}
                onChange={(e) => setPost({ ...post, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={post.published}
                  onChange={(e) => setPost({ ...post, published: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Published</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}