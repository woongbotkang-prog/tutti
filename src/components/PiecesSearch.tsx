// 곡 검색 컴포넌트
// 곡명, 작곡가, 시대, 태그를 기반으로 복합 검색

'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { Input } from './ui/input'
import { Button } from './ui/button'
import type {
  PieceSearchRequest,
  PieceListItem,
  PieceDifficulty,
  Tag,
  PiecePeriod,
} from '@/types/pieces'

interface PiecesSearchProps {
  onSelect?: (piece: PieceListItem) => void
  showFilters?: boolean
  limit?: number
}

export function PiecesSearch({
  onSelect,
  showFilters = true,
  limit = 20,
}: PiecesSearchProps) {
  // 필터 상태
  const [query, setQuery] = useState('')
  const [selectedPeriods, setSelectedPeriods] = useState<PiecePeriod[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [difficulty, setDifficulty] = useState<string>('')

  // 필터 옵션 로드
  const { data: periodsData } = useQuery({
    queryKey: ['tags', 'period'],
    queryFn: () =>
      fetch('/api/tags?category=period').then((r) => r.json()) as Promise<{ data: Tag[] }>,
    staleTime: 24 * 60 * 60 * 1000, // 24시간
  })

  const { data: genresData } = useQuery({
    queryKey: ['tags', 'genre'],
    queryFn: () =>
      fetch('/api/tags?category=genre').then((r) => r.json()) as Promise<{ data: Tag[] }>,
    staleTime: 24 * 60 * 60 * 1000,
  })

  // 곡 검색
  const searchRequest: PieceSearchRequest = {
    query: query || undefined,
    periods: selectedPeriods.length > 0 ? selectedPeriods : undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    difficulty: (difficulty || undefined) as PieceDifficulty | undefined,
    limit,
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ['pieces', searchRequest],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams()
      if (searchRequest.query) params.append('query', searchRequest.query)
      if (searchRequest.periods?.length)
        params.append('periods', searchRequest.periods.join(','))
      if (searchRequest.tags?.length) params.append('tags', searchRequest.tags.join(','))
      if (searchRequest.difficulty) params.append('difficulty', searchRequest.difficulty)
      params.append('page', String(pageParam))
      params.append('limit', String(searchRequest.limit))

      const response = await fetch(`/api/pieces?${params}`)
      if (!response.ok) throw new Error('검색 실패')
      return response.json()
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5분
  })

  const pieces = data?.pages.flatMap((page) => page.data) || []

  const togglePeriod = useCallback((period: PiecePeriod) => {
    setSelectedPeriods((prev) =>
      prev.includes(period)
        ? prev.filter((p) => p !== period)
        : [...prev, period]
    )
  }, [])

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    )
  }, [])

  return (
    <div className="space-y-4">
      {/* 검색 입력 */}
      <div className="flex gap-2">
        <Input
          placeholder="곡명 또는 작곡가명 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
      </div>

      {/* 필터 */}
      {showFilters && (
        <div className="space-y-3 border rounded-lg p-4 bg-gray-50">
          {/* 시대 필터 */}
          <div>
            <label className="text-sm font-medium mb-2 block">시대</label>
            <div className="flex flex-wrap gap-2">
              {(periodsData?.data || []).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => togglePeriod(tag.name as PiecePeriod)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedPeriods.includes(tag.name as PiecePeriod)
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {tag.name_ko || tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* 장르 필터 */}
          <div>
            <label className="text-sm font-medium mb-2 block">장르</label>
            <div className="flex flex-wrap gap-2">
              {(genresData?.data || []).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    selectedTags.includes(tag.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-white border border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {tag.name_ko || tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* 난이도 필터 */}
          <div>
            <label className="text-sm font-medium mb-2 block">난이도</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="px-3 py-2 border rounded"
            >
              <option value="">선택 안함</option>
              <option value="beginner">입문</option>
              <option value="elementary">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
              <option value="professional">전문가</option>
            </select>
          </div>
        </div>
      )}

      {/* 검색 결과 */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center text-gray-500">검색 중...</div>
        ) : error ? (
          <div className="text-center text-red-500">검색 오류 발생</div>
        ) : pieces.length === 0 ? (
          <div className="text-center text-gray-500">검색 결과가 없습니다.</div>
        ) : (
          <>
            {pieces.map((piece) => (
              <PieceCard
                key={piece.id}
                piece={piece}
                onSelect={onSelect}
              />
            ))}

            {hasNextPage && (
              <Button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                variant="outline"
                className="w-full"
              >
                {isFetchingNextPage ? '로드 중...' : '더보기'}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// 곡 카드 컴포넌트
interface PieceCardProps {
  piece: PieceListItem
  onSelect?: (piece: PieceListItem) => void
}

function PieceCard({ piece, onSelect }: PieceCardProps) {
  return (
    <button
      onClick={() => onSelect?.(piece)}
      className="w-full text-left border rounded-lg p-3 hover:bg-gray-50 transition-colors"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <h3 className="font-medium text-sm">{piece.title}</h3>
          <p className="text-xs text-gray-500 mt-1">
            {piece.composer?.name_ko || piece.composer?.name_en || '작곡가 미상'}
          </p>
        </div>
        <div className="text-xs text-gray-500">
          {piece.period && <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded">
            {piece.period}
          </span>}
        </div>
      </div>

      {/* 난이도 */}
      {piece.difficulty_level && (
        <p className="text-xs text-gray-600 mt-2">
          난이도: {piece.difficulty_level}
        </p>
      )}

      {/* 지속시간 */}
      {piece.duration_minutes && (
        <p className="text-xs text-gray-600">
          연주시간: {piece.duration_minutes}분
        </p>
      )}

      {/* 태그 */}
      {piece.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {piece.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              #{tag.name_ko || tag.name}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
