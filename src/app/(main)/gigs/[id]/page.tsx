import Link from 'next/link'
import { Button } from '@/components/ui/button'

// 임시 Mock - 실제는 Supabase에서 fetch
const MOCK_GIG = {
  id: '1',
  type: 'hiring',
  title: '바이올린 2파트 단원 모집',
  org: '서울 시민 오케스트라',
  region: '서울 강남구',
  instrument: '바이올린',
  level: '중급 이상',
  description: `서울 시민 오케스트라에서 바이올린 2파트 단원을 모집합니다.

저희 오케스트라는 2010년 창단 이후 매년 2회 정기연주회를 개최하고 있으며, 클래식 음악을 사랑하는 아마추어 연주자들의 모임입니다.

**연습 일정**
- 매주 토요일 오후 2시~5시
- 장소: 서울 강남구 연습실

**모집 요건**
- 바이올린 중급 이상 (오케스트라 경험자 우대)
- 정기 연습 참여 가능하신 분
- 열정 있는 분이라면 누구든 환영합니다!`,
  date: '2026-03-15',
  isPaid: false,
  maxApplicants: 3,
  currentApplicants: 1,
  repertoire: ['Beethoven - Symphony No.7', 'Brahms - Symphony No.2'],
  createdAt: '2026-02-15',
}

export default function GigDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* 헤더 */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-20">
        <Link href="/gigs">
          <button className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </Link>
        <h1 className="font-bold text-gray-900 flex-1 truncate">{MOCK_GIG.title}</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {MOCK_GIG.type === 'hiring' ? '구인' : '구직'}
            </span>
            {!MOCK_GIG.isPaid && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">무급</span>
            )}
          </div>

          <h2 className="text-xl font-black text-gray-900 mb-1">{MOCK_GIG.title}</h2>
          <p className="text-sm text-gray-600 font-medium mb-4">{MOCK_GIG.org}</p>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '악기', value: MOCK_GIG.instrument },
              { label: '실력', value: MOCK_GIG.level },
              { label: '지역', value: MOCK_GIG.region },
              { label: '연주일', value: MOCK_GIG.date || '협의' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 모집 현황 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">모집 현황</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">{MOCK_GIG.currentApplicants}명 지원 중</span>
            <span className="text-sm font-bold text-indigo-600">{MOCK_GIG.maxApplicants}명 모집</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(MOCK_GIG.currentApplicants / MOCK_GIG.maxApplicants) * 100}%` }}
            />
          </div>
        </div>

        {/* 상세 설명 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-3">공고 내용</h3>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {MOCK_GIG.description}
          </div>
        </div>

        {/* 레퍼토리 */}
        {MOCK_GIG.repertoire.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">레퍼토리</h3>
            <div className="space-y-2">
              {MOCK_GIG.repertoire.map((piece, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-indigo-400">♪</span>
                  <span className="text-sm text-gray-700">{piece}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 하단 지원 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto">
          <Button size="full" className="bg-indigo-600 hover:bg-indigo-700">
            지원하기
          </Button>
        </div>
      </div>
    </div>
  )
}
