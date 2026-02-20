'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('이메일을 입력해 주세요.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/reset-password`
        : 'https://tutti-kohl.vercel.app/reset-password'

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      })

      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <Card className="shadow-lg border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">메일을 확인해 주세요 ✉️</CardTitle>
          <CardDescription>비밀번호 재설정 링크를 보냈습니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="bg-indigo-50 rounded-xl p-4 text-center">
            <p className="text-sm text-indigo-700 font-medium">{email}</p>
            <p className="text-xs text-gray-500 mt-2">
              위 주소로 비밀번호 재설정 링크를 보냈습니다.<br />
              메일함을 확인해 주세요. (스팸함도 확인해 보세요)
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => { setSent(false); setEmail('') }}
              className="text-sm text-indigo-600 hover:underline"
            >
              다른 이메일로 다시 보내기
            </button>
            <Link href="/login" className="text-sm text-gray-500 hover:underline text-center">
              로그인으로 돌아가기
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">비밀번호 찾기 🔑</CardTitle>
        <CardDescription>가입한 이메일을 입력하면 재설정 링크를 보내드려요</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <form onSubmit={handleSubmit} className="space-y-3">
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

          <Button type="submit" size="full" isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
            재설정 링크 보내기
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          <Link href="/login" className="text-indigo-600 hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
