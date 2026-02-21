'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Review, UserProfile } from '@/types'

interface ReviewWithReviewer extends Review {
  reviewer?: UserProfile
}

export default function ReviewsListPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [mannerTemperature, setMannerTemperature] = useState(36.5)
  const [revealedReviews, setRevealedReviews] = useState<ReviewWithReviewer[]>([])
  const [blindReviews, setBlindReviews] = useState<ReviewWithReviewer[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        setUserId(user.id)

        // Fetch user profile for manner temperature
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('manner_temperature')
          .eq('id', user.id)
          .single()

        if (profile) {
          setMannerTemperature(profile.manner_temperature)
        }

        // Fetch reviews received
        const { data: reviews, error } = await supabase
          .from('reviews')
          .select(`
            id,
            application_id,
            reviewer_id,
            reviewee_id,
            score,
            comment,
            is_blind,
            revealed_at,
            created_at,
            reviewer:user_profiles!reviews_reviewer_id_fkey(
              id,
              display_name,
              avatar_url
            )
          `)
          .eq('reviewee_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to fetch reviews:', error)
          setLoading(false)
          return
        }

        const typed = (reviews || []).map(r => ({
          ...r,
          reviewer: Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer
        })) as ReviewWithReviewer[]

        // Separate into revealed and blind
        const revealed = typed.filter(r => r.revealed_at !== null)
        const blind = typed.filter(r => r.revealed_at === null)

        setRevealedReviews(revealed)
        setBlindReviews(blind)
        setLoading(false)
      } catch (e) {
        console.error('Failed to load reviews:', e)
        setLoading(false)
      }
    }

    loadReviews()
  }, [supabase, router])

  const getTemperatureColor = (temp: number) => {
    if (temp >= 40) return 'text-orange-500'
    if (temp >= 37) return 'text-green-500'
    return 'text-blue-500'
  }

  const getStarDisplay = (score: number) => {
    return '⭐'.repeat(score) + '☆'.repeat(5 - score)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-ink border-t-transparent rounded-full" />
      </div>
    )
  }

  const hasNoReviews = revealedReviews.length === 0 && blindReviews.length === 0

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="text-accent hover:text-accent text-sm font-medium mb-2"
        >
          ← 돌아가기
        </button>
        <h1 className="text-lg font-black text-gray-900">받은 리뷰</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Manner Temperature Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900">매너온도</h2>
              <div className="group relative">
                <span className="text-gray-400 cursor-help text-sm">ℹ️</span>
                <div className="invisible group-hover:visible absolute left-0 top-6 z-10 w-56 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-lg">
                  협업 매너를 나타내는 지표입니다. 성공적인 협업과 좋은 리뷰를 통해 올라갑니다. 기본값 36.5°에서 시작합니다.
                </div>
              </div>
            </div>
            <span className={`text-2xl font-black ${getTemperatureColor(mannerTemperature)}`}>
              {mannerTemperature.toFixed(1)}°
            </span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 via-green-400 to-orange-500 rounded-full transition-all"
              style={{ width: `${Math.min((mannerTemperature / 50) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">좋은 협업과 리뷰로 매너온도를 높여보세요</p>
        </div>

        {/* Empty State */}
        {hasNoReviews ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center mb-4 text-3xl">
              📝
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">아직 받은 리뷰가 없어요</h2>
            <p className="text-sm text-gray-500">
              성공적인 협업을 통해<br />리뷰를 받아보세요
            </p>
          </div>
        ) : (
          <>
            {/* Revealed Reviews Section */}
            {revealedReviews.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 text-sm mb-3 px-1">공개된 리뷰</h2>
                <div className="space-y-3">
                  {revealedReviews.map(review => (
                    <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      {/* Reviewer Info */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-cream flex items-center justify-center text-accent font-bold text-sm shrink-0">
                          {review.reviewer?.display_name?.[0] ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{review.reviewer?.display_name || '알 수 없음'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(review.created_at).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getStarDisplay(review.score)}</span>
                          <span className="text-sm font-semibold text-accent">{review.score}점</span>
                        </div>
                      </div>

                      {/* Comment */}
                      <p className="text-sm text-gray-700 mb-3 line-clamp-3">{review.comment}</p>

                      {/* Date */}
                      <p className="text-xs text-gray-400">
                        공개: {new Date(review.revealed_at!).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Blind Reviews Section */}
            {blindReviews.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 text-sm mb-3 px-1">블라인드 대기 중</h2>
                <div className="space-y-3">
                  {blindReviews.map(review => (
                    <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="text-3xl mb-3">🔒</div>
                          <p className="text-sm text-gray-500">
                            상대방이 리뷰를 작성하면<br />공개됩니다
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
