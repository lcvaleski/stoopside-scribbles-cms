'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Header from '@/app/components/Header'

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
  const postId = params.id
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
    } else if (status === 'authenticated' && postId && postId !== 'new') {
      fetchPost()
    } else if (postId === 'new') {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, postId])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
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
      if (postId === 'new') {
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
        const { error } = await supabase
          .from('posts')
          .update({
            title: post.title,
            content: post.content,
            date: post.date,
            published: post.published
          })
          .eq('id', postId)

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
      <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ color: '#666', fontStyle: 'italic' }}>Loading...</div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#000',
      background: '#fff',
      minHeight: '100vh'
    }}>
      {/* Stoopside CMS Header */}
      <Header />
      
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '0 20px 40px 20px' 
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => router.push('/posts')}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '16px',
                padding: 0
              }}
              onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              ← Back
            </button>
            <h1 style={{ fontSize: '20px', fontWeight: 'normal', margin: 0 }}>
              {postId === 'new' ? 'New Post' : 'Edit Post'}
            </h1>
          </div>
          <button
            onClick={savePost}
            disabled={saving || !post.title || !post.content}
            style={{
              background: 'none',
              border: '1px solid #0066cc',
              color: '#0066cc',
              cursor: saving || !post.title || !post.content ? 'default' : 'pointer',
              fontSize: '16px',
              padding: '6px 16px',
              borderRadius: '4px',
              opacity: saving || !post.title || !post.content ? 0.5 : 1
            }}
            onMouseOver={(e) => {
              if (!saving && post.title && post.content) {
                e.currentTarget.style.background = '#0066cc'
                e.currentTarget.style.color = '#fff'
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = '#0066cc'
            }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              placeholder="Title"
              style={{
                width: '100%',
                padding: '8px 0',
                border: 'none',
                borderBottom: '1px solid #e5e5e5',
                fontSize: '18px',
                outline: 'none',
                background: 'transparent'
              }}
            />
          </div>

          <div>
            <textarea
              value={post.content}
              onChange={(e) => setPost({ ...post, content: e.target.value })}
              placeholder="Write your post..."
              style={{
                width: '100%',
                minHeight: '400px',
                padding: '12px 0',
                border: 'none',
                fontSize: '16px',
                lineHeight: '1.8',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                background: 'transparent'
              }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '30px', 
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid #e5e5e5'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ fontSize: '14px', color: '#666' }}>Date:</label>
              <input
                type="date"
                value={post.date}
                onChange={(e) => setPost({ ...post, date: e.target.value })}
                style={{
                  border: 'none',
                  fontSize: '14px',
                  color: '#666',
                  outline: 'none',
                  background: 'transparent',
                  cursor: 'pointer'
                }}
              />
            </div>

            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              color: '#666'
            }}>
              <input
                type="checkbox"
                checked={post.published}
                onChange={(e) => setPost({ ...post, published: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              Published
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}