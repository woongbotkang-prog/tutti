'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, X, ChevronDown } from 'lucide-react'
import { fetchGigs, type GigListItem, type SortOption } from '@/lib/supabase/queries'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

// ── 상수 ──────────────────────────────────────────────────────
const TABS = [
  { key: 'all',       label: '전체' },
  { key: 'orchestra', label: '오케스트라' },
  { key: 'chamber',   label: '실내악' },
] as const

type TabKey = (typeof TABS)[number]['key']

const FILTER_REGIONS = ['전체', '서울', '경기', '인천', '부산', '대구', '대전', '광주', '기타']
const FILTER_INSTRUMENTS = [
  '전체', '바이올린', '비올라', '첼로', '콘트라베이스',
  '플루트', '오보에', '클라리넷', '바순', '호른',
  '트럼펫', '트롬본', '피아노', '타악기',
]
const FILTER_PERIODS = [
  { key: '전체',        label: '전체' },
  { key: 'baroque',    label: '바로크' },
  { key: 'classical',  label: '고전' },
  { key: 'romantic',   label: '낭만' },
  { key: 'modern',     label: '근현대' },
  { key: 'contemporary', label: '현대' },
]
const FILTER_LEVELS = [
  { key: '전체',          label: '전체' },
  { key: 'beginner',     label: '입문' },
  { key: 'elementary',   label: '초급' },
  { key: 'intermediate', label: '중급' },
  { key: 'advanced',     label: '고급' },
  { key: 'professional', label: '전문가' },
]

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'latest',  label: '최신순' },
  { key: 'popular', label: '인기순' },
]

type FilterKey = 'region' | 'instrument' | 'period' | 'level'

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

  // 단체명 표시 (있으면), 없으면 작성자명
  const teamName = gig.ensemble_name || gig.author?.display_name || null

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

        {/* 곡 제목 (메인) */}
        <h3 className="text-[16px] font-bold text-gray-900 leading-snug mb-0.5">
          {pieceTitle}
        </h3>

        {/* 영어 제목 */}
        {pieceAltTitle && (
          <p className="text-xs text-gray-400 mb-2">{pieceAltTitle}</p>
        )}

        {/* 지역 · 마감 · 단체/작성자명 */}
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
          {teamName && (
            <span className="ml-auto text-gray-400">{teamName}</span>
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

// ── 필터 드롭다운 패널 ─────────────────────────────────────────
interface FilterPanelProps {
  options: { key: string; label: string }[]
  selected: string
  onSelect: (key: string) => void
}

function FilterPanel({ options, selected, onSelect }: FilterPanelProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-3 bg-white border-b border-gray-100">
      {options.map(opt => (
        <button
          key={opt.key}
          onClick={() => onSelect(opt.key)}
          className={`text-[12px] font-medium px-3 py-1 rounded-full border transition-colors ${
            selected === opt.key
              ? 'bg-ink text-white border-ink'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
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

  // 탭
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  // 필터
  const [selectedRegion,     setSelectedRegion]     = useState('전체')
  const [selectedInstrument, setSelectedInstrument] = useState('전체')
  const [selectedPeriod,     setSelectedPeriod]     = useState('전체')
  const [selectedLevel,      setSelectedLevel]      = useState('전체')
  const [sortBy,             setSortBy]             = useState<SortOption>('latest')

  // 열려있는 필터 패널 (한 번에 하나만)
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null)

  // 정렬 드롭다운
  const [sortOpen, setSortOpen] = useState(false)

  // 검색
  const [searchQuery, setSearchQuery] = useState(() => searchParamsHook.get('search') || '')
  const [searchInput, setSearchInput] = useState(() => searchParamsHook.get('search') || '')

  // 데이터
  const [gigs,        setGigs]        = useState<GigListItem[]>([])
  const [page,        setPage]        = useState(0)
  const [hasMore,     setHasMore]     = useState(true)
  const [isLoading,   setIsLoading]   = useState(true)
  const [error,       setError]       = useState<string | null>(null)

  const debounceRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const observerRef  = useRef<IntersectionObserver | null>(null)
  const loadMoreRef  = useRef<HTMLDivElement | null>(null)

  // ── 검색어 디바운스 ───────────────────────────────────────────
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchQuery(value), 400)
  }

  const clearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }

  // ── 필터 파라미터 추출 ────────────────────────────────────────
  const buildParams = useCallback((pg: number) => ({
    gigCategory: activeTab !== 'all' ? (activeTab as 'orchestra' | 'chamber') : undefined,
    instrumentName: selectedInstrument,
    regionName: selectedRegion,
    period: selectedPeriod !== '전체' ? selectedPeriod : undefined,
    minSkillLevel: selectedLevel !== '전체' ? selectedLevel : undefined,
    searchQuery,
    sortBy,
    page: pg,
    limit: PAGE_SIZE,
    includeExpired: true,
  }), [activeTab, selectedInstrument, selectedRegion, selectedPeriod, selectedLevel, searchQuery, sortBy])

  // ── 초기 로드 ─────────────────────────────────────────────────
  const loadInitial = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchGigs(buildParams(0))
      setGigs(result.data)
      setHasMore(result.hasMore)
      setPage(0)
    } catch (e) {
      console.error('fetchGigs error:', e)
      setError('공고를 불러오는 데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [buildParams])

  // ── 더 불러오기 ───────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return
    setIsLoading(true)
    const nextPage = page + 1
    try {
      const result = await fetchGigs(buildParams(nextPage))
      setGigs(prev => [...prev, ...result.data])
      setHasMore(result.hasMore)
      setPage(nextPage)
    } catch {
      // 무시
    } finally {
      setIsLoading(false)
    }
  }, [hasMore, isLoading, page, buildParams])

  // 필터 변경 시 초기화 재로드
  useEffect(() => { loadInitial() }, [loadInitial])

  // ── Intersection Observer (무한 스크롤) ───────────────────────
  useEffect(() => {
    if (!loadMoreRef.current) return
    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    observerRef.current.observe(loadMoreRef.current)
    return () => observerRef.current?.disconnect()
  }, [hasMore, isLoading, loadMore])

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
    setOpenFilter(null)
    clearSearch()
  }

  // 필터 버튼 텍스트
  const filterLabel = (key: FilterKey) => {
    switch (key) {
      case 'region':     return selectedRegion     !== '전체' ? `지역: ${selectedRegion}`     : '지역'
      case 'instrument': return selectedInstrument !== '전체' ? `악기: ${selectedInstrument}` : '악기'
      case 'period': {
        const p = FILTER_PERIODS.find(p => p.key === selectedPeriod)
        return p && p.key !== '전체' ? `시대: ${p.label}` : '시대'
      }
      case 'level': {
        const l = FILTER_LEVELS.find(l => l.key === selectedLevel)
        return l && l.key !== '전체' ? `실력: ${l.label}` : '실력'
      }
    }
  }

  const toggleFilter = (key: FilterKey) =>
    setOpenFilter(prev => (prev === key ? null : key))

  // 현재 열린 패널의 옵션/selected/onSelect
  const panelProps = (): FilterPanelProps | null => {
    switch (openFilter) {
      case 'region':
        return {
          options: FILTER_REGIONS.map(r => ({ key: r, label: r })),
          selected: selectedRegion,
          onSelect: (v) => { setSelectedRegion(v); setOpenFilter(null) },
        }
      case 'instrument':
        return {
          options: FILTER_INSTRUMENTS.map(i => ({ key: i, label: i })),
          selected: selectedInstrument,
          onSelect: (v) => { setSelectedInstrument(v); setOpenFilter(null) },
        }
      case 'period':
        return {
          options: FILTER_PERIODS,
          selected: selectedPeriod,
          onSelect: (v) => { setSelectedPeriod(v); setOpenFilter(null) },
        }
      case 'level':
        return {
          options: FILTER_LEVELS,
          selected: selectedLevel,
          onSelect: (v) => { setSelectedLevel(v); setOpenFilter(null) },
        }
      default:
        return null
    }
  }

  const currentPanel = panelProps()

  // ── 렌더 ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* 헤더 */}
      <header className="bg-white sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-black text-accent tracking-tight">TUTTI</span>
          </Link>
          <Link href="/gigs/new">
            <Button size="sm" className="bg-ink text-white hover:bg-ink/90">+ 공고 올리기</Button>
          </Link>
        </div>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex max-w-lg mx-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-ink text-accent'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 검색 바 */}
      <div className="bg-white border-b border-gray-100 px-4 py-2.5">
        <div className="relative max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="곡명, 작곡가, 공고 제목으로 검색..."
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

      {/* 필터 바 */}
      <div className="bg-white border-b border-gray-100 sticky top-[57px] z-10">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">
          {/* 필터 버튼들 */}
          {(['region', 'instrument', 'period', 'level'] as FilterKey[]).map(key => {
            const isActive = openFilter === key
            const hasValue =
              (key === 'region'     && selectedRegion     !== '전체') ||
              (key === 'instrument' && selectedInstrument !== '전체') ||
              (key === 'period'     && selectedPeriod     !== '전체') ||
              (key === 'level'      && selectedLevel      !== '전체')
            return (
              <button
                key={key}
                onClick={() => toggleFilter(key)}
                className={`shrink-0 flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  isActive || hasValue
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {filterLabel(key)}
                <ChevronDown className={`w-3 h-3 transition-transform ${isActive ? 'rotate-180' : ''}`} />
              </button>
            )
          })}

          {/* 필터 초기화 */}
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="shrink-0 flex items-center gap-1 text-[12px] text-red-500 border border-red-200 rounded-full px-2.5 py-1.5 bg-red-50 hover:bg-red-100 transition-colors font-medium"
            >
              <X className="w-3 h-3" />
              초기화
            </button>
          )}

          {/* 구분선 */}
          <div className="flex-1" />

          {/* 정렬 드롭다운 */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen(p => !p)}
              className="flex items-center gap-1 text-[12px] font-medium px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-gray-400 transition-colors"
            >
              {SORT_OPTIONS.find(o => o.key === sortBy)?.label || '최신순'}
              <ChevronDown className={`w-3 h-3 transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-30 min-w-[90px] overflow-hidden">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortBy(opt.key); setSortOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-[12px] font-medium transition-colors ${
                      sortBy === opt.key
                        ? 'bg-ink text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 열린 필터 패널 */}
        {currentPanel && <FilterPanel {...currentPanel} />}
      </div>

      {/* 결과 수 */}
      {!isLoading && (
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

        {/* 초기 스켈레톤 */}
        {isLoading && gigs.length === 0 && !error && (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <GigCardSkeleton key={i} />
            ))}
          </>
        )}

        {/* 빈 결과 */}
        {!isLoading && !error && gigs.length === 0 && (
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
                  <Button size="sm" className="mt-4 bg-ink text-white hover:bg-ink/90">
                    공고 올리기
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}

        {/* 공고 카드 목록 */}
        {gigs.map(gig => (
          <GigCard key={gig.id} gig={gig} />
        ))}

        {/* 무한 스크롤 트리거 */}
        <div ref={loadMoreRef} className="h-10" />

        {/* 추가 로딩 스켈레톤 */}
        {isLoading && gigs.length > 0 && (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <GigCardSkeleton key={`more-${i}`} />
            ))}
          </>
        )}

        {/* 모두 로드됨 */}
        {!isLoading && !hasMore && gigs.length > 0 && (
          <p className="text-center text-xs text-gray-300 py-2">모든 공고를 확인했어요 ✓</p>
        )}
      </main>
    </div>
  )
}
