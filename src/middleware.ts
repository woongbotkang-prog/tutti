import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // 인증이 필요한 보호된 경로
  const isProtectedRoute =
    pathname.startsWith('/profile') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/reviews/write') ||
    pathname.startsWith('/repertoire') ||
    pathname.startsWith('/applications') ||
    pathname === '/gigs/new' ||
    pathname.includes('/apply') ||
    pathname.match(/\/gigs\/.*\/edit/);

  if (isProtectedRoute) {
    // updateSession에서 이미 쿠키를 갱신했으므로 최신 쿠키로 유저 확인
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // 읽기 전용 체크용 - setAll 불필요
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
