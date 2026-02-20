'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Trash2, Plus, Check, Clock } from 'lucide-react'

interface Piece {
  id: string
  title: string
  composer_name_ko?: string
  composer_name?: string
  period?: string
}

interface RepertoireItem {
  id: string
  user_id: string
  piece_id?: string
  piece_name: string
  composer_name: string
  performance_ready: boolean
  difficulty_level?: string
  created_at: string
}

export default function RepertoirePage() {
  const [repertoire, setRepertoire] = useState<RepertoireItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Piece[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null)
  const [customName, setCustomName] = useState('')
  const [customComposer, setCustomComposer] = useState('')
  const [performanceReady, setPerformanceReady] = useState(false)
  const [difficultyLevel, setDifficultyLevel] = useState('intermediate')
  const [adding, setAdding] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()

  const supabase = createClient()

  // Load repertoire
  useEffect(() => {
    const loadRepertoire = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('user_repertoire')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Failed to load repertoire:', error)
          setRepertoire([])
        } else {
          setRepertoire(data || [])
        }
      } catch (e) {
        console.error('Failed to load repertoire:', e)
        setRepertoire([])
      } finally {
        setLoading(false)
      }
    }

    loadRepertoire()
  }, [])

  // Debounced search
  const searchPieces = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const res = await fetch(`/api/pieces/search?q=${encodeURIComponent(q)}&limit=10`)
      const json = await res.json()
      setSearchResults(json.data || [])
    } catch (e) {
      console.error('Search failed:', e)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => searchPieces(query), 300)
  }

  const selectPiece = (piece: Piece) => {
    setSelectedPiece(piece)
    setCustomName(piece.title)
    setCustomComposer(piece.composer_name_ko || piece.composer_name || '작곡가 미상')
    setSearchQuery('')
    setSearchResults([])
  }

  const addPiece = async () => {
    if (!customName.trim() || !customComposer.trim()) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setAdding(true)
    try {
      const { data, error } = await supabase
        .from('user_repertoire')
        .insert({
          user_id: user.id,
          piece_id: selectedPiece?.id,
          piece_name: customName.trim(),
          composer_name: customComposer.trim(),
          performance_ready: performanceReady,
          difficulty_level: difficultyLevel,
        })
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setRepertoire((prev) => [data[0], ...prev])
      }

      // Reset form
      setShowAddForm(false)
      setCustomName('')
      setCustomComposer('')
      setSelectedPiece(null)
      setPerformanceReady(false)
      setDifficultyLevel('intermediate')
    } catch (e) {
      console.error('Failed to add piece:', e)
    } finally {
      setAdding(false)
    }
  }

  const deletePiece = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_repertoire')
        .delete()
        .eq('id', id)

      if (error) throw error
      setRepertoire((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      console.error('Failed to delete piece:', e)
    }
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setCustomName('')
    setCustomComposer('')
    setSelectedPiece(null)
    setSearchQuery('')
    setSearchResults([])
    setPerformanceReady(false)
    setDifficultyLevel('intermediate')
  }

  const difficultyLabels: Record<string, string> = {
    beginner: '입문',
    elementary: '초급',
    intermediate: '중급',
    advanced: '고급',
    professional: '전문가',
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-gray-900">내 레퍼토리</h1>
            <p className="text-xs text-gray-500 mt-1">{repertoire.length}곡</p>
          </div>
          {!showAddForm && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              추가
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl border border-indigo-200 p-4 mb-4 shadow-md">
            <h2 className="text-sm font-bold text-gray-900 mb-3">곡 추가하기</h2>

            {/* Search Form */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="곡명 또는 작곡가 검색..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
                {searching && <p className="text-xs text-gray-400 mt-1 text-center">검색 중...</p>}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-2 bg-gray-50">
                  {searchResults.map((piece) => (
                    <button
                      key={piece.id}
                      onClick={() => selectPiece(piece)}
                      className="w-full text-left p-2 rounded hover:bg-indigo-100 transition-colors"
                    >
                      <p className="text-xs font-medium text-gray-900">{piece.title}</p>
                      <p className="text-xs text-gray-500">
                        {piece.composer_name_ko || piece.composer_name || '작곡가 미상'}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {searchQuery && !searching && searchResults.length === 0 && (
                <p className="text-xs text-gray-500 text-center">검색 결과가 없습니다.</p>
              )}
            </div>

            {/* Manual Input */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">곡명</label>
                <Input
                  placeholder="곡명을 입력하세요"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">작곡가</label>
                <Input
                  placeholder="작곡가명을 입력하세요"
                  value={customComposer}
                  onChange={(e) => setCustomComposer(e.target.value)}
                />
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">난이도</label>
                <select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white"
                >
                  {Object.entries(difficultyLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Performance Ready Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={performanceReady}
                  onChange={(e) => setPerformanceReady(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                />
                <span className="text-xs font-medium text-gray-700">연주 가능</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancel}
                disabled={adding}
              >
                취소
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                onClick={addPiece}
                disabled={!customName.trim() || !customComposer.trim() || adding}
              >
                {adding ? '추가 중...' : '추가'}
              </Button>
            </div>
          </div>
        )}

        {/* Repertoire List */}
        {repertoire.length === 0 && !showAddForm ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <span className="text-4xl mb-3">🎵</span>
            <p className="text-sm text-center">
              레퍼토리를 등록하면 관련 공고를 추천받을 수 있어요
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {repertoire.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start justify-between hover:border-indigo-200 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900">{item.piece_name}</h3>
                  <p className="text-xs text-gray-600 mt-0.5">{item.composer_name}</p>

                  <div className="flex items-center gap-2 mt-2">
                    {item.performance_ready ? (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        연주 가능
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        연습 중
                      </span>
                    )}

                    {item.difficulty_level && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                        {difficultyLabels[item.difficulty_level] || item.difficulty_level}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deletePiece(item.id)}
                  className="ml-3 p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-500 flex-shrink-0"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
