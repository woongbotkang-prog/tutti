'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { Application, UserProfile } from '@/types'

interface RevieweeInfo {
  displayName: string
  instrument: string | null
}

const CATEGORIES = [
  { id: 'musicality', label: '음악성', key: 'musicality' },
  { id: 'punctuality', label: '시간엄수', key: 'punctuality' },
  { id: 'communication', label: '소통', key: 'communication' },
  { id: 'preparedness', label: '준비성', key: 'preparedness' },
]

export default function ReviewWritePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const applicationId = searchParams.get('application_id')
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [revieweeInfo, setRevieweeInfo] = useState<RevieweeInfo | null>(null)
  const [overallScore, setOverallScore] = useState(0)
  const [categoryScores, setCategoryScores] = useState<Record<string, number>>({
    musicality: 0,
    punctuality: 0,
    communication: 0,
    preparedness: 0,
  })
  const [comment, setComment] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  // Load application and validate
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!applicationId) {
          setError('유효한 지원 정보가 없어요.')
          setLoading(false)
          return
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }
        setUserId(user.id)

        // Fetch application with gig and applicant info
        const { data: application, error: appError } = await supabase
          .from('applications')
          .select(`
            id,
            gig_id,
            applicant_id,
            status,
            gig:gigs(id, user_id),
            applicant:user_profiles(id, display_name)
          `)
          .eq('id', applicationId)
          .single()

        if (appError || !application) {
          setError('지원 정보를 찾을 수 없어요.')
          setLoading(false)
          return
        }

        // Check if application is accepted
        if (application.status !== 'accepted') {
          setError('수락된 지원에 대해서만 리뷰를 작성할 수 있어요.')
          setLoading(false)
          return
        }

        // Type cast and check if user is part of the application
        const gig = Array.isArray(application.gig) ? application.gig[0] : (application.gig as any)
        const isGigOwner = (gig as any)?.user_id === user.id
        const isApplicant = application.applicant_id === user.id

        if (!isGigOwner && !isApplicant) {
          setError('이 지원에 대한 리뷰를 작성할 권한이 없어요.')
          setLoading(false)
          return
        }

        // Get reviewee info (the other party)
        let revieweeId: string
        if (isGigOwner) {
          // Gig owner reviewing applicant
          revieweeId = application.applicant_id
        } else {
          // Applicant reviewing gig owner
          revieweeId = (gig as any)?.user_id || ''
        }

        // Fetch reviewee profile and instrument
        const { data: revieweeProfile } = await supabase
          .from('user_profiles')
          .select(`
            id,
            display_name,
            user_instruments(instrument:instruments(name))
          `)
          .eq('id', revieweeId)
          .single()

        if (!revieweeProfile) {
          setError('리뷰 대상을 찾을 수 없어요.')
          setLoading(false)
          return
        }

        // Get primary instrument
        const instruments = (revieweeProfile.user_instruments as any[]) || []
        const instrument = instruments.length > 0
          ? instruments[0].instrument?.name
          : null

        setRevieweeInfo({
          displayName: revieweeProfile.display_name,
          instrument,
        })

        // Check if user already reviewed (use maybeSingle since we're checking existence)
        const { data: existingReview, error: reviewCheckError } = await supabase
          .from('reviews')
          .select('id')
          .eq('application_id', applicationId)
          .eq('reviewer_id', user.id)
          .maybeSingle()

        if (reviewCheckError) {
          setError('리뷰 확인 중 오류가 발생했어요.')
          setLoading(false)
          return
        }

        if (existingReview) {
          setError('이미 이 지원에 대한 리뷰를 작성했어요.')
          setLoading(false)
          return
        }

        setLoading(false)
      } catch (e) {
        console.error('Failed to load application:', e)
        setError('데이터를 불러오는 중 오류가 발생했어요.')
        setLoading(false)
      }
    }

    loadData()
  }, [applicationId, supabase, router])

  const handleSubmit = async () => {
    if (!applicationId || !userId || !revieweeInfo) return

    if (overallScore === 0) {
      setError('별점을 선택해 주세요.')
      return
    }

    if (comment.trim().length === 0) {
      setError('리뷰 내용을 입력해 주세요.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('인증이 필요해요.')
        setSubmitting(false)
        return
      }

      // Get the other party's ID
      const { data: application, error: appError } = await supabase
        .from('applications')
        .select('gig:gigs(user_id), applicant_id')
        .eq('id', applicationId)
        .single()

      if (appError || !application) {
        setError('지원 정보를 찾을 수 없어요.')
        setSubmitting(false)
        return
      }

      const appGig = Array.isArray(application.gig) ? application.gig[0] : (application.gig as any)
      const revieweeId = (appGig as any)?.user_id === user.id
        ? application.applicant_id
        : (appGig as any)?.user_id

      if (!revieweeId) {
        setError('리뷰 대상을 찾을 수 없어요.')
        setSubmitting(false)
        return
      }

      // Insert review
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .insert({
          application_id: applicationId,
          reviewer_id: user.id,
          reviewee_id: revieweeId,
          score: overallScore,
          comment: comment.trim(),
          is_blind: true,
          category_scores: categoryScores,
        })
        .select()
        .single()

      if (reviewError) throw reviewError

      // Calculate manner temperature change
      let temperatureChange = 0
      if (overallScore >= 4) {
        temperatureChange = 0.2
      } else if (overallScore >= 3) {
        temperatureChange = 0.1
      } else {
        temperatureChange = -0.2
      }

      // Update user's manner temperature
      const { data: currentProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('manner_temperature')
        .eq('id', user.id)
        .single()

      if (profileError || !currentProfile) {
        console.error('Failed to fetch current profile:', profileError)
        // Use default temperature if fetch fails
      }

      const newTemperature = Math.max(30, (currentProfile?.manner_temperature ?? 36.5) + temperatureChange)

      await supabase
        .from('user_profiles')
        .update({ manner_temperature: newTemperature })
        .eq('id', user.id)

      // Log manner temperature change
      await supabase
        .from('manner_temperature_logs')
        .insert({
          user_id: user.id,
          change_amount: temperatureChange,
          reason: `review_submitted_${overallScore}_stars`,
          related_review_id: review.id,
        })

      // Check if both parties reviewed
      const { data: otherReview } = await supabase
        .from('reviews')
        .select('id, revealed_at')
        .eq('application_id', applicationId)
        .eq('reviewer_id', revieweeId)
        .single()

      if (otherReview && otherReview.revealed_at === null) {
        // Both reviewed, reveal both reviews
        const now = new Date().toISOString()

        await supabase
          .from('reviews')
          .update({ revealed_at: now })
          .eq('application_id', applicationId)
          .in('reviewer_id', [user.id, revieweeId])

        // Send notification to other party
        await supabase
          .from('notifications')
          .insert({
            user_id: revieweeId,
            type: 'review_request',
            title: '리뷰가 공개됐어요',
            body: `${revieweeInfo.displayName}님의 리뷰를 확인해 보세요.`,
            data: { application_id: applicationId },
          })
      } else if (!otherReview) {
        // Other party hasn't reviewed yet, send notification
        await supabase
          .from('notifications')
          .insert({
            user_id: revieweeId,
            type: 'review_request',
            title: '리뷰를 기다리는 중이에요',
            body: `${revieweeInfo.displayName}님의 리뷰를 남겨주세요.`,
            data: { application_id: applicationId },
          })
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/reviews')
      }, 1500)
    } catch (e) {
      console.error('Failed to submit review:', e)
      setError(e instanceof Error ? e.message : '리뷰 제출 중 오류가 발생했어요.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-ink border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!revieweeInfo) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="bg-white px-4 py-4 border-b border-gray-100">
          <button
            onClick={() => router.back()}
            className="text-accent hover:text-accent text-sm font-medium"
          >
            ← 돌아가기
          </button>
        </header>
        <main className="max-w-lg mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
            <p className="text-red-600 font-medium">{error || '리뷰를 작성할 수 없어요.'}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-20">
        <button
          onClick={() => router.back()}
          className="text-accent hover:text-accent text-sm font-medium"
        >
          ← 돌아가기
        </button>
        <h1 className="text-lg font-black text-gray-900 mt-2">리뷰 작성</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="rounded-xl bg-green-50 p-3 text-sm text-green-600">
            ✓ 리뷰가 제출됐습니다!
          </div>
        )}

        {/* Blind Review Info */}
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <div className="flex gap-3">
            <div className="text-2xl">🔒</div>
            <div>
              <h3 className="font-semibold text-blue-900 text-sm mb-1">블라인드 리뷰</h3>
              <p className="text-xs text-blue-800">
                양쪽 모두 리뷰를 작성하면 서로의 리뷰가 공개됩니다. 공정한 평가를 위해 이름은 숨겨져 있어요.
              </p>
            </div>
          </div>
        </div>

        {/* Reviewee Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-500 mb-3">누가 나를 평가하나요?</p>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-cream flex items-center justify-center text-accent font-bold text-lg">
              {revieweeInfo.displayName[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{revieweeInfo.displayName}</p>
              {revieweeInfo.instrument && (
                <p className="text-sm text-gray-500 mt-0.5">{revieweeInfo.instrument}</p>
              )}
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">종합 평점</h2>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map(score => (
              <button
                key={score}
                onClick={() => setOverallScore(score)}
                className={`w-12 h-12 rounded-xl text-2xl transition-all ${
                  overallScore >= score
                    ? 'bg-cream text-accent scale-110'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                ★
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            {overallScore > 0 ? `${overallScore}점으로 평가 중` : '별점을 선택해 주세요'}
          </p>
        </div>

        {/* Category Scores */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">세부 평가</h2>
          <div className="space-y-4">
            {CATEGORIES.map(category => (
              <div key={category.id}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">{category.label}</label>
                  <span className="text-xs text-gray-500">
                    {categoryScores[category.key] > 0 ? `${categoryScores[category.key]}점` : '미평가'}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      onClick={() => setCategoryScores(prev => ({
                        ...prev,
                        [category.key]: score
                      }))}
                      className={`flex-1 h-8 rounded-lg text-sm font-medium transition-all ${
                        categoryScores[category.key] >= score
                          ? 'bg-ink text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">리뷰 내용</h2>
          <textarea
            placeholder="협업하면서 느낀 점을 자유롭게 써주세요 (필수)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            maxLength={500}
            rows={5}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-2">{comment.length}/500</p>
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={overallScore === 0 || comment.trim().length === 0}
          isLoading={submitting}
          size="full"
          className="bg-ink hover:bg-ink-light disabled:opacity-40"
        >
          리뷰 제출하기
        </Button>
      </main>
    </div>
  )
}
