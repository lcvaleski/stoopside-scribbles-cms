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

export default function Newsletter() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [buttondownKey, setButtondownKey] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchPosts()
      // Get API key from localStorage
      const savedKey = localStorage.getItem('buttondown_api_key')
      if (savedKey) setButtondownKey(savedKey)
    }
  }, [status, router])

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('date', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    }
  }

  const saveApiKey = () => {
    localStorage.setItem('buttondown_api_key', buttondownKey)
    setMessage('API key saved locally')
    setTimeout(() => setMessage(''), 3000)
  }

  const sendNewsletter = async () => {
    if (!selectedPost || !buttondownKey) {
      setMessage('Please select a post and add your API key')
      return
    }

    setSending(true)
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: buttondownKey,
          subject: selectedPost.title,
          body: selectedPost.content,
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setMessage('Newsletter sent successfully!')
        setSelectedPost(null)
      } else {
        setMessage(data.error || 'Failed to send newsletter')
      }
    } catch (error) {
      setMessage('Error sending newsletter')
    } finally {
      setSending(false)
    }
  }

  if (status === 'loading') {
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
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto', 
        padding: '40px 20px' 
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
          <h1 style={{ fontSize: '20px', fontWeight: 'normal', margin: 0 }}>Newsletter</h1>
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
            Back to Posts
          </button>
        </div>

        {/* API Key Setup */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
            Buttondown API Key:
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="password"
              value={buttondownKey}
              onChange={(e) => setButtondownKey(e.target.value)}
              placeholder="Enter your Buttondown API key"
              style={{
                flex: 1,
                padding: '6px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
              }}
            />
            <button
              onClick={saveApiKey}
              style={{
                background: 'none',
                border: '1px solid #0066cc',
                color: '#0066cc',
                padding: '6px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#0066cc'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'none'
                e.currentTarget.style.color = '#0066cc'
              }}
            >
              Save Key
            </button>
          </div>
          <p style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
            Get your API key from Buttondown Settings → API
          </p>
        </div>

        {/* Post Selection */}
        <div style={{ marginBottom: '30px' }}>
          <p style={{ marginBottom: '12px', color: '#666', fontSize: '14px' }}>
            Select a post to send:
          </p>
          <select
            value={selectedPost?.id || ''}
            onChange={(e) => {
              const post = posts.find(p => p.id === e.target.value)
              setSelectedPost(post || null)
            }}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'inherit',
              cursor: 'pointer'
            }}
          >
            <option value="">Choose a post...</option>
            {posts.map(post => (
              <option key={post.id} value={post.id}>
                {post.title} ({new Date(post.date).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        {/* Preview */}
        {selectedPost && (
          <div style={{ 
            marginBottom: '30px',
            padding: '20px',
            background: '#f9f9f9',
            borderRadius: '4px'
          }}>
            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>
              Preview: {selectedPost.title}
            </h3>
            <div style={{ 
              fontSize: '14px', 
              color: '#666',
              whiteSpace: 'pre-wrap',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              {selectedPost.content}
            </div>
          </div>
        )}

        {/* Send Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={sendNewsletter}
            disabled={!selectedPost || !buttondownKey || sending}
            style={{
              background: '#0066cc',
              border: 'none',
              color: '#fff',
              padding: '8px 24px',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: !selectedPost || !buttondownKey || sending ? 'default' : 'pointer',
              opacity: !selectedPost || !buttondownKey || sending ? 0.5 : 1,
              fontFamily: 'inherit',
            }}
          >
            {sending ? 'Sending...' : 'Send Newsletter'}
          </button>
          {message && (
            <span style={{ 
              color: message.includes('success') ? '#0a0' : '#c33',
              fontSize: '14px'
            }}>
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}