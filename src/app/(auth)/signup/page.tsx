'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserType } from '@/types'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [userType, setUserType] = useState<UserType>('individual')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 주소를 입력해 주세요.')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.')
      return
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('비밀번호는 영문과 숫자를 모두 포함해야 합니다.')
      return
    }

    if (displayName.trim().length < 2) {
      setError(userType === 'individual' ? '닉네임은 최소 2자 이상이어야 합니다.' : '단체명은 최소 2자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userType,
          display_name: displayName.trim(),
        },
      },
    })

    if (error) {
      console.error('Signup error:', error)
      if (error.message?.includes('User already registered') || error.message?.includes('already exists')) {
        setError('이미 가입된 이메일입니다. 로그인을 시도해 주세요.')
      } else if (error.message?.includes('Password')) {
        setError('비밀번호 조건을 확인해 주세요. (영문, 숫자 포함 8자 이상)')
      } else if (error.message?.includes('email')) {
        setError('올바른 이메일 주소를 입력해 주세요.')
      } else {
        setError(`회원가입 중 오류가 발생했습니다: ${error.message}`)
      }
      setIsLoading(false)
      return
    }

    if (!data.user) {
      setError('회원가입에 실패했습니다. 다시 시도해 주세요.')
      setIsLoading(false)
      return
    }

    router.push('/signup/verify-email?email=' + encodeURIComponent(email))
  }

  const handleSocialLogin = async (provider: 'kakao' | 'google') => {
    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : 'http://localhost:3000/auth/callback'

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: redirectUrl },
      })
      if (error) throw error
    } catch {
      setError('소셜 로그인 준비 중입니다. 이메일로 가입해 주세요.')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
      {/* 헤더 */}
      <div className="text-center px-6 pt-8 pb-4">
        <h1 className="text-2xl font-black text-gray-900">TUTTI 시작하기</h1>
        <p className="text-sm text-gray-500 mt-1">클래식 연주자 매칭 플랫폼</p>
      </div>

      <div className="px-6 pb-8 space-y-5">
        {/* ① 나는 누구인가요? */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">나는 누구인가요?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setUserType('individual')}
              className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                userType === 'individual'
                  ? 'border-accent bg-cream'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <span className="text-2xl">🎻</span>
              <div className="text-left">
                <p className={`text-sm font-bold ${userType === 'individual' ? 'text-accent' : 'text-gray-900'}`}>
                  개인 연주자
                </p>
                <p className="text-[10px] text-gray-400">솔로·앙상블 멤버</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setUserType('organization')}
              className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all ${
                userType === 'organization'
                  ? 'border-accent bg-cream'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <span className="text-2xl">🎼</span>
              <div className="text-left">
                <p className={`text-sm font-bold ${userType === 'organization' ? 'text-accent' : 'text-gray-900'}`}>
                  단체
                </p>
                <p className="text-[10px] text-gray-400">오케스트라·실내악단</p>
              </div>
            </button>
          </div>
        </div>

        {/* ② 소셜 로그인 */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">간편 가입</p>
          <div className="space-y-2">
            <button
              onClick={() => handleSocialLogin('kakao')}
              className="w-full h-11 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#FDD835] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 0.5C4.306 0.5 0.5 3.467 0.5 7.125c0 2.34 1.553 4.393 3.9 5.555L3.44 16.5a.313.313 0 00.457.34L8.63 13.8c.123.01.247.016.371.016 4.694 0 8.5-2.967 8.5-6.625C17.5 3.467 13.694.5 9 .5z" fill="currentColor"/>
              </svg>
              카카오로 시작하기
            </button>

            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full h-11 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Google로 시작하기
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100" />
          </div>
          <div className="relative flex justify-center text-xs text-gray-400">
            <span className="bg-white px-3">또는 이메일로 가입</span>
          </div>
        </div>

        {/* ③ 이메일 가입 폼 */}
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-3">
          <Input
            label={userType === 'individual' ? '닉네임' : '단체명'}
            placeholder={userType === 'individual' ? '활동명 또는 닉네임' : '단체 이름'}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />

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
            placeholder="영문 + 숫자 포함 8자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Input
            type="password"
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력해 주세요"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />

          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToPrivacy}
              onChange={(e) => setAgreedToPrivacy(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
              required
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              <Link href="/terms" className="text-accent underline" target="_blank">이용약관</Link>
              {' 및 '}
              <Link href="/privacy" className="text-accent underline" target="_blank">개인정보처리방침</Link>
              에 동의합니다. (필수)
            </span>
          </label>

          <Button type="submit" size="full" isLoading={isLoading} className="bg-ink hover:bg-ink-light">
            가입하기
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
