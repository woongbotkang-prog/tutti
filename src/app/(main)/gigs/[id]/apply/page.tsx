'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { applyToGig } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function ApplyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await applyToGig(params.id, message)

      // 공고 작성자에게 알림 생성
      try {
        const supabase = createClient()
        const { data: gig } = await supabase
          .from('gigs')
          .select('user_id, title')
          .eq('id', params.id)
          .single()

        if (gig) {
          await supabase.from('notifications').insert({
            user_id: gig.user_id,
            type: 'application_received',
            title: '새 지원이 도착했습니다',
            body: `${gig.title} 공고에 새 지원자가 있습니다.`,
            data: { gig_id: params.id },
            is_read: false,
          })
        }
      } catch {
        // 알림 생성 실패해도 지원 자체는 성공
      }

      router.push(`/gigs/${params.id}?applied=1`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '지원 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-20">
        <Link href={`/gigs/${params.id}`}>
          <button className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </Link>
        <h1 className="font-bold text-gray-900">지원하기</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">지원 메시지</h2>
          <p className="text-sm text-gray-500">자신을 소개하고, 지원 동기를 자유롭게 적어주세요.</p>
          <textarea
            placeholder="안녕하세요! 바이올린 연주 경력 5년으로..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <p className="text-xs text-gray-400">※ 메시지는 선택사항입니다</p>
        </div>

        <Button onClick={handleApply} size="full" isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
          지원 완료하기
        </Button>
      </main>
    </div>
  )
}
