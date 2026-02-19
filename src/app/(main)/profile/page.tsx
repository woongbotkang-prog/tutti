'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { fetchMyProfile, upsertProfile, upsertUserInstruments, fetchMyGigs } from '@/lib/supabase/queries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SkillLevel } from '@/types'

const INSTRUMENTS = ['바이올린', '비올라', '첼로', '콘트라베이스', '플루트', '오보에', '클라리넷', '바순', '호른', '트럼펫', '트롬본', '튜바', '피아노', '하프', '타악기']
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
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
  // 기존 프로필 불러오기
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchMyProfile()
        if (profile) {
          setDisplayName(profile.display_name || '')
          setBio(profile.bio || '')
          setMannerTemperature(profile.manner_temperature || 36.5)
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
    loadProfile()
    loadMyGigs()
  }, [])

  const toggleInstrument = (instrument: string) => {
    setSelectedInstruments(prev =>
      prev.includes(instrument)
        ? prev.filter(i => i !== instrument)
        : [...prev, instrument]
    )
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

        {/* 아바타 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-3xl">
            🎻
          </div>
          <span className="text-sm text-gray-400">사진 변경 (준비 중)</span>
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
            <h2 className="font-bold text-gray-900">매너온도</h2>
            <span className="text-2xl font-black text-orange-500">{mannerTemperature.toFixed(1)}°</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-400 via-green-400 to-orange-500 rounded-full" style={{ width: `${mannerTemperature}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">활동을 통해 매너온도가 올라가요 🌡️</p>
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
                          gig.gig_type === 'hiring' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {gig.gig_type === 'hiring' ? '모집' : '팀 찾기'}
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
