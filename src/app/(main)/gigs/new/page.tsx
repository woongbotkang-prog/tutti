'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AddPieceModal from '@/components/AddPieceModal'
import GigImageUpload from '@/components/GigImageUpload'
import type { SkillLevel } from '@/types'

const INSTRUMENTS = ['바이올린', '비올라', '첼로', '콘트라베이스', '플루트', '오보에', '클라리넷', '바순', '호른', '트럼펫', '트롬본', '튜바', '피아노', '하프', '타악기']
const REGIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
const LEVELS: { value: SkillLevel; label: string; desc: string }[] = [
  { value: 'beginner', label: '입문', desc: '악기를 시작한 지 얼마 안 된 단계' },
  { value: 'elementary', label: '초급', desc: '기본기를 갖추고 간단한 곡 연주 가능' },
  { value: 'intermediate', label: '중급', desc: '앙상블 경험이 있고 중급 레퍼토리 소화 가능' },
  { value: 'advanced', label: '고급', desc: '음대 수준의 실력, 오케스트라 경험 다수' },
  { value: 'professional', label: '전문가', desc: '전문 연주자급, 풍부한 무대 경력 보유' },
]
const REHEARSAL_FREQUENCIES = ['주 1회', '주 2~3회', '주 4회 이상', '격주', '월 1~2회', '수시', '미정']

type PieceEntry = {
  piece_id?: string
  text_input: string
  composer_name?: string
  period?: string
}

export default function NewGigPage() {
  const router = useRouter()
  const supabase = createClient()

  // 곡 선택
  const [pieces, setPieces] = useState<PieceEntry[]>([])
  const [showPieceModal, setShowPieceModal] = useState(false)

  // 기본 정보
  const [ensembleName, setEnsembleName] = useState('')
  const [selectedInstruments, setSelectedInstruments] = useState<Record<string, number>>({})
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [minLevel, setMinLevel] = useState<SkillLevel>('beginner')

  // 연습 일정
  const [rehearsalFrequency, setRehearsalFrequency] = useState('')
  const [eventDate, setEventDate] = useState('')

  // 기타
  const [sheetMusicProvided, setSheetMusicProvided] = useState(false)
  const [description, setDescription] = useState('')
  const [gigImages, setGigImages] = useState<string[]>([])
  const [photoTermsAgreed, setPhotoTermsAgreed] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleInstrument = (i: string) =>
    setSelectedInstruments(p => {
      if (i in p) {
        const next = { ...p }
        delete next[i]
        return next
      }
      return { ...p, [i]: 1 }
    })

  const setInstrumentCount = (i: string, count: number) =>
    setSelectedInstruments(p => ({ ...p, [i]: Math.max(1, Math.min(50, count)) }))

  const totalMembers = Object.values(selectedInstruments).reduce((sum, n) => sum + n, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    // 유효성 검사
    if (pieces.length === 0) return setError('곡을 하나 이상 선택해 주세요.')
    if (!ensembleName.trim()) return setError('단체명 또는 프로젝트명을 입력해 주세요.')
    if (Object.keys(selectedInstruments).length === 0) return setError('악기를 하나 이상 선택해 주세요.')
    if (selectedRegions.length === 0) return setError('지역을 하나 이상 선택해 주세요.')

    setIsLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // 지역 ID 조회
    const { data: regionData } = await supabase
      .from('regions')
      .select('id')
      .in('name', selectedRegions)

    const regionIds = (regionData || []).map(r => r.id)

    const gigCategory = totalMembers >= 7 ? 'orchestra' : 'chamber'
    const autoTitle = `${pieces[0].text_input} — ${ensembleName.trim()}`

    const { data: gig, error: gigError } = await supabase
      .from('gigs')
      .insert({
        user_id: user.id,
        gig_type: null,
        title: autoTitle,
        ensemble_name: ensembleName.trim(),
        gig_category: gigCategory,
        description: description.trim() || null,
        region_id: regionIds[0] || null,
        min_skill_level: minLevel,
        is_paid: false,
        is_project: true,
        max_applicants: totalMembers || 1,
        event_date: eventDate || null,
        status: 'active',
        image_urls: gigImages.length > 0 ? gigImages : [],
        rehearsal_frequency: rehearsalFrequency || null,
        sheet_music_provided: sheetMusicProvided,
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
    const instrumentNames = Object.keys(selectedInstruments)
    if (gig && instrumentNames.length > 0) {
      const { data: instrumentData } = await supabase
        .from('instruments')
        .select('id, name')
        .in('name', instrumentNames)

      if (instrumentData && instrumentData.length > 0) {
        await supabase.from('gig_instruments').insert(
          instrumentData.map(inst => ({
            gig_id: gig.id,
            instrument_id: inst.id,
            count_needed: selectedInstruments[inst.name] || 1,
          }))
        )
      }
    }

    // 곡 연결 (필수, 최소 1곡)
    if (gig && pieces.length > 0) {
      await supabase.from('gig_pieces').insert(
        pieces.map((p, idx) => ({
          gig_id: gig.id,
          piece_id: p.piece_id || null,
          text_input: p.text_input,
          order_index: idx,
        }))
      )
    }

    router.push(`/gigs/${gig!.id}`)
  }

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* 헤더 */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-20">
        <Link href="/gigs">
          <button className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </Link>
        <h1 className="font-bold text-ink">공고 등록</h1>
      </header>

      <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
        )}

        {/* ── 1. 곡 선택 섹션 (최상단, 필수) ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold text-ink">
              🎼 연주할 곡 <span className="text-red-500">*</span>
            </h2>
            {pieces.length > 0 && (
              <span className="text-xs text-accent font-bold">{pieces.length}곡 선택됨</span>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-4">하고 싶은 곡을 선택하면 팀원을 모집할 수 있어요</p>

          {/* 선택된 곡 목록 (sticky 느낌으로 상단 배치) */}
          {pieces.length > 0 && (
            <div className="mb-4 space-y-2">
              {pieces.map((piece, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-cream border-2 border-accent rounded-xl">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{piece.text_input}</p>
                      {piece.composer_name && (
                        <p className="text-xs text-gray-500">{piece.composer_name}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-accent bg-white px-2 py-0.5 rounded-full shrink-0">선택됨</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPieces(pieces.filter((_, i) => i !== idx))}
                    className="ml-3 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPieceModal(true)}
            className={`w-full px-4 py-3 rounded-xl border-2 font-medium text-sm transition-colors ${
              pieces.length > 0
                ? 'border-accent/30 bg-cream text-accent hover:bg-cream'
                : 'border-dashed border-gray-300 text-gray-500 hover:border-accent hover:text-accent'
            }`}
          >
            {pieces.length > 0 ? '+ 곡 추가 / 수정' : '+ 곡 선택하기'}
          </button>
        </div>

        <AddPieceModal
          isOpen={showPieceModal}
          onClose={() => setShowPieceModal(false)}
          pieces={pieces}
          onPiecesChange={setPieces}
        />

        {/* ── 2. 기본 정보 섹션 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-5">
          <h2 className="font-bold text-ink">기본 정보</h2>

          {/* 단체명 / 프로젝트명 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              단체명 / 프로젝트명 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="예: ○○앙상블, 브람스 트리오 프로젝트"
              value={ensembleName}
              onChange={e => setEnsembleName(e.target.value)}
            />
            {pieces.length > 0 && ensembleName.trim() && (
              <p className="mt-1.5 text-xs text-gray-400">
                자동 제목: <span className="text-accent font-medium">{pieces[0].text_input} — {ensembleName.trim()}</span>
              </p>
            )}
          </div>

          {/* 악기 + 파트별 인원 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-0.5">
              악기 / 파트별 모집인원 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">악기를 선택하면 파트별 모집 인원을 설정할 수 있어요</p>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTS.map(inst => (
                <button
                  key={inst}
                  type="button"
                  onClick={() => toggleInstrument(inst)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    inst in selectedInstruments
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-accent/50'
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>

            {Object.keys(selectedInstruments).length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-500">파트별 모집 인원</p>
                {Object.entries(selectedInstruments).map(([inst, count]) => (
                  <div key={inst} className="flex items-center justify-between py-2 px-3 bg-cream rounded-xl">
                    <span className="text-sm font-medium text-accent">{inst}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setInstrumentCount(inst, count - 1)}
                        className="w-7 h-7 rounded-full bg-white border border-gray-200 text-ink font-bold text-sm flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold text-ink w-6 text-center">{count}</span>
                      <button
                        type="button"
                        onClick={() => setInstrumentCount(inst, count + 1)}
                        className="w-7 h-7 rounded-full bg-white border border-gray-200 text-ink font-bold text-sm flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="text-xs text-gray-400">명</span>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-accent font-bold bg-cream rounded-xl px-4 py-2.5">
                  총 모집: {totalMembers}명 → {totalMembers >= 7 ? '오케스트라' : '실내악'} 카테고리
                </p>
              </div>
            )}
          </div>

          {/* 지역 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-0.5">
              지역 <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-400 mb-2">복수 선택 가능</p>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRegions(prev =>
                    prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
                  )}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selectedRegions.includes(r)
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-accent/50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 실력 수준 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              최소 실력 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map(l => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setMinLevel(l.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    minLevel === l.value
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-accent/50'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              {LEVELS.find(l => l.value === minLevel)?.desc}
            </p>
          </div>

          {/* 연습 일정 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">연습 일정 (선택)</label>
            <p className="text-xs text-gray-400 mb-2">연습 빈도</p>
            <div className="flex flex-wrap gap-2">
              {REHEARSAL_FREQUENCIES.map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setRehearsalFrequency(prev => prev === freq ? '' : freq)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    rehearsalFrequency === freq
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-accent/50'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <label className="text-xs text-gray-500 block mb-1">연주 날짜 (선택)</label>
              <Input
                type="date"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* 악보 제공 여부 */}
          <div>
            <button
              type="button"
              onClick={() => setSheetMusicProvided(p => !p)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl border-2 transition-colors ${
                sheetMusicProvided ? 'border-accent bg-cream' : 'border-gray-100 bg-gray-50'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${sheetMusicProvided ? 'bg-ink' : 'bg-white border border-gray-300'}`}>
                {sheetMusicProvided && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </div>
              <span className={`text-sm font-medium ${sheetMusicProvided ? 'text-accent' : 'text-gray-600'}`}>
                악보 제공
              </span>
            </button>
          </div>

          {/* 상세 내용 */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">상세 내용 (선택)</label>
            <textarea
              placeholder="연습 장소, 모집 요건, 기타 안내사항을 자유롭게 써주세요"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={5}
              maxLength={2000}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{description.length}/2000</p>
          </div>
        </div>

        {/* ── 3. 사진 첨부 ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <GigImageUpload images={gigImages} onChange={setGigImages} maxImages={3} maxSizeMB={10} />
        </div>

        {/* 사진 업로드 시 저작권·초상권 동의 */}
        {gigImages.length > 0 && (
          <label className="flex items-center gap-2 cursor-pointer px-1">
            <input
              type="checkbox"
              checked={photoTermsAgreed}
              onChange={e => setPhotoTermsAgreed(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 accent-accent"
            />
            <span className="text-sm text-gray-600">
              사진 업로드 시 저작권·초상권 관련 안내를 확인했으며, 이에 동의합니다.
            </span>
          </label>
        )}

        {/* ── 등록 버튼 ── */}
        <Button
          type="submit"
          size="full"
          isLoading={isLoading}
          disabled={isLoading || (gigImages.length > 0 && !photoTermsAgreed)}
          className="bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          공고 등록하기
        </Button>
      </form>
    </div>
  )
}
