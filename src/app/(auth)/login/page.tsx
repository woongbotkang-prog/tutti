'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setIsLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  const handleKakaoLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch {
      setError('소셜 로그인 준비 중입니다. 이메일로 로그인해 주세요.')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch {
      setError('소셜 로그인 준비 중입니다. 이메일로 로그인해 주세요.')
    }
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">환영합니다 🎵</CardTitle>
        <CardDescription>계속하려면 로그인해 주세요</CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-4">
        {/* 소셜 로그인 */}
        <div className="space-y-3">
          <button
            onClick={handleKakaoLogin}
            className="w-full h-12 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#FDD835] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M9 0.5C4.306 0.5 0.5 3.467 0.5 7.125c0 2.34 1.553 4.393 3.9 5.555L3.44 16.5a.313.313 0 00.457.34L8.63 13.8c.123.01.247.016.371.016 4.694 0 8.5-2.967 8.5-6.625C17.5 3.467 13.694.5 9 .5z" fill="currentColor"/>
            </svg>
            카카오로 로그인
          </button>

          <button
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Google로 로그인
          </button>
        </div>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white px-3">또는 이메일로 로그인</span>
          </div>
        </div>

        {/* 이메일 로그인 폼 */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Input
            type="email"
            label="이메일"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력해 주세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <Button type="submit" size="full" isLoading={isLoading} className="mt-2 bg-indigo-600 hover:bg-indigo-700">
            로그인
          </Button>
        </form>

        {/* 회원가입 링크 */}
        <p className="text-center text-sm text-gray-500">
          아직 계정이 없으신가요?{' '}
          <Link href="/signup" className="font-semibold text-indigo-600 hover:underline">
            회원가입
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
