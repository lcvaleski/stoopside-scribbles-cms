'use client'

import { useSession, signOut } from 'next-auth/react'
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
  is_pinned?: boolean
}

export default function PostsList() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchPosts()
    }
  }, [status, router])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('date', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
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
        {/* Navigation */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'normal', margin: 0 }}>Posts</h1>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <button
              onClick={() => router.push('/posts/new')}
              style={{
                background: 'none',
                border: 'none',
                color: '#0066cc',
                cursor: 'pointer',
                fontSize: '16px',
                padding: 0
              }}
              onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              New Post
            </button>
            <button
              onClick={() => signOut()}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                fontSize: '14px',
                padding: 0
              }}
              onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Posts List */}
        {posts.length === 0 ? (
          <div style={{ color: '#666', fontStyle: 'italic' }}>
            No posts yet.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {posts.map((post) => (
              <li key={post.id} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <button
                      onClick={() => router.push(`/posts/${post.id}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0066cc',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: 0,
                        textAlign: 'left'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {post.title}
                    </button>
                    {post.is_pinned && (
                      <span style={{ 
                        fontSize: '14px',
                        marginLeft: '8px'
                      }}>
                        📌
                      </span>
                    )}
                    {!post.published && (
                      <span style={{ 
                        color: '#999', 
                        fontSize: '14px',
                        marginLeft: '8px'
                      }}>
                        (draft)
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: '0 0 0 20px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#c33'}
                    onMouseOut={(e) => e.currentTarget.style.color = '#999'}
                  >
                    delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}