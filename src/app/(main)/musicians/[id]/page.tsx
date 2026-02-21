'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Verified, Edit } from 'lucide-react'
import { fetchPublicMusicianProfile, type PublicMusicianProfile } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { SkillLevel } from '@/types'

const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner: '입문',
  elementary: '초급',
  intermediate: '중급',
  advanced: '고급',
  professional: '전문가',
}

const getMannerTemperatureColor = (temp: number) => {
  if (temp >= 37.5) return 'text-red-500'
  if (temp >= 37) return 'text-orange-500'
  if (temp >= 36.5) return 'text-yellow-500'
  return 'text-blue-500'
}

export default function MusicianProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [profile, setProfile] = useState<PublicMusicianProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params.id) return

    const loadData = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user?.id || null)

        const musicianProfile = await fetchPublicMusicianProfile(params.id)
        if (!musicianProfile) {
          setError('연주자 프로필을 찾을 수 없습니다.')
          setProfile(null)
        } else {
          setProfile(musicianProfile)
          setError(null)
        }
      } catch (err) {
        setError('프로필 로드 중 오류가 발생했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen p-4">
        <button
          onClick={() => router.back()}
          className="mb-4 p-2 hover:bg-gray-100 rounded-lg"
          aria-label="뒤로 가기"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center py-12">
          <p className="text-gray-500">{error || '프로필을 찾을 수 없습니다.'}</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser === profile.id

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold flex-1 text-center">연주자 프로필</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center">
          {/* Avatar */}
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover bg-gray-100"
            />
          )}

          {/* Name and Verification */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">{profile.display_name}</h2>
            {profile.is_verified && (
              <Verified className="w-5 h-5 text-accent" />
            )}
          </div>

          {/* Manner Temperature */}
          <div className={`text-sm font-semibold mb-3 ${getMannerTemperatureColor(profile.manner_temperature)}`}>
            매너온도 {profile.manner_temperature.toFixed(1)}°C
          </div>

          {/* Region */}
          {profile.region && (
            <div className="flex items-center justify-center gap-1 text-gray-600 mb-4">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{profile.region.name}</span>
            </div>
          )}

          {/* Edit Button (only for own profile) */}
          {isOwnProfile && (
            <Link href="/profile">
              <Button className="w-full bg-ink hover:bg-ink-light text-white rounded-lg">
                <Edit className="w-4 h-4 mr-2" />
                프로필 수정
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="max-w-lg mx-auto px-4 py-4 border-t border-gray-100">
          <p className="text-gray-700 text-sm whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}

      {/* Instruments */}
      {profile.instruments && profile.instruments.length > 0 && (
        <div className="max-w-lg mx-auto px-4 py-4 border-t border-gray-100">
          <h3 className="text-lg font-bold mb-3">악기</h3>
          <div className="space-y-2">
            {profile.instruments.map((ui) => (
              <div
                key={ui.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div>
                  <p className="font-medium">{ui.instrument?.name}</p>
                  <p className="text-xs text-gray-500">
                    {SKILL_LEVEL_LABELS[ui.skill_level]}
                    {ui.years_of_experience && ` • ${ui.years_of_experience}년`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repertoire */}
      {profile.repertoire && profile.repertoire.length > 0 && (
        <div className="max-w-lg mx-auto px-4 py-4 border-t border-gray-100">
          <h3 className="text-lg font-bold mb-3">레퍼토리</h3>
          <div className="space-y-2">
            {profile.repertoire.map((rep) => (
              <div
                key={rep.id}
                className={`p-3 rounded-xl border ${
                  rep.performance_ready
                    ? 'bg-cream border-cream-dark'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <p className="font-medium text-sm">{rep.piece_name}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {rep.composer?.name_ko || rep.composer?.name_en || rep.composer_name}
                </p>
                {rep.performance_ready && (
                  <p className="text-xs text-accent font-semibold mt-1">
                    공연 준비 완료
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      {profile.reviews && profile.reviews.length > 0 && (
        <div className="max-w-lg mx-auto px-4 py-4 border-t border-gray-100">
          <h3 className="text-lg font-bold mb-3">받은 리뷰</h3>
          <div className="space-y-3">
            {profile.reviews.map((review) => (
              <div
                key={review.id}
                className="p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-start gap-3 mb-2">
                  {review.reviewer?.avatar_url && (
                    <img
                      src={review.reviewer.avatar_url}
                      alt={review.reviewer?.display_name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {review.reviewer?.display_name || '익명'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="text-lg font-bold text-accent flex-shrink-0">
                    {review.score.toFixed(1)}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for reviews */}
      {(!profile.reviews || profile.reviews.length === 0) && (
        <div className="max-w-lg mx-auto px-4 py-4 border-t border-gray-100 text-center text-gray-500 text-sm">
          공개된 리뷰가 없습니다.
        </div>
      )}
    </div>
  )
}
