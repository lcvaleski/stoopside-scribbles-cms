'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import EnhancedBlogEditor from '../../components/EnhancedBlogEditor'
import type { BlogFormData } from '../../types/blog'

export default function NewBlogPostPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const handleSave = async (data: BlogFormData) => {
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create post')
      }

      await response.json()
      router.push('/blog')
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Failed to save post. Please try again.')
    }
  }

  const handleCancel = () => {
    router.push('/blog')
  }

  if (status === 'loading') {
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
              <Link href="/blog" className="text-gray-600 hover:text-gray-900">
                Blog Posts
              </Link>
              <span className="text-gray-900 font-medium">New Post</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <EnhancedBlogEditor
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </main>
    </div>
  )
}