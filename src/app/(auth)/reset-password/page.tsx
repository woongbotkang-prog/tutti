'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase가 URL의 토큰을 자동으로 세션에 적용하므로 잠시 대기
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setSessionReady(true)
      } else {
        // 토큰 처리를 위해 약간 대기
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          setSessionReady(!!retrySession)
          if (!retrySession) {
            setError('유효하지 않거나 만료된 링크입니다. 비밀번호 찾기를 다시 시도해 주세요.')
          }
        }, 1500)
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '비밀번호 변경에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">비밀번호 변경 완료 ✅</CardTitle>
          <CardDescription>새 비밀번호로 로그인할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 text-center">
          <p className="text-sm text-gray-500">
            잠시 후 로그인 페이지로 이동합니다...
          </p>
          <Link href="/login">
            <Button size="full" className="bg-ink hover:bg-ink-light">
              로그인하러 가기
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">새 비밀번호 설정 🔐</CardTitle>
        <CardDescription>새로운 비밀번호를 입력해 주세요</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {!sessionReady && !error ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="animate-spin w-8 h-8 border-2 border-ink border-t-transparent rounded-full" />
            <p className="text-sm text-gray-500">인증 확인 중...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
                {error.includes('만료') && (
                  <Link href="/forgot-password" className="block mt-2 text-accent hover:underline font-medium">
                    비밀번호 찾기 다시 시도하기
                  </Link>
                )}
              </div>
            )}

            <Input
              type="password"
              label="새 비밀번호"
              placeholder="6자 이상 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />

            <Input
              type="password"
              label="비밀번호 확인"
              placeholder="한 번 더 입력"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              size="full"
              isLoading={isLoading}
              disabled={!sessionReady}
              className="bg-ink hover:bg-ink-light"
            >
              비밀번호 변경하기
            </Button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="text-accent hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
