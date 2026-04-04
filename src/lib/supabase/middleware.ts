import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ROLE_HOME: Record<string, string> = {
  student: '/student',
  company: '/company',
  admin:   '/admin',
}

const PROTECTED_PREFIXES = ['/student', '/company', '/admin']
const AUTH_PREFIXES      = ['/auth/login', '/auth/register']

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p))
  const isAuthPage  = AUTH_PREFIXES.some(p => pathname.startsWith(p))

  // Only run auth checks on relevant routes
  if (!isProtected && !isAuthPage) return response

  const { data: { user } } = await supabase.auth.getUser()

  // ── Not logged in ──────────────────────────────────────────────
  if (!user) {
    if (isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
    return response
  }

  // ── Logged in → fetch role ─────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role as string | undefined

  if (!role) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  const home = ROLE_HOME[role] ?? '/auth/login'

  // ── Redirect away from auth pages if already logged in ─────────
  if (isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = home
    return NextResponse.redirect(url)
  }

  // ── Role-based access control ───────────────────────────────────
  if (isProtected) {
    const allowed = pathname.startsWith(home) || role === 'admin'

    if (!allowed) {
      const url = request.nextUrl.clone()
      url.pathname = home
      return NextResponse.redirect(url)
    }
  }

  return response
}