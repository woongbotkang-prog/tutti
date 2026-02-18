import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// 로그인이 필요한 경로
const PROTECTED_PATHS = ['/profile', '/gigs/new', '/chat', '/applications']
// 로그인 상태에서 접근 불가 경로
const AUTH_PATHS = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  const { pathname } = request.nextUrl

  // 세션 확인
  const sessionCookie = request.cookies.get('sb-krotxjppdiyxvfuoqdqp-auth-token')
  const isLoggedIn = !!sessionCookie

  // 보호된 경로 → 로그인 필요
  if (PROTECTED_PATHS.some(p => pathname.startsWith(p)) && !isLoggedIn) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 로그인 상태에서 auth 페이지 접근 → 홈으로
  if (AUTH_PATHS.some(p => pathname.startsWith(p)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
