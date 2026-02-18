import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* 헤더 */}
      <header className="px-6 py-4 flex items-center justify-between max-w-lg mx-auto">
        <span className="text-2xl font-black text-indigo-600 tracking-tight">TUTTI</span>
        {user ? (
          <Link href="/profile">
            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              나
            </div>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm">로그인</Button>
          </Link>
        )}
      </header>

      {/* 히어로 */}
      <section className="px-6 pt-8 pb-10 max-w-lg mx-auto text-center">
        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
          클래식 연주자들의<br />
          <span className="text-indigo-600">매칭 플랫폼</span>
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          오케스트라 단원을 구하거나, 함께 연주할 팀을 찾아보세요
        </p>
        {!user && (
          <div className="flex gap-3 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                시작하기
              </Button>
            </Link>
            <Link href="/gigs">
              <Button size="lg" variant="outline">
                공고 보기
              </Button>
            </Link>
          </div>
        )}
        {user && (
          <div className="flex gap-3 justify-center">
            <Link href="/gigs/new">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                공고 올리기
              </Button>
            </Link>
            <Link href="/gigs">
              <Button size="lg" variant="outline">
                공고 찾기
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 탭 네비게이션 */}
      <nav className="sticky top-0 bg-white border-b border-gray-100 z-10">
        <div className="max-w-lg mx-auto flex">
          {['전체', '구인', '구직'].map((tab) => (
            <button
              key={tab}
              className="flex-1 py-3 text-sm font-medium text-gray-500 border-b-2 border-transparent hover:text-indigo-600 hover:border-indigo-600 transition-colors"
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* 공고 리스트 플레이스홀더 */}
      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {[
          { type: '구인', title: '바이올린 2파트 단원 모집', org: '서울 시민 오케스트라', region: '서울', level: '중급 이상' },
          { type: '구직', title: '첼로 연주자 앙상블 팀 찾습니다', org: '김민준', region: '경기', level: '고급' },
          { type: '구인', title: '플루트 연주자 2명 모집', org: '한강 챔버 오케스트라', region: '서울', level: '아마추어' },
          { type: '구직', title: '피아노 반주자 활동 희망', org: '이수연', region: '서울', level: '전문가' },
        ].map((gig, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                gig.type === '구인' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {gig.type}
              </span>
              <span className="text-xs text-gray-400">{gig.region}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{gig.title}</h3>
            <p className="text-xs text-gray-500">{gig.org} · {gig.level}</p>
          </div>
        ))}

        <p className="text-center text-xs text-gray-400 py-4">
          실제 공고는 회원가입 후 확인하세요
        </p>
      </main>

      {/* 하단 탭바 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-inset-bottom">
        <div className="max-w-lg mx-auto flex">
          {[
            { icon: '🏠', label: '홈', href: '/' },
            { icon: '🔍', label: '탐색', href: '/gigs' },
            { icon: '✉️', label: '채팅', href: '/chat' },
            { icon: '👤', label: '내 정보', href: '/profile' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="flex-1 flex flex-col items-center py-3 text-gray-400 hover:text-indigo-600 transition-colors">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs mt-0.5">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
