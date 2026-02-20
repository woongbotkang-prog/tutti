'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserType, SkillLevel } from '@/types'

const INSTRUMENTS = [
  '바이올린', '비올라', '첼로', '콘트라베이스',
  '플루트', '오보에', '클라리넷', '바순',
  '호른', '트럼펫', '트롬본', '튜바',
  '피아노', '하프', '타악기',
]

const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '대전', '광주',
  '울산', '세종', '강원', '충북', '충남', '전북', '전남',
  '경북', '경남', '제주',
]

const LEVELS: { value: SkillLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: '입문', desc: '취미로 시작한 지 얼마 안 됨' },
  { value: 'elementary', label: '초급', desc: '기초 곡 연주 가능' },
  { value: 'intermediate', label: '중급', desc: '오케스트라 참여 가능' },
  { value: 'advanced', label: '고급', desc: '독주회 수준' },
  { value: 'professional', label: '전문가', desc: '음대 졸업 이상' },
]

const PERIODS = [
  { value: 'baroque', label: '바로크' },
  { value: 'classical', label: '고전' },
  { value: 'romantic', label: '낭만' },
  { value: 'modern', label: '근현대' },
  { value: 'contemporary', label: '현대' },
]

const GENRES = [
  { value: 'orchestral', label: '오케스트라' },
  { value: 'chamber', label: '실내악' },
  { value: 'solo', label: '독주' },
  { value: 'opera', label: '오페라' },
  { value: 'choral', label: '합창' },
]

type IndividualStep = 'type-instrument' | 'level' | 'profile'
type OrganizationStep = 'type' | 'profile' | 'music-identity'
type Step = IndividualStep | OrganizationStep

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('type-instrument')
  const [userType, setUserType] = useState<UserType | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('intermediate')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([])
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // 인증 확인 & 기존 프로필 체크
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      // 기존 메타데이터에서 display_name 가져오기
      const meta = user.user_metadata
      if (meta?.display_name) setDisplayName(meta.display_name)
      if (meta?.user_type) {
        setUserType(meta.user_type as UserType)
        // 이미 타입이 있으면 다음 단계로
        if (meta.user_type === 'organization') {
          setStep('profile')
        } else {
          setStep('level')
        }
      }

      // 이미 완성된 프로필이 있으면 홈으로
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, user_type, display_name')
        .eq('id', user.id)
        .single()

      if (profile?.user_type && profile?.display_name) {
        // 이미 프로필 있는 기존 사용자 — 프로필 이미 있으면 홈으로
        const { count } = await supabase
          .from('user_instruments')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        if ((count ?? 0) > 0 || profile.user_type === 'organization') {
          router.push('/gigs')
          return
        }
      }

      setCheckingAuth(false)
    }
    check()
  }, [supabase, router])

  const toggleInstrument = (name: string) => {
    setSelectedInstruments(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    )
  }

  const togglePeriod = (value: string) => {
    setSelectedPeriods(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const toggleGenre = (value: string) => {
    setSelectedGenres(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  const handleComplete = async () => {
    if (!userType) return
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다.')

      const finalName = displayName.trim() || user.user_metadata?.display_name || user.email?.split('@')[0] || '사용자'

      // 지역 ID 조회
      let regionId: string | null = null
      if (selectedRegion) {
        const { data: regionData } = await supabase
          .from('regions')
          .select('id')
          .eq('name', selectedRegion)
          .single()
        regionId = regionData?.id ?? null
      }

      // 프로필 upsert
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          user_type: userType,
          display_name: finalName,
          region_id: regionId,
          updated_at: new Date().toISOString(),
        })

      if (profileError) throw profileError

      // 개인 연주자인 경우 악기 저장
      if (userType === 'individual' && selectedInstruments.length > 0) {
        // 기존 악기 삭제
        await supabase.from('user_instruments').delete().eq('user_id', user.id)

        // 악기 ID 조회
        const { data: instrumentRows } = await supabase
          .from('instruments')
          .select('id, name')
          .in('name', selectedInstruments)

        if (instrumentRows && instrumentRows.length > 0) {
          await supabase.from('user_instruments').insert(
            instrumentRows.map((inst, idx) => ({
              user_id: user.id,
              instrument_id: inst.id,
              skill_level: skillLevel,
              is_primary: idx === 0,
            }))
          )
        }
      }

      // 단체인 경우 음악적 정체성 저장 (선택적)
      if (userType === 'organization' && (selectedPeriods.length > 0 || selectedGenres.length > 0)) {
        const { error: musicPrefError } = await supabase
          .from('organization_music_preferences')
          .upsert({
            organization_id: user.id,
            preferred_periods: selectedPeriods.length > 0 ? selectedPeriods : null,
            preferred_genres: selectedGenres.length > 0 ? selectedGenres : null,
            updated_at: new Date().toISOString(),
          })

        if (musicPrefError) throw musicPrefError
      }

      router.push('/gigs')
    } catch (e) {
      console.error('온보딩 오류:', e)
      setError(e instanceof Error ? e.message : '저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  // Calculate step number and total steps
  let stepNumber = 1
  let totalSteps = 3

  if (userType === 'individual') {
    if (step === 'type-instrument') stepNumber = 1
    else if (step === 'level') stepNumber = 2
    else if (step === 'profile') stepNumber = 3
  } else if (userType === 'organization') {
    if (step === 'type') stepNumber = 1
    else if (step === 'profile') stepNumber = 2
    else if (step === 'music-identity') stepNumber = 3
  } else {
    // Before selecting type
    stepNumber = 1
    totalSteps = 3
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col">
      {/* 헤더 */}
      <header className="px-6 py-5 flex items-center justify-between">
        <span className="text-2xl font-black text-indigo-600 tracking-tight">TUTTI</span>
        <span className="text-sm text-gray-400">{stepNumber}/{totalSteps}</span>
      </header>

      {/* 프로그레스 바 */}
      <div className="px-6">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <main className="flex-1 flex items-start justify-center px-4 pt-8 pb-12">
        <div className="w-full max-w-md space-y-6">

          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {/* Individual: Step 1 - Type + Instruments Combined */}
          {step === 'type-instrument' && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-black text-gray-900">어떤 역할로 참여하시나요?</h1>
                <p className="text-sm text-gray-500 mt-2">나중에 변경할 수 있어요</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setUserType('individual'); setStep('level') }}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                >
                  <span className="text-5xl">🎻</span>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 group-hover:text-indigo-700">개인 연주자</p>
                    <p className="text-xs text-gray-500 mt-1">솔로이스트, 앙상블 멤버</p>
                  </div>
                </button>

                <button
                  onClick={() => { setUserType('organization'); setStep('profile') }}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                >
                  <span className="text-5xl">🎼</span>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 group-hover:text-indigo-700">단체</p>
                    <p className="text-xs text-gray-500 mt-1">오케스트라, 실내악단</p>
                  </div>
                </button>
              </div>

              {userType === 'individual' && (
                <div className="border-t-2 border-gray-100 pt-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">어떤 악기를 연주하시나요?</h2>
                    <p className="text-sm text-gray-500 mt-1">여러 개 선택 가능해요</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {INSTRUMENTS.map(inst => (
                      <button
                        key={inst}
                        onClick={() => toggleInstrument(inst)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                          selectedInstruments.includes(inst)
                            ? 'bg-indigo-600 text-white border-indigo-600 scale-105'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {inst}
                      </button>
                    ))}
                  </div>

                  <Button
                    onClick={() => setStep('level')}
                    disabled={selectedInstruments.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40"
                  >
                    악기 선택 완료
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Individual: Step 2 - Skill Level */}
          {step === 'level' && userType === 'individual' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900">실력 수준을 알려주세요</h1>
                <p className="text-sm text-gray-500 mt-2">적절한 매칭을 위해 필요해요</p>
              </div>

              <div className="space-y-2">
                {LEVELS.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setSkillLevel(level.value)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all ${
                      skillLevel === level.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="text-left">
                      <p className={`font-bold text-sm ${skillLevel === level.value ? 'text-indigo-700' : 'text-gray-900'}`}>
                        {level.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{level.desc}</p>
                    </div>
                    {skillLevel === level.value && (
                      <span className="text-indigo-500 text-lg">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('type-instrument')}
                  className="flex-1"
                >
                  이전
                </Button>
                <Button
                  onClick={() => setStep('profile')}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  다음
                </Button>
              </div>
            </div>
          )}

          {/* Individual: Step 3 - Profile (Nickname + Region) */}
          {step === 'profile' && userType === 'individual' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900">마지막 정보예요!</h1>
                <p className="text-sm text-gray-500 mt-2">닉네임과 활동 지역을 알려주세요</p>
              </div>

              <Input
                label="닉네임"
                placeholder="활동명 또는 닉네임"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">활동 지역</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => setSelectedRegion(prev => prev === r ? '' : r)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        selectedRegion === r
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('level')}
                  className="flex-1"
                >
                  이전
                </Button>
                <Button
                  onClick={handleComplete}
                  isLoading={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  시작하기 🎵
                </Button>
              </div>
            </div>
          )}

          {/* Organization: Step 1 - Type Selection */}
          {step === 'type' && userType === 'organization' && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-black text-gray-900">어떤 역할로 참여하시나요?</h1>
                <p className="text-sm text-gray-500 mt-2">나중에 변경할 수 있어요</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setUserType('individual'); setStep('type-instrument') }}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-400 hover:bg-indigo-50 transition-all group"
                >
                  <span className="text-5xl">🎻</span>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 group-hover:text-indigo-700">개인 연주자</p>
                    <p className="text-xs text-gray-500 mt-1">솔로이스트, 앙상블 멤버</p>
                  </div>
                </button>

                <button
                  onClick={() => { setUserType('organization'); setStep('profile') }}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-indigo-400 bg-indigo-50 transition-all group"
                >
                  <span className="text-5xl">🎼</span>
                  <div className="text-center">
                    <p className="font-bold text-gray-900 text-indigo-700">단체</p>
                    <p className="text-xs text-gray-500 mt-1">오케스트라, 실내악단</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Organization: Step 2 - Profile (Name + Region) */}
          {step === 'profile' && userType === 'organization' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900">단체 정보를 알려주세요</h1>
                <p className="text-sm text-gray-500 mt-2">단체명과 활동 지역</p>
              </div>

              <Input
                label="단체명"
                placeholder="단체 이름"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">활동 지역</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(r => (
                    <button
                      key={r}
                      onClick={() => setSelectedRegion(prev => prev === r ? '' : r)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                        selectedRegion === r
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('type')}
                  className="flex-1"
                >
                  이전
                </Button>
                <Button
                  onClick={() => setStep('music-identity')}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  다음
                </Button>
              </div>
            </div>
          )}

          {/* Organization: Step 3 - Music Identity (Optional) */}
          {step === 'music-identity' && userType === 'organization' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-black text-gray-900">음악적 정체성</h1>
                <p className="text-sm text-gray-500 mt-2">선택사항입니다. 선호 시대와 장르를 선택해주세요</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">선호 시대</label>
                <div className="flex flex-wrap gap-2">
                  {PERIODS.map(period => (
                    <button
                      key={period.value}
                      onClick={() => togglePeriod(period.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                        selectedPeriods.includes(period.value)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">주요 장르</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(genre => (
                    <button
                      key={genre.value}
                      onClick={() => toggleGenre(genre.value)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                        selectedGenres.includes(genre.value)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      {genre.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('profile')}
                  className="flex-1"
                >
                  이전
                </Button>
                <Button
                  onClick={handleComplete}
                  isLoading={isLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  시작하기 🎵
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
