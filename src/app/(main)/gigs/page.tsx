'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { GigType, SkillLevel } from '@/types'

const INSTRUMENTS = ['전체', '바이올린', '비올라', '첼로', '콘트라베이스', '플루트', '오보에', '클라리넷', '바순', '호른', '트럼펫', '트롬본', '피아노', '타악기']
const REGIONS = ['전체', '서울', '경기', '인천', '부산', '대구', '대전', '광주', '기타']

const LEVEL_LABELS: Record<string, string> = {
  beginner: '입문', elementary: '초급', intermediate: '중급', advanced: '고급', professional: '전문가',
}

interface GigListItem {
  id: string
  gig_type: GigType
  title: string
  is_paid: boolean
  event_date: string | null
  created_at: string
  author: { display_name: string } | null
  region: { name: string } | null
  instruments: { instrument: { name: string } | null }[]
  min_skill_level: SkillLevel | null
}

export default function GigsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'hiring' | 'seeking'>('all')
  const [selectedInstrument, setSelectedInstrument] = useState('전체')
  const [selectedRegion, setSelectedRegion] = useState('전체')
  const [gigs, setGigs] = useState<GigListItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true)
      let query = supabase
        .from('gigs')
        .select(`
          id, gig_type, title, is_paid, event_date, created_at, min_skill_level,
          author:user_profiles!gigs_user_id_fkey(display_name),
          region:regions(name),
          instruments:gig_instruments(instrument:instruments(name))
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50)

      if (activeTab !== 'all') query = query.eq('gig_type', activeTab)

      const { data, error } = await query
      if (!error && data) setGigs(data as unknown as GigListItem[])
      setLoading(false)
    }
    fetchGigs()
  }, [activeTab])

  const filtered = gigs.filter(g => {
    if (selectedInstrument !== '전체') {
      const has = g.instruments?.some(i => i.instrument?.name === selectedInstrument)
      if (!has) return false
    }
    if (selectedRegion !== '전체' && g.region?.name !== selectedRegion) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100">
        <h1 className="text-lg font-black text-gray-900">공고</h1>
        <Link href="/gigs/new">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">+ 공고 올리기</Button>
        </Link>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex">
          {[{ key: 'all', label: '전체' }, { key: 'hiring', label: '구인' }, { key: 'seeking', label: '구직' }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white px-4 py-3 flex gap-2 overflow-x-auto border-b border-gray-50">
        <select value={selectedInstrument} onChange={e => setSelectedInstrument(e.target.value)}
          className="shrink-0 text-xs border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-indigo-400">
          {INSTRUMENTS.map(i => <option key={i}>{i}</option>)}
        </select>
        <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}
          className="shrink-0 text-xs border border-gray-200 rounded-full px-3 py-1.5 focus:outline-none focus:border-indigo-400">
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* 공고 리스트 */}
      <main className="max-w-lg mx-auto px-4 py-3 space-y-3">
        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🎵</p>
            <p className="text-sm">해당하는 공고가 없어요</p>
            <Link href="/gigs/new" className="inline-block mt-4 text-sm text-indigo-600 font-medium">첫 공고를 올려보세요 →</Link>
          </div>
        )}
        {filtered.map(gig => (
          <Link key={gig.id} href={`/gigs/${gig.id}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gig.gig_type === 'hiring' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {gig.gig_type === 'hiring' ? '구인' : '구직'}
                  </span>
                  {gig.is_paid && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">유급</span>}
                </div>
                <span className="text-xs text-gray-400">{gig.region?.name}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{gig.title}</h3>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {gig.author?.display_name}
                  {gig.instruments?.[0]?.instrument?.name && ` · ${gig.instruments[0].instrument.name}`}
                  {gig.min_skill_level && ` · ${LEVEL_LABELS[gig.min_skill_level]}`}
                </p>
                {gig.event_date && <p className="text-xs text-gray-400">{gig.event_date}</p>}
              </div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  )
}
