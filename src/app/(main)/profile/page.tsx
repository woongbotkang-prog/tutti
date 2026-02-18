'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { fetchMyProfile, upsertProfile } from '@/lib/supabase/queries'
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
        }
      } catch (e) {
        console.error('프로필 불러오기 실패:', e)
      } finally {
        setInitialLoading(false)
      }
    }
    loadProfile()
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
          <button className="text-sm text-indigo-600 font-medium">사진 변경</button>
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
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
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

        <Button onClick={handleSave} size="full" isLoading={loading} className="bg-indigo-600 hover:bg-indigo-700">
          저장하기
        </Button>
      </main>
    </div>
  )
}
