import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import BottomNavBar from '@/components/BottomNavBar'
import MatchingRecommendations from '@/components/MatchingRecommendations'

export const revalidate = 3600 // ISR: 1시간

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 최신 공고 (gig_pieces를 left join하여 곡 정보 포함)
  const { data: latestGigs } = await supabase
    .from('gigs')
    .select(`
      id, title, gig_type, is_project, piece_name, gig_pieces_count, created_at,
      region:regions(name),
      gig_pieces(id, text_input, piece:pieces(title, period, composer:composers(name_en, name_ko)))
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  // 곡 기반 프로젝트 공고
  const { data: projectGigs } = await supabase
    .from('gigs')
    .select(`
      id, title, piece_name, gig_pieces_count, created_at,
      region:regions(name),
      gig_pieces(id, text_input, piece:pieces(title, period, composer:composers(name_en, name_ko)))
    `)
    .eq('status', 'active')
    .eq('is_project', true)
    .order('created_at', { ascending: false })
    .limit(3)

  // 플랫폼 통계 - 활성 공고 수
  const { count: activeGigsCount } = await supabase
    .from('gigs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // 플랫폼 통계 - 전체 사용자 수
  const { count: usersCount } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  // 플랫폼 통계 - 성공한 매칭 수 (accepted applications)
  const { count: successfulMatchesCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'accepted')

  // 인기 연주자 (manner_temperature 기준 상위 3명)
  const { data: topMusicians } = await supabase
    .from('user_profiles')
    .select(`
      id, display_name, avatar_url, manner_temperature, user_type,
      instruments:user_instruments(
        instrument:instruments(name)
      )
    `)
    .eq('user_type', 'individual')
    .order('manner_temperature', { ascending: false })
    .limit(3)

  // 곡 이름 추출 헬퍼
  const getPieceNames = (gig: any): string[] => {
    const pieces = gig.gig_pieces || []
    if (pieces.length > 0) {
      return pieces.map((gp: any) => gp.piece?.title || gp.text_input).filter(Boolean)
    }
    return gig.piece_name ? [gig.piece_name] : []
  }

  // 시대 태그 추출 헬퍼
  const getPeriodTags = (gig: any): string[] => {
    const pieces = gig.gig_pieces || []
    return [...new Set(pieces.map((gp: any) => gp.piece?.period).filter(Boolean))] as string[]
  }

  const periodKo: Record<string, string> = {
    baroque: '바로크', classical: '고전', romantic: '낭만',
    modern: '근현대', contemporary: '현대'
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white pb-24">
      {/* 헤더 */}
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

      {/* 히어로 — 곡 기반 매칭 정체성 1초 내 전달 */}
      <section className="px-6 pt-6 pb-8 max-w-lg mx-auto text-center">
        <h1 className="text-3xl font-black text-gray-900 leading-tight mb-3">
          연주할 곡으로<br />
          <span className="text-indigo-600">팀을 만드세요</span>
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          곡 기반으로 연주자와 앙상블을 매칭하는 클래식 음악 플랫폼
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

      {/* 플랫폼 통계 배너 */}
      <section className="max-w-lg mx-auto px-6 pb-6">
        <div className="bg-gray-100 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-black text-gray-900">{activeGigsCount || 0}</p>
              <p className="text-xs text-gray-600 mt-1">활성 공고</p>
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">{usersCount || 0}</p>
              <p className="text-xs text-gray-600 mt-1">연주자</p>
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">{successfulMatchesCount || 0}</p>
              <p className="text-xs text-gray-600 mt-1">성공한 매칭</p>
            </div>
          </div>
        </div>
      </section>

      {/* 빠른 시작 3분할 — 워딩 통일 적용 */}
      <section className="max-w-lg mx-auto px-6 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <Link href="/gigs/new" className="bg-gradient-to-b from-purple-50 to-white rounded-2xl border border-purple-100 p-4 text-center hover:shadow-md transition-shadow">
            <span className="text-2xl mb-1.5 block">📣</span>
            <p className="font-bold text-gray-900 text-xs">모집하기</p>
            <p className="text-[10px] text-gray-500 mt-0.5">팀원 구하기</p>
          </Link>
          <Link href="/gigs?tab=seeking" className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl mb-1.5 block">🙋</span>
            <p className="font-bold text-gray-900 text-xs">지원하기</p>
            <p className="text-[10px] text-gray-500 mt-0.5">팀에 합류하기</p>
          </Link>
          <Link href="/gigs" className="bg-white rounded-2xl border border-gray-100 p-4 text-center shadow-sm hover:shadow-md transition-shadow">
            <span className="text-2xl mb-1.5 block">🔍</span>
            <p className="font-bold text-gray-900 text-xs">둘러보기</p>
            <p className="text-[10px] text-gray-500 mt-0.5">공고 탐색하기</p>
          </Link>
        </div>
      </section>

      {/* 나를 위한 추천 공고 — 로그인 사용자만 표시 */}
      {user && (
        <section className="max-w-lg mx-auto px-6 pb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            <span className="text-indigo-600">✨</span> 나를 위한 추천 공고
          </h2>
          <MatchingRecommendations />
        </section>
      )}

      {/* 곡 기반 프로젝트 — 서비스 핵심 (곡명+태그 강화) */}
      <section className="max-w-lg mx-auto px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            <span className="text-purple-600">🎼</span> 곡 기반 프로젝트
          </h2>
          <Link href="/gigs?tab=project" className="text-xs text-purple-600 font-medium">
            전체 보기 →
          </Link>
        </div>
        {projectGigs && projectGigs.length > 0 ? (
          <div className="space-y-2.5">
            {projectGigs.map((gig: any) => {
              const pieceNames = getPieceNames(gig)
              const periods = getPeriodTags(gig)
              return (
                <Link key={gig.id} href={`/gigs/${gig.id}`}>
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-4 hover:shadow-md hover:border-purple-300 transition-all">
                    {/* 곡 목록 */}
                    {pieceNames.length > 0 && (
                      <div className="mb-1.5">
                        {pieceNames.slice(0, 3).map((name: string, i: number) => (
                          <p key={i} className="text-xs font-bold text-purple-600">
                            🎼 {name}
                          </p>
                        ))}
                        {pieceNames.length > 3 && (
                          <p className="text-xs text-purple-400">+{pieceNames.length - 3}곡</p>
                        )}
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{gig.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      {/* 시대 태그 칩 */}
                      {periods.map((p: string) => (
                        <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                          #{periodKo[p] || p}
                        </span>
                      ))}
                      {gig.region?.[0]?.name && (
                        <span className="text-xs text-gray-400">{gig.region[0].name}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6 text-center">
            <span className="text-3xl mb-2 block">🎼</span>
            <p className="text-sm text-purple-700 font-medium">연주하고 싶은 곡이 있나요?</p>
            <p className="text-xs text-gray-500 mt-1">곡 기반 프로젝트를 올려보세요!</p>
            <Link href="/gigs/new?mode=project">
              <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">
                프로젝트 만들기
              </Button>
            </Link>
          </div>
        )}
      </section>

      {/* 최신 공고 (곡명+태그 표시 강화) */}
      <section className="max-w-lg mx-auto px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">최신 공고</h2>
          <Link href="/gigs" className="text-xs text-indigo-600 font-medium">
            전체 보기 →
          </Link>
        </div>
        {latestGigs && latestGigs.length > 0 ? (
          <div className="space-y-2.5">
            {latestGigs.map((gig: any) => {
              const pieceNames = getPieceNames(gig)
              const periods = getPeriodTags(gig)
              return (
                <Link key={gig.id} href={`/gigs/${gig.id}`}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                    <div className="flex items-center gap-2 mb-1">
                      {gig.is_project ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          곡 기반 프로젝트
                        </span>
                      ) : (
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          gig.gig_type === 'hiring' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {gig.gig_type === 'hiring' ? '연주자 모집' : '팀 찾기'}
                        </span>
                      )}
                      {gig.region?.[0]?.name && (
                        <span className="text-xs text-gray-400">{gig.region[0].name}</span>
                      )}
                    </div>
                    {/* 곡 정보 표시 */}
                    {pieceNames.length > 0 && (
                      <p className="text-xs text-purple-600 font-medium mb-0.5">
                        🎼 {pieceNames.slice(0, 2).join(' / ')}
                        {pieceNames.length > 2 ? ` +${pieceNames.length - 2}곡` : ''}
                      </p>
                    )}
                    <h3 className="font-bold text-gray-900 text-sm leading-snug">{gig.title}</h3>
                    {/* 시대 태그 */}
                    {periods.length > 0 && (
                      <div className="flex gap-1 mt-1.5">
                        {periods.map((p: string) => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                            #{periodKo[p] || p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm text-center">
            <span className="text-4xl mb-3 block">🎵</span>
            <p className="text-sm text-gray-500">아직 공고가 없어요.</p>
            <p className="text-sm text-gray-400 mt-1">첫 번째 공고를 올려보세요!</p>
          </div>
        )}
      </section>

      {/* 인기 연주자 소개 */}
      <section className="max-w-lg mx-auto px-6 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            <span className="text-amber-600">⭐</span> 인기 연주자
          </h2>
          <Link href="/musicians" className="text-xs text-amber-600 font-medium">
            연주자 더 보기 →
          </Link>
        </div>
        {topMusicians && topMusicians.length > 0 ? (
          <div className="space-y-3">
            {topMusicians.map((musician: any) => (
              <Link key={musician.id} href={`/musicians/${musician.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-amber-200 transition-all">
                  <div className="flex items-start gap-3">
                    {musician.avatar_url ? (
                      <img
                        src={musician.avatar_url}
                        alt={musician.display_name}
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-lg">
                        🎻
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm">{musician.display_name}</h3>
                      {musician.instruments && musician.instruments.length > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {musician.instruments.slice(0, 2).map((ui: any) => ui.instrument?.name).filter(Boolean).join(', ')}
                          {musician.instruments.length > 2 ? ` 외 ${musician.instruments.length - 2}가지` : ''}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`text-xs font-black ${
                          musician.manner_temperature >= 40 ? 'text-orange-500' : musician.manner_temperature >= 37 ? 'text-green-500' : 'text-blue-500'
                        }`}>
                          {musician.manner_temperature.toFixed(1)}°
                        </span>
                        <p className="text-[10px] text-gray-400">매너온도</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
            <span className="text-3xl mb-2 block">🎻</span>
            <p className="text-sm text-gray-500">연주자를 찾을 수 없어요.</p>
          </div>
        )}
      </section>

      {/* 푸터 */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-8">
        <div className="max-w-lg mx-auto px-6 py-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <span className="text-xl font-black text-indigo-600 tracking-tight">TUTTI</span>
            </div>
            <p className="text-xs text-gray-500">© 2026 TUTTI. 클래식 연주자 매칭</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                이용약관
              </Link>
              <span className="text-gray-300">·</span>
              <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                개인정보처리방침
              </Link>
              <span className="text-gray-300">·</span>
              <a href="mailto:support@tutti.music" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                문의: support@tutti.music
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* 공통 하단 네비바 */}
      <BottomNavBar />
    </div>
  )
}
