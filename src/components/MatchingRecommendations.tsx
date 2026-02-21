'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

interface MatchingGig {
  gig_id: string
  title: string
  match_score: number
  matching_factors: string[]
}

export default function MatchingRecommendations() {
  const [gigs, setGigs] = useState<MatchingGig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatching = async () => {
      try {
        const res = await fetch('/api/matching')
        const json = await res.json()
        setGigs(json.data || [])
      } catch (e) {
        console.error('Failed to fetch matching gigs:', e)
        setGigs([])
      } finally {
        setLoading(false)
      }
    }

    fetchMatching()
  }, [])

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold text-gray-900">추천 공고</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-64 h-40 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (gigs.length === 0) {
    return (
      <div className="px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold text-gray-900">추천 공고</h2>
        </div>
        <div className="bg-gradient-to-br from-cream to-cream rounded-2xl p-6 border border-cream-dark">
          <p className="text-sm text-gray-600 text-center">
            아직 추천 공고가 없어요. 프로필을 완성하면 더 좋은 매칭을 받을 수 있어요!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-bold text-gray-900">추천 공고</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory">
        {gigs.map((gig) => (
          <Link key={gig.gig_id} href={`/gigs/${gig.gig_id}`}>
            <div className="flex-shrink-0 w-64 bg-gradient-to-br from-cream to-cream rounded-2xl p-4 border border-cream-dark hover:border-accent hover:shadow-lg transition-all active:scale-[0.98] snap-center cursor-pointer">
              {/* Match Score */}
              <div className="mb-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-accent">{gig.match_score}%</span>
                <span className="text-xs text-gray-600 font-medium">매칭률</span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-3">
                {gig.title}
              </h3>

              {/* Matching Factors */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-700 mb-2">매칭 요인:</p>
                <div className="flex flex-wrap gap-1">
                  {gig.matching_factors && gig.matching_factors.length > 0 ? (
                    gig.matching_factors.slice(0, 3).map((factor, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full bg-white text-accent font-medium border border-cream-dark"
                      >
                        {factor}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-500">요인 없음</span>
                  )}
                </div>
              </div>

              {/* Cta */}
              <div className="mt-4 text-xs font-semibold text-accent flex items-center">
                자세히 보기 →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
