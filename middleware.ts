import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: DO NOT remove this getUser() call
  // This is required for server-side auth checks and session refreshing
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  console.log('Middleware - path:', path, 'user:', !!user)

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/alerts', '/report', '/map', '/learn']
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))

  // DEVELOPER BYPASS (Local Dev Only)
  const isDev = process.env.NODE_ENV === 'development'
  const hasDevBypass = request.cookies.get('dev-bypass')?.value === 'true'
  if (isDev && hasDevBypass && isProtectedRoute) {
    console.log('Middleware - allowing access via dev-bypass cookie')
    return supabaseResponse
  }

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !user) {
    console.log('Middleware - redirecting to login (no auth)')
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirectResponse = NextResponse.redirect(url)
    // Transfer cookies from supabaseResponse to the redirectResponse while preserving ALL options
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
      })
    })
    return redirectResponse
  }

  // Redirect to dashboard if already logged in and trying to access login
  if (path === '/login' && user) {
    console.log('Middleware - redirecting to dashboard (already auth)')
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    const redirectResponse = NextResponse.redirect(url)
    // Transfer cookies from supabaseResponse to the redirectResponse while preserving ALL options
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, {
        path: cookie.path,
        domain: cookie.domain,
        maxAge: cookie.maxAge,
        expires: cookie.expires,
        sameSite: cookie.sameSite,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
      })
    })
    return redirectResponse
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
