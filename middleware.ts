import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  // If no session and trying to access protected route, redirect to signin
  if (!session && (req.nextUrl.pathname.startsWith('/posts') || req.nextUrl.pathname.startsWith('/dashboard'))) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/posts/:path*']
}