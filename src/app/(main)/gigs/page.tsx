'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { GigType, SkillLevel } from '@/types'

const INSTRUMENTS = ['전체', '바이올린', '비올라', '첼로', '콘트라베이스', '플루트', '오보에', '클라리넷', '바순', '호른', '트럼펫', '트롬본', '피아노', '타악기']
const REGIONS = ['전체', '서울', '경기', '인천', '부산', '대구', '대전', '광주', '기타']

const MOCK_GIGS = [
  { id: '1', type: 'hiring' as GigType, title: '바이올린 2파트 단원 모집', org: '서울 시민 오케스트라', region: '서울', instrument: '바이올린', level: 'intermediate', date: '2026-03-15', isPaid: false },
  { id: '2', type: 'seeking' as GigType, title: '첼로 연주자 앙상블 팀 찾습니다', org: '김민준', region: '경기', instrument: '첼로', level: 'advanced', date: null, isPaid: true },
  { id: '3', type: 'hiring' as GigType, title: '플루트 연주자 2명 모집', org: '한강 챔버 오케스트라', region: '서울', instrument: '플루트', level: 'beginner', date: '2026-04-01', isPaid: false },
  { id: '4', type: 'seeking' as GigType, title: '피아노 반주자 활동 희망', org: '이수연', region: '서울', instrument: '피아노', level: 'professional', date: null, isPaid: true },
  { id: '5', type: 'hiring' as GigType, title: '비올라 수석 단원 모집', org: '강남 필하모닉', region: '서울', instrument: '비올라', level: 'advanced', date: '2026-03-20', isPaid: true },
  { id: '6', type: 'hiring' as GigType, title: '호른 파트 보강 단원', org: '인천 청소년 오케스트라', region: '인천', instrument: '호른', level: 'intermediate', date: '2026-05-01', isPaid: false },
]

const LEVEL_LABELS: Record<string, string> = {
  beginner: '입문',
  elementary: '초급',
  intermediate: '중급',
  advanced: '고급',
  professional: '전문가',
}

export default function GigsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'hiring' | 'seeking'>('all')
  const [selectedInstrument, setSelectedInstrument] = useState('전체')
  const [selectedRegion, setSelectedRegion] = useState('전체')

  const filtered = MOCK_GIGS.filter(g => {
    if (activeTab === 'hiring' && g.type !== 'hiring') return false
    if (activeTab === 'seeking' && g.type !== 'seeking') return false
    if (selectedInstrument !== '전체' && g.instrument !== selectedInstrument) return false
    if (selectedRegion !== '전체' && g.region !== selectedRegion) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 헤더 */}
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20 border-b border-gray-100">
        <h1 className="text-lg font-black text-gray-900">공고</h1>
        <Link href="/gigs/new">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">+ 공고 올리기</Button>
        </Link>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-100">
        <div className="flex max-w-lg mx-auto">
          {[
            { key: 'all', label: '전체' },
            { key: 'hiring', label: '구인' },
            { key: 'seeking', label: '구직' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        <select
          value={selectedInstrument}
          onChange={e => setSelectedInstrument(e.target.value)}
          className="shrink-0 text-xs border border-gray-200 rounded-full px-3 py-1.5 bg-white focus:outline-none focus:border-indigo-400"
        >
          {INSTRUMENTS.map(i => <option key={i}>{i}</option>)}
        </select>
        <select
          value={selectedRegion}
          onChange={e => setSelectedRegion(e.target.value)}
          className="shrink-0 text-xs border border-gray-200 rounded-full px-3 py-1.5 bg-white focus:outline-none focus:border-indigo-400"
        >
          {REGIONS.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      {/* 공고 리스트 */}
      <main className="max-w-lg mx-auto px-4 py-3 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🎵</p>
            <p className="text-sm">해당하는 공고가 없어요</p>
          </div>
        )}
        {filtered.map(gig => (
          <Link key={gig.id} href={`/gigs/${gig.id}`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    gig.type === 'hiring' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {gig.type === 'hiring' ? '구인' : '구직'}
                  </span>
                  {gig.isPaid && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">유급</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{gig.region}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{gig.title}</h3>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{gig.org} · {gig.instrument} · {LEVEL_LABELS[gig.level]}</p>
                {gig.date && <p className="text-xs text-gray-400">{gig.date}</p>}
              </div>
            </div>
          </Link>
        ))}
      </main>
    </div>
  )
}
