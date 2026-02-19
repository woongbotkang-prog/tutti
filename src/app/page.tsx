import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import BottomNavBar from '@/components/BottomNavBar'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: latestGigs } = await supabase
    .from('gigs')
    .select('id, title, gig_type, is_project, piece_name, created_at, region:regions(name)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  // 곡 기반 프로젝트 공고 따로 조회
  const { data: projectGigs } = await supabase
    .from('gigs')
    .select('id, title, piece_name, created_at, region:regions(name)')
    .eq('status', 'active')
    .eq('is_project', true)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white pb-24">
      {/* 헤더 — TUTTI 로고 (항상 좌상단) */}
      <header className="px-6 py-4 flex items-center justify-between max-w-lg mx-auto">
        <Link href="/">
          <span className="text-2xl font-black text-indigo-600 tracking-tight">TUTTI</span>
        </Link>
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
      <section className="px-6 pt-6 pb-8 max-w-lg mx-auto text-center">
        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
          함께 연주할 사람,<br />
          <span className="text-indigo-600">TUTTI에서 찾으세요</span>
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          연주하고 싶은 곡으로 팀을 만들고, 단원을 모집하세요
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
                둘러보기
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

      {/* 곡 기반 프로젝트 — 서비스 핵심 */}
      <section className="max-w-lg mx-auto px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            <span className="text-purple-600">🎼</span> 곡으로 찾기
          </h2>
          <Link href="/gigs?tab=project" className="text-xs text-purple-600 font-medium">
            전체 보기 →
          </Link>
        </div>
        {projectGigs && projectGigs.length > 0 ? (
          <div className="space-y-2.5">
            {projectGigs.map((gig: any) => (
              <Link key={gig.id} href={`/gigs/${gig.id}`}>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-4 hover:shadow-md hover:border-purple-300 transition-all">
                  <p className="text-xs font-bold text-purple-600 mb-1">
                    🎼 {gig.piece_name || '곡 미정'}
                  </p>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug">{gig.title}</h3>
                  {gig.region?.[0]?.name && (
                    <p className="text-xs text-gray-400 mt-1">{gig.region[0].name}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6 text-center">
            <span className="text-3xl mb-2 block">🎼</span>
            <p className="text-sm text-purple-700 font-medium">연주하고 싶은 곡이 있나요?</p>
            <p className="text-xs text-gray-500 mt-1">곡 기반 프로젝트를 올려보세요!</p>
            <Link href="/gigs/new">
              <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">
                프로젝트 만들기
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 빠른 바로가기 — 새 표현 체계 (3분할) */}
      <section className="max-w-lg mx-auto px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <Link href="/gigs?tab=project" className="bg-gradient-to-b from-purple-50 to-white rounded-2xl border border-purple-100 p-4 text-center hover:shadow-md transition-shadow">
            <span className="text-2xl mb-1.5 block">🎼</span>
            <p className="font-bold text-gray-900 text-xs">프로젝트</p>
            <p className="text-[10px] text-gray-500 mt-0.5">곡으로 찾기</p>
          </Link>
          <Link href="/gigs?tab=hiring" className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl mb-1.5 block">🎻</span>
            <p className="font-bold text-gray-900 text-xs">단원 모집</p>
            <p className="text-[10px] text-gray-500 mt-0.5">연주자 찾기</p>
          </Link>
          <Link href="/gigs?tab=seeking" className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl mb-1.5 block">🤝</span>
            <p className="font-bold text-gray-900 text-xs">팀 찾기</p>
            <p className="text-[10px] text-gray-500 mt-0.5">합류할 팀</p>
          </Link>
        </div>
      </section>

      {/* 최신 공고 */}
      <section className="max-w-lg mx-auto px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">최신 공고</h2>
          <Link href="/gigs" className="text-xs text-indigo-600 font-medium">
            전체 보기 →
          </Link>
        </div>
        {latestGigs && latestGigs.length > 0 ? (
          <div className="space-y-2.5">
            {latestGigs.map((gig: any) => (
              <Link key={gig.id} href={`/gigs/${gig.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    {gig.is_project ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        프로젝트
                      </span>
                    ) : (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        gig.gig_type === 'hiring' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {gig.gig_type === 'hiring' ? '단원 모집' : '팀 찾기'}
                      </span>
                    )}
                    {gig.region?.[0]?.name && (
                      <span className="text-xs text-gray-400">{gig.region[0].name}</span>
                    )}
                  </div>
                  {gig.is_project && gig.piece_name && (
                    <p className="text-xs text-purple-600 font-medium mb-0.5">🎼 {gig.piece_name}</p>
                  )}
                  <h3 className="font-bold text-gray-900 text-sm leading-snug">{gig.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
            <span className="text-4xl mb-3 block">🎵</span>
            <p className="text-sm text-gray-500">아직 공고가 없어요.</p>
            <p className="text-sm text-gray-400 mt-1">첫 번째 공고를 올려보세요!</p>
          </div>
        )}
      </section>

      {/* 공통 하단 네비바 */}
      <BottomNavBar />
    </div>
  )
}
