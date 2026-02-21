'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { fetchGigs, type GigListItem, type SortOption } from '@/lib/supabase/queries'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ── 상수 ──────────────────────────────────────────────────────
const INSTRUMENTS = [
  '전체', '바이올린', '비올라', '첼로', '콘트라베이스',
  '플루트', '오보에', '클라리넷', '바순', '호른',
  '트럼펫', '트롬본', '피아노', '타악기',
]
const REGIONS = ['전체', '서울', '경기', '인천', '부산', '대구', '대전', '광주', '기타']

const PERIODS = ['전체', 'baroque', 'classical', 'romantic', 'modern', 'contemporary']
const PERIOD_LABELS: Record<string, string> = {
  '전체': '전체',
  'baroque': '바로크',
  'classical': '고전',
  'romantic': '낭만',
  'modern': '근현대',
  'contemporary': '현대',
}

const SKILL_LEVELS = ['전체', 'beginner', 'elementary', 'intermediate', 'advanced', 'professional']
const LEVEL_LABELS: Record<string, string> = {
  'beginner': '입문',
  'elementary': '초급',
  'intermediate': '중급',
  'advanced': '고급',
  'professional': '전문가',
}

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'latest',   label: '최신순' },
  { key: 'expiring', label: '마감임박' },
  { key: 'popular',  label: '인기순' },
]

const PAGE_SIZE = 10

// ── 스켈레톤 카드 ──────────────────────────────────────────────
function GigCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-10 rounded-full" />
        <Skeleton className="h-5 w-8 rounded-full" />
        <div className="flex-1" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

// ── 앙상블 유형 추정 ──────────────────────────────────────────
function getEnsembleType(instrumentCount: number): string {
  if (instrumentCount <= 1) return '독주'
  if (instrumentCount === 2) return '듀오'
  if (instrumentCount === 3) return '삼중주'
  if (instrumentCount <= 6) return '실내악'
  return '오케스트라'
}

// ── 공고 카드 ──────────────────────────────────────────────────
function GigCard({ gig }: { gig: GigListItem }) {
  const instruments = gig.instruments?.map(i => i.instrument?.name).filter(Boolean) as string[] || []

  const daysLeft = gig.expires_at
    ? Math.ceil((new Date(gig.expires_at).getTime() - Date.now()) / 86_400_000)
    : null

  const isClosed = gig.status === 'closed' || gig.status === 'expired'
  const isExpired = isClosed || (daysLeft !== null && daysLeft < 0)

  // gig_pieces에서 곡/작곡가 정보 추출
  const firstPiece = gig.gig_pieces?.[0]?.piece
  const pieceTitle = firstPiece?.title || gig.piece_name || gig.title
  const pieceAltTitle = firstPiece?.alternative_titles?.[0] || null
  const composerName = firstPiece?.composer?.name_en || firstPiece?.composer?.name || null
  const ensembleType = getEnsembleType(instruments.length)

  return (
    <Link href={`/gigs/${gig.id}`}>
      <div className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-cream-dark transition-all active:scale-[0.99] ${isExpired ? 'opacity-50' : ''}`}>
        {/* 상단: 작곡가 좌, 유형 우 */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 tracking-wide">
            {composerName || ''}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cream text-accent">
            {gig.is_project ? '프로젝트' : ensembleType}
          </span>
        </div>

        {/* 곡 제목 (한국어 — 메인) */}
        <h3 className="text-[16px] font-bold text-gray-900 leading-snug mb-0.5">
          {pieceTitle}
        </h3>

        {/* 영어 제목 */}
        {pieceAltTitle && (
          <p className="text-xs text-gray-400 mb-2">{pieceAltTitle}</p>
        )}

        {/* 지역 · 마감 · 작성자 */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2.5 mt-2">
          <span>{gig.region?.name || '지역미정'}</span>
          {daysLeft !== null && !isExpired && (
            <>
              <span>·</span>
              <span className={daysLeft <= 7 ? 'text-red-500 font-semibold' : ''}>
                D-{daysLeft}
              </span>
            </>
          )}
          {isExpired && (
            <>
              <span>·</span>
              <span className="text-gray-400">마감</span>
            </>
          )}
          {gig.author?.display_name && (
            <>
              <span className="ml-auto text-gray-400">by {gig.author.display_name}</span>
            </>
          )}
        </div>

        {/* 모집 악기 칩 */}
        {instruments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {instruments.map((name, i) => (
              <span
                key={i}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
              >
                {name} 구함
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

// ── 메인 페이지 ────────────────────────────────────────────────
export default function GigsPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <GigsPage />
    </Suspense>
  )
}

function GigsPage() {
  const searchParamsHook = useSearchParams()

  const [activeTab, setActiveTab]             = useState<'all' | 'hiring' | 'seeking' | 'project'>('all')
  const [selectedInstrument, setSelectedInstrument] = useState('전체')
  const [selectedRegion, setSelectedRegion]   = useState('전체')
  const [selectedPeriod, setSelectedPeriod]   = useState('전체')
  const [selectedLevel, setSelectedLevel]     = useState('전체')
  const [sortBy, setSortBy]                   = useState<SortOption>('latest')
  const [searchQuery, setSearchQuery]         = useState(() => searchParamsHook.get('search') || '')
  const [searchInput, setSearchInput]         = useState(() => searchParamsHook.get('search') || '')

  const [gigs, setGigs]       = useState<GigListItem[]>([])
  const [page, setPage]       = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── 검색어 디바운스 ───────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value)
    }, 400)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  // ── 데이터 로드 (첫 페이지 — 필터 변경 시 초기화) ─────────────
  const loadInitial = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchGigs({
        gigType: activeTab === 'project' ? undefined : (activeTab !== 'all' ? activeTab : undefined),
        isProject: activeTab === 'project' ? true : (activeTab === 'hiring' || activeTab === 'seeking') ? false : undefined,
        instrumentName: selectedInstrument,
        regionName: selectedRegion,
        period: selectedPeriod !== '전체' ? selectedPeriod : undefined,
        minSkillLevel: selectedLevel !== '전체' ? selectedLevel : undefined,
        searchQuery,
        sortBy,
        page: 0,
        limit: PAGE_SIZE,
        includeExpired: true,
      })
      setGigs(result.data)
      setHasMore(result.hasMore)
      setPage(0)
    } catch (e) {
      console.error('fetchGigs error:', e)
      setError('공고를 불러오는 데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [activeTab, selectedInstrument, selectedRegion, selectedPeriod, selectedLevel, searchQuery, sortBy])

  // ── 더보기 ────────────────────────────────────────────────────
  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    const nextPage = page + 1
    try {
      const result = await fetchGigs({
        gigType: activeTab === 'project' ? undefined : (activeTab !== 'all' ? activeTab : undefined),
        isProject: activeTab === 'project' ? true : (activeTab === 'hiring' || activeTab === 'seeking') ? false : undefined,
        instrumentName: selectedInstrument,
        regionName: selectedRegion,
        period: selectedPeriod !== '전체' ? selectedPeriod : undefined,
        minSkillLevel: selectedLevel !== '전체' ? selectedLevel : undefined,
        searchQuery,
        sortBy,
        page: nextPage,
        limit: PAGE_SIZE,
        includeExpired: true,
      })
      setGigs(prev => [...prev, ...result.data])
      setHasMore(result.hasMore)
      setPage(nextPage)
    } catch {
      // 무시
    } finally {
      setLoadingMore(false)
    }
  }

  // 필터/정렬/탭 변경 시 첫 페이지 재로드
  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  // ── 필터 초기화 여부 ──────────────────────────────────────────
  const isFiltered =
    selectedInstrument !== '전체' ||
    selectedRegion !== '전체' ||
    selectedPeriod !== '전체' ||
    selectedLevel !== '전체' ||
    sortBy !== 'latest' ||
    searchQuery.trim() !== ''

  const resetFilters = () => {
    setSelectedInstrument('전체')
    setSelectedRegion('전체')
    setSelectedPeriod('전체')
    setSelectedLevel('전체')
    setSortBy('latest')
    clearSearch()
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* 헤더 — TUTTI 로고 + 공고 올리기 */}
      <header className="bg-white sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-black text-accent tracking-tight">TUTTI</span>
          </Link>
          <Link href="/gigs/new">
            <Button size="sm" className="bg-ink hover:bg-ink-light">+ 공고 올리기</Button>
          </Link>
        </div>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex max-w-lg mx-auto">
          {[
            { key: 'all',     label: '전체' },
            { key: 'project', label: '🎼 프로젝트' },
            { key: 'hiring',  label: '연주자 모집' },
            { key: 'seeking', label: '팀 찾기' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? tab.key === 'project'
                    ? 'border-ink text-accent'
                    : 'border-ink text-accent'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 바 */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5 max-w-lg mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="곡명, 공고 제목으로 검색..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-accent focus:bg-white transition-colors"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 필터 + 정렬 — max-w-lg로 다른 UI와 폭 통일 */}
      <div className="bg-white border-b border-gray-100 px-4 py-2 flex items-center gap-1.5 overflow-x-auto max-w-lg mx-auto">
        {/* 악기 선택 */}
        <select
          value={selectedInstrument}
          onChange={e => setSelectedInstrument(e.target.value)}
          className={`shrink-0 text-[11px] border rounded-full px-2.5 py-1 bg-white focus:outline-none transition-colors ${
            selectedInstrument !== '전체'
              ? 'border-accent text-accent bg-cream'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          {INSTRUMENTS.map(i => <option key={i}>{i}</option>)}
        </select>

        {/* 지역 선택 */}
        <select
          value={selectedRegion}
          onChange={e => setSelectedRegion(e.target.value)}
          className={`shrink-0 text-[11px] border rounded-full px-2.5 py-1 bg-white focus:outline-none transition-colors ${
            selectedRegion !== '전체'
              ? 'border-accent text-accent bg-cream'
              : 'border-gray-200 text-gray-600'
          }`}
        >
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>

        {/* 구분선 */}
        <div className="w-px h-4 bg-gray-200 shrink-0" />

        {/* 정렬 옵션 */}
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-colors font-medium ${
              sortBy === opt.key
                ? 'bg-ink text-white border-ink'
                : 'border-gray-200 text-gray-600 bg-white hover:border-cream-dark'
            }`}
          >
            {opt.label}
          </button>
        ))}

        {/* 필터 초기화 */}
        {isFiltered && (
          <>
            <div className="w-px h-4 bg-gray-200 shrink-0" />
            <button
              onClick={resetFilters}
              className="shrink-0 flex items-center gap-1 text-[11px] text-red-500 border border-red-200 rounded-full px-2.5 py-1 bg-red-50 hover:bg-red-100 transition-colors font-medium"
            >
              <X className="w-3 h-3" />
              초기화
            </button>
          </>
        )}
      </div>

      {/* 시대/난이도 필터 — 항상 노출 */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            {/* 시대 선택 */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">시대</label>
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(e.target.value)}
                className={`w-full text-[11px] border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none transition-colors ${
                  selectedPeriod !== '전체'
                    ? 'border-accent text-accent bg-cream'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                {PERIODS.map(p => (
                  <option key={p} value={p}>{PERIOD_LABELS[p]}</option>
                ))}
              </select>
            </div>

            {/* 실력 선택 */}
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">난이도</label>
              <select
                value={selectedLevel}
                onChange={e => setSelectedLevel(e.target.value)}
                className={`w-full text-[11px] border rounded-lg px-2.5 py-1.5 bg-white focus:outline-none transition-colors ${
                  selectedLevel !== '전체'
                    ? 'border-accent text-accent bg-cream'
                    : 'border-gray-300 text-gray-600'
                }`}
              >
                {SKILL_LEVELS.map(l => (
                  <option key={l} value={l}>{l === '전체' ? '전체' : LEVEL_LABELS[l]}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 수 표시 */}
      {!loading && (
        <div className="max-w-lg mx-auto px-4 pt-3 pb-1">
          <p className="text-xs text-gray-400">
            {gigs.length}개 공고
            {isFiltered && ' · 필터 적용됨'}
          </p>
        </div>
      )}

      {/* 공고 리스트 */}
      <main className="max-w-lg mx-auto px-4 py-3 space-y-4">

        {/* 에러 */}
        {error && (
          <div className="text-center py-8">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <Button size="sm" variant="outline" onClick={loadInitial}>다시 시도</Button>
          </div>
        )}

        {/* 스켈레톤 로딩 */}
        {loading && !error && (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <GigCardSkeleton key={i} />
            ))}
          </>
        )}

        {/* 빈 결과 */}
        {!loading && !error && gigs.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🎵</p>
            {isFiltered ? (
              <>
                <p className="text-sm font-medium text-gray-500">해당하는 공고가 없어요</p>
                <button
                  onClick={resetFilters}
                  className="mt-3 text-xs text-accent underline underline-offset-2"
                >
                  필터 초기화
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-500">아직 공고가 없어요</p>
                <p className="text-xs text-gray-400 mt-1">첫 번째 공고를 올려보세요!</p>
                <Link href="/gigs/new">
                  <Button size="sm" className="mt-4 bg-ink hover:bg-ink-light">
                    공고 올리기
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}

        {/* 공고 카드 목록 */}
        {!loading && gigs.map(gig => (
          <GigCard key={gig.id} gig={gig} />
        ))}

        {/* 더보기 로딩 스켈레톤 */}
        {loadingMore && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <GigCardSkeleton key={`more-${i}`} />
            ))}
          </>
        )}

        {/* 더보기 / 끝 */}
        {!loading && !error && gigs.length > 0 && (
          <div className="pt-2 pb-4">
            {hasMore ? (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full py-3 text-sm font-medium text-accent border border-cream-dark rounded-2xl bg-white hover:bg-cream active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {loadingMore ? '불러오는 중...' : '더보기'}
              </button>
            ) : (
              <p className="text-center text-xs text-gray-300 py-2">모든 공고를 확인했어요 ✓</p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
