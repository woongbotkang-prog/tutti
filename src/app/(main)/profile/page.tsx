'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { fetchMyProfile, upsertProfile, upsertUserInstruments, fetchMyGigs, uploadAvatar } from '@/lib/supabase/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import UserAvatar from '@/components/UserAvatar'
import type { SkillLevel } from '@/types'

const AVATAR_EMOJIS = [
  // 클래식 악기 (20개)
  '🎻', '🎹', '🎺', '🎷', '🥁',
  '🎸', '🪕', '🪗', '🪈', '📯',
  '🪘', '🎵', '🎶', '🎼', '🔔',
  '🎤', '🎧', '🪇', '🎙️', '🪈',
  // 음악/공연 (10개)
  '🎭', '🎪', '🏛️', '📜', '🎬',
  '💫', '✨', '🌟', '⭐', '🎯',
  // 작곡가/캐릭터 (10개)
  '🧔', '👨‍🎨', '🎩', '👴', '🧑‍🎤',
  '👨‍🏫', '🧙‍♂️', '🤴', '👨‍💼', '🎅',
]

const INSTRUMENTS = ['바이올린', '비올라', '첼로', '콘트라베이스', '플루트', '오보에', '클라리넷', '바순', '호른', '트럼펫', '트롬본', '튜바', '피아노', '하프', '타악기']
const PERIODS: { value: string; label: string }[] = [
  { value: 'baroque', label: '바로크' },
  { value: 'classical', label: '고전' },
  { value: 'romantic', label: '낭만' },
  { value: 'modern', label: '근현대' },
  { value: 'contemporary', label: '현대' },
]
const GENRES: { value: string; label: string }[] = [
  { value: 'orchestral', label: '오케스트라' },
  { value: 'chamber', label: '실내악' },
  { value: 'solo', label: '독주' },
  { value: 'opera', label: '오페라' },
  { value: 'choral', label: '합창' },
]
const REGIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
const LEVELS: { value: SkillLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: '입문', desc: '취미로 시작한 지 얼마 안 됨' },
  { value: 'elementary', label: '초급', desc: '기초 곡 연주 가능' },
  { value: 'intermediate', label: '중급', desc: '오케스트라 참여 가능' },
  { value: 'advanced', label: '고급', desc: '독주회 수준' },
  { value: 'professional', label: '전문가', desc: '음대 졸업 이상' },
]

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()

  const [initialLoading, setInitialLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [displayName, setDisplayName] = useState('')
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [primaryLevel, setPrimaryLevel] = useState<SkillLevel>('intermediate')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [bio, setBio] = useState('')
  const [mannerTemperature, setMannerTemperature] = useState(36.5)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarEmoji, setAvatarEmoji] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [userType, setUserType] = useState<string | null>(null)
  const [preferredPeriods, setPreferredPeriods] = useState<string[]>([])
  const [preferredGenres, setPreferredGenres] = useState<string[]>([])
  const [myGigs, setMyGigs] = useState<Array<{
    id: string
    gig_type: 'hiring' | 'seeking'
    title: string
    status: string
    created_at: string
    expires_at: string | null
    view_count: number
    region: { name: string } | null
    instruments: Array<{ instrument: { name: string } | null }>
  }>>([])
  const [activityStats, setActivityStats] = useState({
    totalGigs: 0,
    totalApplicationsSent: 0,
    acceptedApplications: 0,
    reviews: 0,
  })

  // 기존 프로필 불러오기
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchMyProfile()
        if (profile) {
          setDisplayName(profile.display_name || '')
          setBio(profile.bio || '')
          setAvatarUrl(profile.avatar_url || null)
          setAvatarEmoji((profile as any).avatar_emoji || null)
          setMannerTemperature(profile.manner_temperature || 36.5)
          setUserType(profile.user_type || null)
          if (profile.region) {
            setSelectedRegion(profile.region.name || '')
          }
          if (profile.instruments && profile.instruments.length > 0) {
            setSelectedInstruments(
              profile.instruments.map((ui: { instrument?: { name: string } | null }) => ui.instrument?.name).filter(Boolean) as string[]
            )
            const primary = profile.instruments.find((ui: { is_primary: boolean }) => ui.is_primary)
            if (primary?.skill_level) {
              setPrimaryLevel(primary.skill_level)
            } else if (profile.instruments[0]?.skill_level) {
              setPrimaryLevel(profile.instruments[0].skill_level)
            }
          }
          // 단체 음악적 정체성 불러오기
          if (profile.user_type === 'organization') {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
              const { data: musicPrefs } = await supabase
                .from('organization_music_preferences')
                .select('preferred_periods, preferred_genres')
                .eq('org_user_id', user.id)
                .single()
              if (musicPrefs) {
                setPreferredPeriods(musicPrefs.preferred_periods || [])
                setPreferredGenres(musicPrefs.preferred_genres || [])
              }
            }
          }
        }
      } catch (e) {
        console.error('프로필 불러오기 실패:', e)
      } finally {
        setInitialLoading(false)
      }
    }
    const loadMyGigs = async () => {
      try {
        const gigs = await fetchMyGigs()
        setMyGigs(gigs as unknown as typeof myGigs)
      } catch (e) {
        console.error('내 공고 불러오기 실패:', e)
      }
    }
    const loadActivityStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // 올린 공고 총 개수
        const { count: gigsCount } = await supabase
          .from('gigs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // 보낸 지원서 총 개수
        const { count: applicationsSentCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('applicant_id', user.id)

        // 수락된 지원서 개수
        const { count: acceptedCount } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('applicant_id', user.id)
          .eq('status', 'accepted')

        // 리뷰 개수 (given_by = current user)
        const { count: reviewsCount } = await supabase
          .from('reviews')
          .select('*', { count: 'exact', head: true })
          .eq('reviewer_id', user.id)

        setActivityStats({
          totalGigs: gigsCount || 0,
          totalApplicationsSent: applicationsSentCount || 0,
          acceptedApplications: acceptedCount || 0,
          reviews: reviewsCount || 0,
        })
      } catch (e) {
        console.error('활동 통계 불러오기 실패:', e)
      }
    }
    loadProfile()
    loadMyGigs()
    loadActivityStats()
  }, [])

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments(prev =>
      prev.includes(instrument)
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    )
  }

  const togglePeriod = (period: string) => {
    setPreferredPeriods(prev =>
      prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
    )
  }

  const toggleGenre = (genre: string) => {
    setPreferredGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    )
  }

  const MAX_AVATAR_SIZE = 10 * 1024 * 1024 // 10MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('JPG, PNG, WebP 형식만 업로드할 수 있어요.')
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError('사진 크기는 10MB 이하만 가능해요.')
      return
    }

    setAvatarUploading(true)
    setError(null)
    try {
      const url = await uploadAvatar(file)
      // 캐시 방지를 위한 타임스탬프 추가
      setAvatarUrl(`${url}?t=${Date.now()}`)

      // DB에 avatar_url 즉시 저장
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ avatar_url: url, updated_at: new Date().toISOString() })
          .eq('id', user.id)
      }
    } catch (err) {
      console.error('아바타 업로드 실패:', err)
      setError('사진 업로드에 실패했어요. 다시 시도해 주세요.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('닉네임을 입력해 주세요.')
      return
    }
    if (displayName.trim().length < 2 || displayName.trim().length > 20) {
      setError('닉네임은 2~20자로 입력해 주세요.')
      return
    }
    if (selectedInstruments.length === 0) {
      setError('연주 악기를 최소 1개 선택해 주세요.')
      return
    }
    if (bio.length > 500) {
      setError('자기소개는 500자 이내로 입력해 주세요.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // 지역 ID 조회
      let regionId: string | undefined
      if (selectedRegion) {
        const { data: regionData } = await supabase
          .from('regions')
          .select('id')
          .eq('name', selectedRegion)
          .single()
        regionId = regionData?.id
      }

      await upsertProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        regionId,
      })

      // 악기 저장
      await upsertUserInstruments(
        selectedInstruments.map((name, idx) => ({
          name,
          skillLevel: primaryLevel,
          isPrimary: idx === 0,
        }))
      )

      // 단체 음악적 정체성 저장
      if (userType === 'organization') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && (preferredPeriods.length > 0 || preferredGenres.length > 0)) {
          await supabase
            .from('organization_music_preferences')
            .upsert({
              org_user_id: user.id,
              preferred_periods: preferredPeriods,
              preferred_genres: preferredGenres,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'org_user_id' })
        }
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '저장에 실패했습니다. 다시 시도해 주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '탈퇴') return
    setDeleteLoading(true)
    try {
      // 프로필 데이터 삭제 (cascade 또는 수동)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('user_instruments').delete().eq('user_id', user.id)
        await supabase.from('profiles').delete().eq('id', user.id)
      }
      // auth.users에서도 완전 삭제 (서버사이드)
      const res = await fetch('/api/auth/delete-account', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || '계정 삭제 실패')
      }
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (e) {
      console.error('탈퇴 실패:', e)
      setError('탈퇴 처리 중 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setDeleteLoading(false)
      setShowDeleteDialog(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white px-4 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-20">
        <h1 className="text-lg font-black text-gray-900">내 프로필</h1>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600">
          로그아웃
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}
        {success && (
          <div className="rounded-xl bg-green-50 p-3 text-sm text-green-600">✓ 프로필이 저장됐습니다!</div>
        )}

        {/* 아바타 — 이모지 선택 + 사진 업로드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <UserAvatar emoji={avatarEmoji} avatarUrl={avatarUrl} displayName={displayName} size="xl" />
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                </div>
              )}
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-sm text-indigo-600 hover:underline font-medium"
              >
                이모지 선택
              </button>
              <span className="text-gray-300">|</span>
              <label className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer font-medium">
                사진 업로드
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={avatarUploading}
                />
              </label>
            </div>
          </div>

          {/* 이모지 피커 */}
          {showEmojiPicker && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-500 mb-2">이모지 선택</p>
              <div className="grid grid-cols-5 gap-2">
                {AVATAR_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={async () => {
                      setAvatarEmoji(emoji)
                      setShowEmojiPicker(false)
                      // DB에 즉시 저장
                      const { data: { user } } = await supabase.auth.getUser()
                      if (user) {
                        await supabase
                          .from('user_profiles')
                          .update({ avatar_emoji: emoji, updated_at: new Date().toISOString() })
                          .eq('id', user.id)
                      }
                    }}
                    className={`w-full aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
                      avatarEmoji === emoji
                        ? 'bg-indigo-100 border-2 border-indigo-500 scale-110'
                        : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {avatarEmoji && (
                <button
                  type="button"
                  onClick={async () => {
                    setAvatarEmoji(null)
                    const { data: { user } } = await supabase.auth.getUser()
                    if (user) {
                      await supabase
                        .from('user_profiles')
                        .update({ avatar_emoji: null, updated_at: new Date().toISOString() })
                        .eq('id', user.id)
                    }
                  }}
                  className="mt-2 text-xs text-red-500 hover:underline"
                >
                  이모지 제거
                </button>
              )}
            </div>
          )}
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">기본 정보</h2>

          <Input
            label="닉네임"
            placeholder="활동명을 입력해 주세요"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">지역</label>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">지역 선택</option>
              {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">자기소개</label>
            <textarea
              placeholder="간단한 소개를 써주세요"
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{bio.length}/500</p>
          </div>
        </div>

        {/* 악기 선택 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">연주 악기</h2>
          <div className="flex flex-wrap gap-2">
            {INSTRUMENTS.map(instrument => (
              <button
                key={instrument}
                onClick={() => toggleInstrument(instrument)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedInstruments.includes(instrument)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {instrument}
              </button>
            ))}
          </div>
        </div>

        {/* 실력 레벨 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">실력 수준</h2>
          <div className="space-y-2">
            {LEVELS.map(level => (
              <button
                key={level.value}
                onClick={() => setPrimaryLevel(level.value)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${
                  primaryLevel === level.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="text-left">
                  <p className={`font-bold text-sm ${primaryLevel === level.value ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {level.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{level.desc}</p>
                </div>
                {primaryLevel === level.value && (
                  <span className="text-indigo-500 text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 매너온도 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-gray-900">매너온도</h2>
              <div className="group relative">
                <span className="text-gray-400 cursor-help text-sm">&#9432;</span>
                <div className="invisible group-hover:visible absolute left-0 top-6 z-10 w-56 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-lg">
                  협업 매너를 나타내는 지표입니다. 성공적인 협업과 좋은 리뷰를 통해 올라갑니다. 기본값 36.5°에서 시작합니다.
                </div>
              </div>
            </div>
            <span className={`text-2xl font-black ${
              mannerTemperature >= 40 ? 'text-orange-500' : mannerTemperature >= 37 ? 'text-green-500' : 'text-blue-500'
            }`}>{mannerTemperature.toFixed(1)}°</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 via-green-400 to-orange-500 rounded-full transition-all" style={{ width: `${Math.min(mannerTemperature, 100)}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">활동을 통해 매너온도가 올라가요</p>
        </div>

        {/* 음악적 정체성 (단체 전용) */}
        {userType === 'organization' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <div>
              <h2 className="font-bold text-gray-900">음악적 정체성</h2>
              <p className="text-xs text-gray-400 mt-0.5">단체의 음악적 방향성을 설정하면 더 정확한 매칭이 가능해요</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">선호 시대</label>
              <div className="flex flex-wrap gap-2">
                {PERIODS.map(p => (
                  <button
                    key={p.value}
                    onClick={() => togglePeriod(p.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      preferredPeriods.includes(p.value)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">주요 장르</label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(g => (
                  <button
                    key={g.value}
                    onClick={() => toggleGenre(g.value)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      preferredGenres.includes(g.value)
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 활동 통계 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">활동 통계</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-indigo-600">{activityStats.totalGigs}</p>
              <p className="text-xs text-gray-600 mt-1">올린 공고</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-purple-600">{activityStats.totalApplicationsSent}</p>
              <p className="text-xs text-gray-600 mt-1">보낸 지원</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-green-600">{activityStats.acceptedApplications}</p>
              <p className="text-xs text-gray-600 mt-1">수락된 지원</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-amber-600">{activityStats.reviews}</p>
              <p className="text-xs text-gray-600 mt-1">작성한 리뷰</p>
            </div>
          </div>
        </div>

        {/* 내가 올린 공고 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">내가 올린 공고</h2>
            <Link href="/gigs/new" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
              + 새 공고
            </Link>
          </div>
          {myGigs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">아직 올린 공고가 없어요</p>
          ) : (
            <div className="space-y-2">
              {myGigs.map(gig => (
                <Link key={gig.id} href={`/gigs/${gig.id}`} className="block p-3 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          gig.gig_type === 'hiring' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {gig.gig_type === 'hiring' ? '연주자 모집' : '팀 찾기'}
                        </span>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          gig.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {gig.status === 'active' ? '진행중' : gig.status === 'closed' ? '마감' : gig.status === 'expired' ? '만료' : '일시중지'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{gig.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        👁 {gig.view_count} · {new Date(gig.created_at).toLocaleDateString('ko-KR')}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <Button onClick={handleSave} size="full" isLoading={loading} className="bg-indigo-600 hover:bg-indigo-700">
          저장하기
        </Button>

        {/* 계정 삭제 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-2">계정 관리</h2>
          <p className="text-xs text-gray-500 mb-3">
            탈퇴 시 모든 개인정보와 활동 데이터가 삭제되며 복구할 수 없습니다.
          </p>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="text-sm text-red-500 hover:text-red-700 font-medium"
          >
            회원 탈퇴
          </button>
        </div>

        {/* 개인정보처리방침 링크 */}
        <div className="text-center pb-4 space-x-3">
          <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600 underline">
            이용약관
          </Link>
          <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600 underline">
            개인정보처리방침
          </Link>
        </div>
      </main>

      {/* 탈퇴 확인 다이얼로그 */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">정말 탈퇴하시겠습니까?</h3>
            <p className="text-sm text-gray-500 mb-4">
              탈퇴하면 모든 프로필 정보, 공고, 지원 내역이 삭제됩니다.
              확인을 위해 아래에 <strong>&ldquo;탈퇴&rdquo;</strong>를 입력해 주세요.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="탈퇴"
              className="w-full h-10 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowDeleteDialog(false); setDeleteConfirmText('') }}
                className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== '탈퇴' || deleteLoading}
                className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleteLoading ? '처리 중...' : '탈퇴하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
