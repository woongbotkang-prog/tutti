import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import BottomNavBar from '@/components/BottomNavBar'
import PieceGroupCard from '@/components/PieceGroupCard'
import WelcomeToast from '@/components/WelcomeToast'
import HomeSearchBar from '@/components/HomeSearchBar'
import ScrollingGigCards from '@/components/ScrollingGigCards'

export const revalidate = 3600 // ISR: 1시간

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 최신 공고 (ensemble_name 포함)
  const { data: latestGigs } = await supabase
    .from('gigs')
    .select(`
      id, title, ensemble_name, piece_name, gig_pieces_count, created_at,
      region:regions(name),
      author:user_profiles!gigs_user_id_fkey(display_name, user_type),
      gig_pieces(id, text_input, piece:pieces(title, period, composer:composers(name_en, name_ko)))
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8)

  // 곡 중심 통계: distinct piece count
  const { count: piecesCount } = await supabase
    .from('gig_pieces')
    .select('piece_id', { count: 'exact', head: true })

  // 활성 공고 수 (팀 모집 중)
  const { count: activeGigsCount } = await supabase
    .from('gigs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  // 전체 사용자 수
  const { count: usersCount } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  // 인기 작곡가 상위 5명 (gig_pieces와 JOIN)
  const { data: popularComposers } = await supabase
    .from('gig_pieces')
    .select('piece:pieces(composer:composers(name_ko, name_en))')
    .not('piece_id', 'is', null)
    .limit(100)

  // 지금 모집 중인 곡: 곡별 활성 팀 그룹핑
  const { data: rawGigPieces } = await supabase
    .from('gig_pieces')
    .select(`
      piece_id,
      gig:gigs!inner(id, title, status,
        region:regions(name),
        author:user_profiles!gigs_user_id_fkey(display_name)
      ),
      piece:pieces!inner(id, title, period,
        composer:composers(name_ko, name_en)
      )
    `)
    .not('piece_id', 'is', null)
    .eq('gig.status', 'active')

  const pieceGroupMap: Record<string, any> = {}
  for (const gp of (rawGigPieces || []) as any[]) {
    const pid = gp.piece_id
    if (!pieceGroupMap[pid]) {
      pieceGroupMap[pid] = {
        piece_id: pid,
        piece_title: gp.piece?.title || '',
        composer_name_ko: gp.piece?.composer?.name_ko || null,
        composer_name_en: gp.piece?.composer?.name_en || null,
        period: gp.piece?.period || null,
        team_count: 0,
        teams: [],
      }
    }
    const gig = gp.gig
    if (!pieceGroupMap[pid].teams.some((t: any) => t.gig_id === gig.id)) {
      pieceGroupMap[pid].teams.push({
        gig_id: gig.id,
        gig_title: gig.title,
        author_name: gig.author?.display_name || null,
        region_name: Array.isArray(gig.region) ? gig.region[0]?.name || null : gig.region?.name || null,
      })
      pieceGroupMap[pid].team_count++
    }
  }
  const groupedPieces = Object.values(pieceGroupMap)
    .sort((a: any, b: any) => b.team_count - a.team_count)
    .slice(0, 7)

  // 작곡가 빈도 집계
  const composerCounts: Record<string, { name_ko: string; name_en: string; count: number }> = {}
  if (popularComposers) {
    for (const gp of popularComposers as any[]) {
      const composer = gp.piece?.composer
      if (composer?.name_en) {
        const key = composer.name_en
        if (!composerCounts[key]) {
          composerCounts[key] = { name_ko: composer.name_ko || '', name_en: composer.name_en, count: 0 }
        }
        composerCounts[key].count++
      }
    }
  }
  const topComposers = Object.values(composerCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // 프로필 미완성 체크 (로그인 시)
  let isProfileIncomplete = false
  if (user) {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('display_name, bio')
      .eq('id', user.id)
      .single()
    if (!profile || !profile.display_name || !profile.bio) {
      isProfileIncomplete = true
    }
  }

  // 작곡가명 추출 헬퍼 (최근 등록 카드용)
  const getComposerName = (gig: any): string | null => {
    const pieces = gig.gig_pieces || []
    if (pieces.length > 0) {
      const composer = pieces[0]?.piece?.composer
      return composer?.name_ko || composer?.name_en || null
    }
    return null
  }

  // 곡 제목 추출 헬퍼 (최근 등록 카드용)
  const getPieceTitle = (gig: any): string => {
    const pieces = gig.gig_pieces || []
    if (pieces.length > 0) {
      return pieces[0]?.piece?.title || pieces[0]?.text_input || gig.piece_name || gig.title
    }
    return gig.piece_name || gig.title
  }

  // ── 비로그인 랜딩 페이지 ──────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="min-h-screen bg-cream">
        {/* 헤더 */}
        <header className="px-6 py-4 max-w-lg mx-auto flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-black text-accent tracking-tight">TUTTI</span>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">로그인</Button>
          </Link>
        </header>

        {/* ① 히어로 섹션 */}
        <section className="px-6 pt-10 pb-10 max-w-lg mx-auto text-center">
          <h1 className="text-[32px] font-black text-ink leading-tight mb-4 whitespace-pre-line">
            {"함께 연주할 사람,\n여기서 만나세요."}
          </h1>
          <p className="text-sm text-gray-500 mb-8 whitespace-pre-line">
            {"클래식 연주자를 위한 매칭 플랫폼.\n곡을 중심으로 팀을 찾고, 바로 연결됩니다."}
          </p>
          <Link href="/login" className="block mx-auto max-w-xs">
            <button className="w-full h-12 bg-accent text-white rounded-xl font-bold text-base hover:bg-accent/90 transition-colors">
              시작하기 →
            </button>
          </Link>
          <p className="text-xs text-gray-400 mt-3">
            이미 계정이 있나요?{' '}
            <Link href="/login" className="text-accent font-medium">
              로그인
            </Link>
          </p>
        </section>

        {/* ② 이렇게 사용해요 섹션 */}
        <section className="px-6 pb-10 max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-ink mb-4">이렇게 사용해요</h2>
          <div className="flex flex-col gap-3">
            <div className="bg-[#fffef9] rounded-2xl border border-[#f0ebe3] p-4">
              <span className="text-2xl">🎵</span>
              <p className="font-bold text-sm mt-2 text-ink">곡을 검색하세요</p>
              <p className="text-xs text-gray-500 mt-1">연주하고 싶은 곡이나 작곡가로 검색</p>
            </div>
            <div className="bg-[#fffef9] rounded-2xl border border-[#f0ebe3] p-4">
              <span className="text-2xl">🎯</span>
              <p className="font-bold text-sm mt-2 text-ink">팀에 지원하세요</p>
              <p className="text-xs text-gray-500 mt-1">맞는 공고를 찾으면 클릭 한 번으로 지원</p>
            </div>
            <div className="bg-[#fffef9] rounded-2xl border border-[#f0ebe3] p-4">
              <span className="text-2xl">💬</span>
              <p className="font-bold text-sm mt-2 text-ink">함께 연주하세요</p>
              <p className="text-xs text-gray-500 mt-1">수락되면 채팅방이 자동으로 열립니다</p>
            </div>
          </div>
        </section>

        {/* ③ 지금 모집 중 섹션 (자동 스크롤 마키) */}
        {groupedPieces.length > 0 && (
          <section className="pb-10">
            <div className="px-6 max-w-lg mx-auto mb-4">
              <h2 className="text-lg font-bold text-ink">지금 모집 중인 공고</h2>
            </div>
            <ScrollingGigCards cards={groupedPieces as any} />
          </section>
        )}

        {/* ④ 숫자로 보는 TUTTI */}
        <section className="max-w-lg mx-auto px-6 pb-10">
          <h2 className="text-lg font-bold text-ink mb-3">숫자로 보는 TUTTI</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className="text-xl font-black text-accent">{piecesCount || 0}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">등록된 곡</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className="text-xl font-black text-accent">{activeGigsCount || 0}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">모집 중인 팀</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className="text-xl font-black text-accent">{usersCount || 0}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">연주자</p>
            </div>
          </div>
        </section>

        {/* ⑤ 마지막 CTA 섹션 */}
        <section className="px-6 pb-12 max-w-lg mx-auto">
          <div className="bg-[#1a1a1a] rounded-2xl px-6 py-8 text-center">
            <p className="text-sm text-[#faf8f5] mb-4">연주자 동료를 찾고 있다면</p>
            <Link href="/login">
              <button className="bg-accent text-white rounded-xl px-8 py-3 font-bold text-sm hover:bg-accent/90 transition-colors">
                무료로 시작하기
              </button>
            </Link>
            <p className="text-xs text-gray-400 mt-4">가입은 30초면 됩니다 ✨</p>
          </div>
        </section>

        {/* 푸터 */}
        <footer className="bg-[#fffef9] border-t border-[#f0ebe3]">
          <div className="max-w-lg mx-auto px-6 py-6 text-center">
            <span className="text-xl font-black text-accent tracking-tight">TUTTI</span>
            <p className="text-[11px] text-gray-400 mt-3">© 2026 TUTTI. 클래식 연주자 매칭</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <Link href="/terms" className="text-[11px] text-gray-400">이용약관</Link>
              <span className="text-gray-200">·</span>
              <Link href="/privacy" className="text-[11px] text-gray-400">개인정보처리방침</Link>
              <span className="text-gray-200">·</span>
              <a href="mailto:support@tutti.music" className="text-[11px] text-gray-400">
                문의: support@tutti.music
              </a>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // ── 로그인 대시보드 ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-cream pb-24">
      <Suspense fallback={null}><WelcomeToast /></Suspense>

      {/* 헤더 */}
      <header className="px-6 py-4 max-w-lg mx-auto flex items-center justify-between">
        <Link href="/">
          <span className="text-2xl font-black text-accent tracking-tight">TUTTI</span>
        </Link>
        <Link href="/profile">
          <div className="w-9 h-9 rounded-full bg-cream flex items-center justify-center text-accent font-bold text-sm">
            나
          </div>
        </Link>
      </header>

      {/* 히어로 — 검색 바 */}
      <section className="px-6 pt-6 pb-8 max-w-lg mx-auto text-center">
        <h1 className="text-[28px] font-black text-ink leading-tight mb-6">
          함께 연주할 동료를 찾으세요
        </h1>
        <HomeSearchBar popularComposers={topComposers} />
      </section>

      {/* 프로필 미완성 배너 */}
      {isProfileIncomplete && (
        <section className="max-w-lg mx-auto px-6 pb-4">
          <Link href="/profile/edit">
            <div className="bg-[#fdf8ee] border border-[#f0e6d3] rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-[13px] text-[#7a6b50]">
                프로필을 완성하면 맞춤 추천을 받을 수 있어요
              </span>
              <span className="text-[13px] text-accent font-semibold">→</span>
            </div>
          </Link>
        </section>
      )}

      {/* 지금 모집 중인 곡 */}
      {groupedPieces.length > 0 && (
        <section className="max-w-lg mx-auto px-6 pb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-ink">🎼 지금 모집 중인 곡</h2>
            <Link href="/gigs" className="text-xs text-accent font-medium">
              전체 보기 →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {groupedPieces.map((piece: any) => (
              <PieceGroupCard key={piece.piece_id} piece={piece} />
            ))}
          </div>
        </section>
      )}

      {/* 최근 등록 — 수평 스크롤 */}
      {latestGigs && latestGigs.length > 0 && (
        <section className="max-w-lg mx-auto pb-6">
          <div className="flex items-center justify-between mb-3 px-6">
            <h2 className="text-lg font-bold text-ink">최근 등록</h2>
            <Link href="/gigs" className="text-xs text-accent font-medium">
              전체 보기 →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-0 px-6 scrollbar-hide">
            {latestGigs.map((gig: any) => (
              <Link key={gig.id} href={`/gigs/${gig.id}`} className="snap-start shrink-0 w-[260px]">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <p className="text-xs text-gray-500">{getComposerName(gig)}</p>
                  <p className="font-bold text-sm mt-1 line-clamp-2">{getPieceTitle(gig)}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {(gig as any).ensemble_name || gig.author?.display_name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 숫자로 보는 TUTTI */}
      <section className="max-w-lg mx-auto px-6 pb-6">
        <h2 className="text-lg font-bold text-ink mb-3">숫자로 보는 TUTTI</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xl font-black text-accent">{piecesCount || 0}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">등록된 곡</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xl font-black text-accent">{activeGigsCount || 0}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">모집 중인 팀</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xl font-black text-accent">{usersCount || 0}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">연주자</p>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-warm-white border-t border-[#f0ebe3] mt-8">
        <div className="max-w-lg mx-auto px-6 py-6 text-center">
          <span className="text-xl font-black text-accent tracking-tight">TUTTI</span>
          <p className="text-[11px] text-gray-400 mt-3">© 2026 TUTTI. 클래식 연주자 매칭</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <Link href="/terms" className="text-[11px] text-gray-400">이용약관</Link>
            <span className="text-gray-200">·</span>
            <Link href="/privacy" className="text-[11px] text-gray-400">개인정보처리방침</Link>
            <span className="text-gray-200">·</span>
            <a href="mailto:support@tutti.music" className="text-[11px] text-gray-400">
              문의: support@tutti.music
            </a>
          </div>
        </div>
      </footer>

      {/* FAB — 모집 글 쓰기 */}
      <Link href="/gigs/new" className="fixed bottom-24 right-6 z-40">
        <button className="w-14 h-14 rounded-full bg-accent text-white shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-accent/90 transition-colors">
          +
        </button>
      </Link>

      {/* 공통 하단 네비바 */}
      <BottomNavBar />
    </div>
  )
}
