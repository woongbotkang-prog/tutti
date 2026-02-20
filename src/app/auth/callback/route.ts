import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // 프로필 존재 여부 확인 → 없으면 온보딩으로
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id, user_type')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile || !profile.user_type) {
          // 신규 가입자 또는 프로필 미완성 → 온보딩
          return NextResponse.redirect(`${origin}/onboarding?verified=1`)
        }
      }
      // 이메일 인증 완료 후 → 홈으로 (환영 메시지 표시)
      const redirectPath = next === '/' ? '/?welcome=1' : next
      return NextResponse.redirect(`${origin}${redirectPath}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
