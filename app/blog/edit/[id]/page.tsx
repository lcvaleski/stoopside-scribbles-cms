'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import EnhancedBlogEditor from '../../../components/EnhancedBlogEditor'
import type { BlogPost, BlogFormData } from '../../../types/blog'

export default function EditBlogPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (params.id) {
      fetchPost(params.id as string)
    }
  }, [params.id])

  const fetchPost = async (id: string) => {
    try {
      const response = await fetch(`/api/blog/${id}`)
      if (!response.ok) throw new Error('Failed to fetch post')
      const data = await response.json()
      setPost(data)
    } catch (error) {
      console.error('Error fetching post:', error)
      alert('Failed to load post')
      router.push('/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (data: BlogFormData) => {
    try {
      const response = await fetch(`/api/blog/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update post')
      }

      router.push('/blog')
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post. Please try again.')
    }
  }

  const handleCancel = () => {
    router.push('/blog')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!session || !post) {
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
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                Blog Posts
              </Link>
              <span className="text-gray-900 font-medium">Edit Post</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <EnhancedBlogEditor
          initialData={post}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </main>
    </div>
  )
}