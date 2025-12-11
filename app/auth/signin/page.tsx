'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Invalid credentials')
        return
      }

      if (data.user) {
        router.push('/posts')
      }
    } catch (err) {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
      fontSize: '16px',
      lineHeight: '1.6',
      color: '#000',
      background: '#fff',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '320px',
        padding: '0 20px'
      }}>
        <h1 style={{
          fontSize: '20px',
          fontWeight: 'normal',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          Stoopside CMS
        </h1>

        <form onSubmit={handleSignIn}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{
              width: '100%',
              padding: '8px 0',
              fontSize: '16px',
              border: 'none',
              borderBottom: '1px solid #e5e5e5',
              marginBottom: '20px',
              background: 'transparent',
              outline: 'none'
            }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{
              width: '100%',
              padding: '8px 0',
              fontSize: '16px',
              border: 'none',
              borderBottom: '1px solid #e5e5e5',
              marginBottom: '20px',
              background: 'transparent',
              outline: 'none'
            }}
          />

          {error && (
            <div style={{
              color: '#c33',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: 'none',
              border: '1px solid #0066cc',
              color: '#0066cc',
              cursor: loading ? 'default' : 'pointer',
              fontSize: '16px',
              padding: '8px 24px',
              borderRadius: '4px',
              opacity: loading ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#0066cc'
                e.currentTarget.style.color = '#fff'
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = '#0066cc'
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}