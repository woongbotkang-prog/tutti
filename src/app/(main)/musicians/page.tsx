'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, MapPin } from 'lucide-react'
import { fetchMusicians, type MusicianListItem } from '@/lib/supabase/queries'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'

const REGIONS = ['서울', '경기', '인천', '부산', '대구', '대전', '광주', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
const INSTRUMENTS = ['바이올린', '비올라', '첼로', '콘트라베이스', '플루트', '오보에', '클라리넷', '바순', '호른', '트럼펫', '트롬본', '튜바', '피아노', '하프', '타악기']
const SKILL_LEVELS = [
  { value: 'beginner', label: '입문' },
  { value: 'elementary', label: '초급' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '고급' },
  { value: 'professional', label: '전문가' },
]

interface Instrument {
  id: string
  name: string
}

const getMannerTemperatureColor = (temp: number) => {
  if (temp >= 37.5) return 'text-red-500'
  if (temp >= 37) return 'text-orange-500'
  if (temp >= 36.5) return 'text-yellow-500'
  return 'text-blue-500'
}

export default function MusiciansPage() {
  const supabase = createClient()

  const [musicians, setMusicians] = useState<MusicianListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedInstrument, setSelectedInstrument] = useState('')
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [instrumentLoading, setInstrumentLoading] = useState(true)

  // Load instruments on mount
  useEffect(() => {
    const loadInstruments = async () => {
      try {
        const { data } = await supabase
          .from('instruments')
          .select('id, name')
          .eq('is_active', true)
          .order('display_order', { ascending: true })

        setInstruments(data || [])
      } catch (err) {
        console.error('Failed to load instruments:', err)
      } finally {
        setInstrumentLoading(false)
      }
    }

    loadInstruments()
  }, [])

  // Fetch musicians
  useEffect(() => {
    const loadMusicians = async () => {
      setLoading(true)
      try {
        let regionId: string | undefined
        if (selectedRegion) {
          const { data: regionData } = await supabase
            .from('regions')
            .select('id')
            .eq('name', selectedRegion)
            .single()
          regionId = regionData?.id
        }

        let instrumentId: string | undefined
        if (selectedInstrument) {
          const instrument = instruments.find(i => i.name === selectedInstrument)
          instrumentId = instrument?.id
        }

        const result = await fetchMusicians({
          search: searchQuery || undefined,
          regionId,
          instrumentId,
          skillLevel: (selectedSkillLevel as any) || undefined,
          page,
          limit: 20,
        })

        setMusicians(result.data)
        setTotal(result.total)
        setHasMore(result.hasMore)
      } catch (err) {
        console.error('Failed to fetch musicians:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMusicians()
  }, [searchQuery, selectedRegion, selectedInstrument, selectedSkillLevel, page, instruments])

  const handleReset = () => {
    setSearchQuery('')
    setSelectedRegion('')
    setSelectedInstrument('')
    setSelectedSkillLevel('')
    setPage(0)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold mb-4">연주자 찾기</h1>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="이름으로 검색"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setPage(0)
              }}
              className="pl-10 rounded-lg border border-gray-200"
            />
          </div>

          {/* Filters */}
          <div className="space-y-3 text-sm">
            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value)
                setPage(0)
              }}
              className="w-full p-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="">지역 전체</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            {/* Instrument Filter */}
            <select
              value={selectedInstrument}
              onChange={(e) => {
                setSelectedInstrument(e.target.value)
                setPage(0)
              }}
              className="w-full p-2 border border-gray-200 rounded-lg bg-white"
              disabled={instrumentLoading}
            >
              <option value="">악기 전체</option>
              {instruments.map((instrument) => (
                <option key={instrument.id} value={instrument.name}>
                  {instrument.name}
                </option>
              ))}
            </select>

            {/* Skill Level Filter */}
            <select
              value={selectedSkillLevel}
              onChange={(e) => {
                setSelectedSkillLevel(e.target.value)
                setPage(0)
              }}
              className="w-full p-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="">수준 전체</option>
              {SKILL_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>

            {/* Reset Button */}
            {(searchQuery || selectedRegion || selectedInstrument || selectedSkillLevel) && (
              <button
                onClick={handleReset}
                className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Musicians Grid */}
      <div className="max-w-lg mx-auto px-4 py-6">
        {loading && musicians.length === 0 ? (
          <div className="text-center py-12 text-gray-500">로딩 중...</div>
        ) : musicians.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">검색 결과가 없습니다.</p>
            <button
              onClick={handleReset}
              className="text-indigo-600 text-sm font-medium hover:underline"
            >
              필터 초기화하기
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {musicians.map((musician) => (
                <Link
                  key={musician.id}
                  href={`/musicians/${musician.id}`}
                  className="block p-4 rounded-2xl bg-white border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {musician.avatar_url ? (
                        <img
                          src={musician.avatar_url}
                          alt={musician.display_name}
                          className="w-16 h-16 rounded-full object-cover bg-gray-100"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-xl font-bold text-indigo-600">
                            {musician.display_name[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm truncate">
                          {musician.display_name}
                        </h3>
                        <div className={`text-xs font-semibold flex-shrink-0 ${getMannerTemperatureColor(musician.manner_temperature)}`}>
                          {musician.manner_temperature.toFixed(1)}°C
                        </div>
                      </div>

                      {/* Region */}
                      {musician.region && (
                        <div className="flex items-center gap-1 text-gray-600 text-xs mt-1 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>{musician.region.name}</span>
                        </div>
                      )}

                      {/* Instruments */}
                      {musician.instruments && musician.instruments.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {musician.instruments.slice(0, 3).map((ui) => (
                            <span
                              key={ui.instrument?.name}
                              className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium"
                            >
                              {ui.instrument?.name}
                            </span>
                          ))}
                          {musician.instruments.length > 3 && (
                            <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{musician.instruments.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                이전
              </button>
              <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                {page + 1} / {Math.ceil(total / 20) || 1}
              </div>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!hasMore}
                className="px-3 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
