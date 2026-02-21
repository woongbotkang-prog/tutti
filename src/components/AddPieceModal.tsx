'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { X, Search, Plus, ChevronUp, ChevronDown, Trash2, CheckCircle2 } from 'lucide-react'

interface PieceEntry {
  piece_id?: string
  text_input: string
  composer_name?: string
  period?: string
}

interface SearchResult {
  id: string
  title: string
  period?: string
  difficulty_level?: string
  composer_name?: string
  composer_name_ko?: string
}


const CURATED_FALLBACK_PIECES: Array<{ title: string; composer_name: string; period: string }> = [
  { title: '교향곡 5번 c단조 Op.67', composer_name: '베토벤', period: 'classical' },
  { title: '교향곡 40번 g단조 K.550', composer_name: '모차르트', period: 'classical' },
  { title: '교향곡 9번 e단조 Op.95 "신세계로부터"', composer_name: '드보르자크', period: 'romantic' },
  { title: '사계 "봄"', composer_name: '비발디', period: 'baroque' },
  { title: 'G선상의 아리아', composer_name: '바흐', period: 'baroque' },
  { title: '카르멘 서곡', composer_name: '비제', period: 'romantic' },
]

interface AddPieceModalProps {
  isOpen: boolean
  onClose: () => void
  pieces: PieceEntry[]
  onPiecesChange: (pieces: PieceEntry[]) => void
}

export default function AddPieceModal({ isOpen, onClose, pieces, onPiecesChange }: AddPieceModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [recommended, setRecommended] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false)
  const [mode, setMode] = useState<'search' | 'manual'>('search')
  const [manualInput, setManualInput] = useState('')
  const debounceRef = useRef<NodeJS.Timeout>()

  const periodKo: Record<string, string> = {
    baroque: '바로크', classical: '고전', romantic: '낭만',
    modern: '근현대', contemporary: '현대'
  }

  // 300ms debounce 검색
  const searchPieces = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    setIsSearching(true)
    try {
      const res = await fetch(`/api/pieces/search?q=${encodeURIComponent(q)}&limit=10`)
      const json = await res.json()
      setResults(json.data || [])
    } catch { setResults([]) }
    setIsSearching(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchPieces(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, searchPieces])

  useEffect(() => {
    if (!isOpen) return

    const fetchRecommended = async () => {
      setIsLoadingRecommended(true)
      try {
        const res = await fetch('/api/pieces/search?limit=12')
        const json = await res.json()
        setRecommended(json.data || [])
      } catch {
        setRecommended([])
      } finally {
        setIsLoadingRecommended(false)
      }
    }

    fetchRecommended()
  }, [isOpen])

  const recommendedKeywords = Array.from(
    new Set(
      recommended
        .map(item => item.composer_name_ko || item.composer_name)
        .filter(Boolean)
    )
  ).slice(0, 6) as string[]

  const fallbackKeywords = Array.from(new Set(CURATED_FALLBACK_PIECES.map(item => item.composer_name))).slice(0, 6)

  const isSelected = (id?: string, title?: string, composer?: string): boolean => {
    if (id) return pieces.some(p => p.piece_id === id)
    return pieces.some(p => p.text_input === title && (p.composer_name || '') === (composer || ''))
  }

  const toggleFromSearch = (result: SearchResult) => {
    if (isSelected(result.id)) {
      onPiecesChange(pieces.filter(p => p.piece_id !== result.id))
    } else {
      onPiecesChange([...pieces, {
        piece_id: result.id,
        text_input: result.title,
        composer_name: result.composer_name_ko || result.composer_name,
        period: result.period,
      }])
      setQuery('')
      setResults([])
    }
  }

  const toggleCurated = (item: { title: string; composer_name: string; period: string }) => {
    if (isSelected(undefined, item.title, item.composer_name)) {
      onPiecesChange(pieces.filter(p => !(p.text_input === item.title && (p.composer_name || '') === item.composer_name)))
    } else {
      onPiecesChange([...pieces, {
        text_input: item.title,
        composer_name: item.composer_name,
        period: item.period,
      }])
    }
  }

  const addManual = () => {
    if (!manualInput.trim()) return
    onPiecesChange([...pieces, { text_input: manualInput.trim() }])
    setManualInput('')
  }

  const removePiece = (idx: number) => {
    onPiecesChange(pieces.filter((_, i) => i !== idx))
  }

  const movePiece = (idx: number, dir: -1 | 1) => {
    const next = idx + dir
    if (next < 0 || next >= pieces.length) return
    const arr = [...pieces];
    [arr[idx], arr[next]] = [arr[next], arr[idx]]
    onPiecesChange(arr)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold">곡 추가하기</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 선택된 곡 패널 — sticky */}
        {pieces.length > 0 && (
          <div className="sticky top-0 z-10 bg-white border-b px-5 py-3">
            <p className="text-xs font-bold text-accent mb-2">선택된 곡 ({pieces.length})</p>
            <div className="space-y-1">
              {pieces.map((piece, idx) => (
                <div key={idx} className="flex items-center justify-between bg-cream rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs text-accent font-bold w-4">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{piece.text_input}</p>
                      {piece.composer_name && <p className="text-[10px] text-gray-500">{piece.composer_name}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0 ml-2">
                    <button onClick={() => movePiece(idx, -1)} disabled={idx === 0} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button onClick={() => movePiece(idx, 1)} disabled={idx === pieces.length - 1} className="p-1 hover:bg-gray-200 rounded disabled:opacity-30">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    <button onClick={() => removePiece(idx)} className="p-1 hover:bg-red-100 rounded text-red-500">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 탭: 검색 / 직접 입력 */}
        <div className="flex border-b">
          <button
            onClick={() => setMode('search')}
            className={`flex-1 py-3 text-sm font-medium ${mode === 'search' ? 'text-accent border-b-2 border-accent' : 'text-gray-400'}`}
          >
            <Search className="w-4 h-4 inline mr-1" />검색
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 py-3 text-sm font-medium ${mode === 'manual' ? 'text-accent border-b-2 border-accent' : 'text-gray-400'}`}
          >
            <Plus className="w-4 h-4 inline mr-1" />직접 입력
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {mode === 'search' ? (
            <>
              <Input
                placeholder="곡명 또는 작곡가명 검색..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              {isSearching && <p className="text-sm text-gray-400 text-center">검색 중...</p>}
              {!query.trim() && (
                <div className="space-y-3">
                  {(recommendedKeywords.length > 0 || (recommended.length === 0 && fallbackKeywords.length > 0)) && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1.5">연관 검색어</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(recommendedKeywords.length > 0 ? recommendedKeywords : fallbackKeywords).map(keyword => (
                          <button
                            key={keyword}
                            type="button"
                            onClick={() => setQuery(keyword)}
                            className="px-2.5 py-1 rounded-full text-xs bg-gray-100 text-gray-600 hover:bg-cream hover:text-accent"
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1.5">추천 곡</p>
                    {isLoadingRecommended && (
                      <p className="text-sm text-gray-400">추천 곡을 불러오는 중...</p>
                    )}
                    {!isLoadingRecommended && recommended.length > 0 && (
                      <div className="space-y-2">
                        {recommended.map((r) => {
                          const selected = isSelected(r.id)
                          return (
                            <button
                              key={r.id}
                              onClick={() => toggleFromSearch(r)}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                                selected
                                  ? 'border-accent bg-cream'
                                  : 'border-gray-200 bg-white hover:border-accent/50 hover:bg-cream/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm ${selected ? 'text-accent' : ''}`}>{r.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {r.composer_name_ko || r.composer_name || '작곡가 미상'}
                                    {r.period && <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">#{periodKo[r.period] || r.period}</span>}
                                  </p>
                                </div>
                                {selected && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-accent" />
                                    <span className="text-xs font-bold text-accent">선택됨</span>
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                    {!isLoadingRecommended && recommended.length === 0 && (
                      <div className="space-y-2">
                        {CURATED_FALLBACK_PIECES.map((r, idx) => {
                          const selected = isSelected(undefined, r.title, r.composer_name)
                          return (
                            <button
                              key={`${r.title}-${idx}`}
                              onClick={() => toggleCurated(r)}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                                selected
                                  ? 'border-accent bg-cream'
                                  : 'border-gray-200 bg-white hover:border-accent/50 hover:bg-cream/50'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm ${selected ? 'text-accent' : ''}`}>{r.title}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {r.composer_name}
                                    <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">#{periodKo[r.period] || r.period}</span>
                                  </p>
                                </div>
                                {selected && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <CheckCircle2 className="w-4 h-4 text-accent" />
                                    <span className="text-xs font-bold text-accent">선택됨</span>
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {results.length > 0 && (
                <div className="space-y-2">
                  {results.map((r) => {
                    const selected = isSelected(r.id)
                    return (
                      <button
                        key={r.id}
                        onClick={() => toggleFromSearch(r)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                          selected
                            ? 'border-accent bg-cream'
                            : 'border-gray-200 bg-white hover:border-accent/50 hover:bg-cream/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium text-sm ${selected ? 'text-accent' : ''}`}>{r.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {r.composer_name_ko || r.composer_name || '작곡가 미상'}
                              {r.period && <span className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">#{periodKo[r.period] || r.period}</span>}
                            </p>
                          </div>
                          {selected && (
                            <div className="flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-accent" />
                              <span className="text-xs font-bold text-accent">선택됨</span>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
              {query && !isSearching && results.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">검색 결과가 없습니다.</p>
                  <button onClick={() => { setMode('manual'); setManualInput(query) }} className="text-sm text-accent font-medium mt-2">
                    직접 입력하기 →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="곡명을 입력하세요 (예: 베토벤 교향곡 9번)"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addManual()}
                autoFocus
              />
              <Button onClick={addManual} disabled={!manualInput.trim()} size="sm" className="bg-ink text-white">
                추가
              </Button>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="border-t px-5 py-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button className="flex-1 bg-accent text-white hover:bg-accent/90" onClick={onClose}>
            {pieces.length > 0 ? `${pieces.length}곡 선택 완료` : '닫기'}
          </Button>
        </div>
      </div>
    </div>
  )
}
