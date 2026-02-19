'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { UserType } from '@/types'

type Step = 'type' | 'info'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('type')
  const [userType, setUserType] = useState<UserType | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)

  const handleTypeSelect = (type: UserType) => {
    setUserType(type)
    setStep('info')
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userType) return

    setError(null)

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('올바른 이메일 주소를 입력해 주세요.')
      return
    }

    // 비밀번호 검증
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

    // 닉네임/단체명 검증
    if (displayName.trim().length < 2) {
      setError(userType === 'individual' ? '닉네임은 최소 2자 이상이어야 합니다.' : '단체명은 최소 2자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)

    const redirectUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}/auth/callback`
      : 'http://localhost:3000/auth/callback'

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userType,
          display_name: displayName.trim(),
        },
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) {
      console.error('Signup error:', error)
      
      // 이미 가입된 이메일
      if (error.message?.includes('User already registered') || error.message?.includes('already exists')) {
        setError('이미 가입된 이메일입니다. 로그인을 시도해 주세요.')
        setIsLoading(false)
        return
      }
      
      // 비밀번호 정책 위반
      if (error.message?.includes('Password')) {
        setError('비밀번호 조건을 확인해 주세요. (영문, 숫자 포함 8자 이상)')
        setIsLoading(false)
        return
      }
      
      // 이메일 형식 오류
      if (error.message?.includes('email')) {
        setError('올바른 이메일 주소를 입력해 주세요.')
        setIsLoading(false)
        return
      }
      
      // 기타 오류
      setError(`회원가입 중 오류가 발생했습니다: ${error.message}`)
      setIsLoading(false)
      return
    }

    // 가입 성공 확인
    if (!data.user) {
      setError('회원가입에 실패했습니다. 다시 시도해 주세요.')
      setIsLoading(false)
      return
    }

    console.log('Signup success:', data.user.id)
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
      setError('소셜 로그인 준비 중입니다. 이메일로 로그인해 주세요.')
    }
  }

  // Step 1: 유형 선택
  if (step === 'type') {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">TUTTI 시작하기 🎼</CardTitle>
          <CardDescription>어떤 역할로 참여하시나요?</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* 소셜 로그인 */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('kakao')}
              className="w-full h-12 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#FDD835] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M9 0.5C4.306 0.5 0.5 3.467 0.5 7.125c0 2.34 1.553 4.393 3.9 5.555L3.44 16.5a.313.313 0 00.457.34L8.63 13.8c.123.01.247.016.371.016 4.694 0 8.5-2.967 8.5-6.625C17.5 3.467 13.694.5 9 .5z" fill="currentColor"/>
              </svg>
              카카오로 시작하기
            </button>

            <button
              onClick={() => handleSocialLogin('google')}
              className="w-full h-12 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs text-gray-400">
              <span className="bg-white px-3">또는 이메일로 가입</span>
            </div>
          </div>

          {/* 유형 선택 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTypeSelect('individual')}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
            >
              <span className="text-4xl">🎻</span>
              <div className="text-center">
                <p className="font-bold text-gray-900 group-hover:text-indigo-700">개인 연주자</p>
                <p className="text-xs text-gray-500 mt-1">솔로이스트, 앙상블 멤버</p>
              </div>
            </button>

            <button
              onClick={() => handleTypeSelect('organization')}
              className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
            >
              <span className="text-4xl">🎼</span>
              <div className="text-center">
                <p className="font-bold text-gray-900 group-hover:text-indigo-700">단체</p>
                <p className="text-xs text-gray-500 mt-1">오케스트라, 실내악단</p>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:underline">
              로그인
            </Link>
          </p>
        </CardContent>
      </Card>
    )
  }

  // Step 2: 정보 입력
  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-2">
        <button
          onClick={() => setStep('type')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2 -ml-1"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          뒤로
        </button>
        <CardTitle className="text-xl">
          {userType === 'individual' ? '🎻 개인 연주자' : '🎼 단체'} 가입
        </CardTitle>
        <CardDescription>기본 정보를 입력해 주세요</CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

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
            placeholder="8자 이상"
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
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              required
            />
            <span className="text-xs text-gray-500 leading-relaxed">
              <Link href="/terms" className="text-indigo-600 underline" target="_blank">이용약관</Link>
              {' 및 '}
              <Link href="/privacy" className="text-indigo-600 underline" target="_blank">개인정보처리방침</Link>
              에 동의합니다. (필수)
            </span>
          </label>

          <Button type="submit" size="full" isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
            가입하기
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
