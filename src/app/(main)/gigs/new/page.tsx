'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { GigType, SkillLevel } from '@/types'

const INSTRUMENTS = ['바이올린', '비올라', '첼로', '콘트라베이스', '플루트', '오보에', '클라리넷', '바순', '호른', '트럼펫', '트롬본', '튜바', '피아노', '하프', '타악기']
const REGIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
const LEVELS: { value: SkillLevel; label: string }[] = [
  { value: 'beginner', label: '입문' },
  { value: 'elementary', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
  { value: 'professional', label: '전문가' },
]

export default function NewGigPage() {
  const router = useRouter()
  const supabase = createClient()

  const [gigType, setGigType] = useState<GigType>('hiring')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [minLevel, setMinLevel] = useState<SkillLevel>('beginner')
  const [isPaid, setIsPaid] = useState(false)
  const [eventDate, setEventDate] = useState('')
  const [maxApplicants, setMaxApplicants] = useState('1')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleInstrument = (i: string) =>
    setSelectedInstruments(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    if (!title.trim()) return setError('제목을 입력해 주세요.')
    if (selectedInstruments.length === 0) return setError('악기를 하나 이상 선택해 주세요.')
    if (!selectedRegion) return setError('지역을 선택해 주세요.')

    setIsLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // 지역 ID 조회
    const { data: regionData } = await supabase
      .from('regions')
      .select('id')
      .eq('name', selectedRegion)
      .single()

    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .insert({
        user_id: user.id,
        gig_type: gigType,
        title: title.trim(),
        description: description.trim() || null,
        region_id: regionData?.id || null,
        min_skill_level: minLevel,
        is_paid: isPaid,
        max_applicants: parseInt(maxApplicants) || 1,
        event_date: eventDate || null,
        status: 'active',
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id')
      .single()

    if (gigError) {
      setError('공고 등록에 실패했습니다. 다시 시도해 주세요.')
      setIsLoading(false)
      return
    }

    // 악기 연결
    if (gig && selectedInstruments.length > 0) {
      const { data: instrumentData } = await supabase
        .from('instruments')
        .select('id, name')
        .in('name', selectedInstruments)

      if (instrumentData && instrumentData.length > 0) {
        await supabase.from('gig_instruments').insert(
          instrumentData.map(inst => ({
            gig_id: gig.id,
            instrument_id: inst.id,
            count_needed: 1,
          }))
        )
      }
    }

    router.push(`/gigs/${gig!.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-20">
        <Link href="/gigs">
          <button className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </Link>
        <h1 className="font-bold text-gray-900">공고 등록</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* 공고 유형 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">공고 유형</h2>
          <div className="grid grid-cols-2 gap-3">
            {([['hiring', '구인', '단원/연주자 모집'], ['seeking', '구직', '팀/오케스트라 찾기']] as const).map(([val, label, desc]) => (
              <button
                key={val}
                type="button"
                onClick={() => setGigType(val)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  gigType === val ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100'
                }`}
              >
                <p className={`font-bold text-sm ${gigType === val ? 'text-indigo-700' : 'text-gray-900'}`}>{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">기본 정보</h2>
          <Input
            label="제목"
            placeholder="예: 바이올린 2파트 단원 모집"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">상세 내용</label>
            <textarea
              placeholder="연습 일정, 모집 요건, 레퍼토리 등을 자세히 써주세요"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* 악기 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-3">악기 <span className="text-red-500">*</span></h2>
          <div className="flex flex-wrap gap-2">
            {INSTRUMENTS.map(inst => (
              <button
                key={inst}
                type="button"
                onClick={() => toggleInstrument(inst)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  selectedInstruments.includes(inst)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {inst}
              </button>
            ))}
          </div>
        </div>

        {/* 조건 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          <h2 className="font-bold text-gray-900">모집 조건</h2>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">지역 <span className="text-red-500">*</span></label>
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="w-full h-11 rounded-xl border border-gray-200 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">지역 선택</option>
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">최소 실력</label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setMinLevel(l.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    minLevel === l.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">유급 여부</p>
              <p className="text-xs text-gray-400">연주비 지급 여부</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPaid(p => !p)}
              className={`w-12 h-6 rounded-full transition-colors ${isPaid ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${isPaid ? 'translate-x-6' : ''}`} />
            </button>
          </div>
          <Input
            type="number"
            label="모집 인원"
            placeholder="1"
            value={maxApplicants}
            onChange={e => setMaxApplicants(e.target.value)}
            min="1"
            max="50"
          />
          <Input
            type="date"
            label="연주 날짜 (선택)"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
          />
        </div>

        <Button type="submit" size="full" isLoading={isLoading} className="bg-indigo-600 hover:bg-indigo-700">
          공고 등록하기
        </Button>
      </form>
    </div>
  )
}
