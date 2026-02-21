import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import BottomNavBar from '@/components/BottomNavBar'
import WelcomeToast from '@/components/WelcomeToast'
import HomeSearchBar from '@/components/HomeSearchBar'

export const revalidate = 3600 // ISR: 1시간

// 색상 상수
const INK = '#1a1a1a'
const ACCENT = '#b8860b'
const CREAM = '#faf8f5'
const WARM_WHITE = '#fffef9'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 최신 공고 (작성자명 포함)
  const { data: latestGigs } = await supabase
    .from('gigs')
    .select(`
      id, title, gig_type, is_project, piece_name, gig_pieces_count, created_at,
      region:regions(name),
      author:user_profiles!gigs_user_id_fkey(display_name, user_type),
      gig_pieces(id, text_input, piece:pieces(title, period, composer:composers(name_en, name_ko)))
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  // 곡 기반 프로젝트 공고 (작성자명 포함)
  const { data: projectGigs } = await supabase
    .from('gigs')
    .select(`
      id, title, piece_name, gig_pieces_count, created_at,
      region:regions(name),
      author:user_profiles!gigs_user_id_fkey(display_name, user_type),
      gig_pieces(id, text_input, piece:pieces(title, period, composer:composers(name_en, name_ko)))
    `)
    .eq('status', 'active')
    .eq('is_project', true)
    .order('created_at', { ascending: false })
    .limit(3)

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

  // 작성자명 추출 헬퍼
  const getAuthorName = (gig: any): string | null => {
    const author = gig.author
    if (!author) return null
    return author.display_name || null
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: CREAM, paddingBottom: '96px' }}>
      <Suspense fallback={null}><WelcomeToast /></Suspense>

      {/* 헤더 */}
      <header style={{ padding: '16px 24px', maxWidth: '512px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/">
          <span style={{ fontSize: '24px', fontWeight: 900, color: ACCENT, letterSpacing: '-0.025em' }}>TUTTI</span>
        </Link>
        {user ? (
          <Link href="/profile">
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f0e6d3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ACCENT, fontWeight: 700, fontSize: '14px' }}>
              나
            </div>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="outline" size="sm">로그인</Button>
          </Link>
        )}
      </header>

      {/* 히어로 — 간소화 + 검색 바 */}
      <section style={{ padding: '24px 24px 32px', maxWidth: '512px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900, color: INK, lineHeight: 1.3, marginBottom: '8px' }}>
          함께 연주할 동료를 찾으세요
        </h1>
        <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
          곡 기반으로 연주자와 앙상블을 연결하는 클래식 음악 플랫폼
        </p>

        {/* 검색 바 */}
        <HomeSearchBar popularComposers={topComposers} />

        {/* CTA 버튼 */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
          <Link href="/gigs/new">
            <button
              style={{
                height: '44px',
                padding: '0 28px',
                borderRadius: '10px',
                backgroundColor: INK,
                color: WARM_WHITE,
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              모집하기
            </button>
          </Link>
          <Link href="/gigs">
            <button
              style={{
                height: '44px',
                padding: '0 28px',
                borderRadius: '10px',
                backgroundColor: WARM_WHITE,
                color: INK,
                fontSize: '14px',
                fontWeight: 600,
                border: `1.5px solid #e5e0d8`,
                cursor: 'pointer',
              }}
            >
              지원하기
            </button>
          </Link>
        </div>
      </section>

      {/* 통계 배너 — 곡 중심 */}
      <section style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px 24px' }}>
        <div style={{ backgroundColor: WARM_WHITE, borderRadius: '16px', padding: '16px', border: '1px solid #f0ebe3' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', textAlign: 'center' }}>
            <div>
              <p style={{ fontSize: '20px', fontWeight: 900, color: INK }}>{piecesCount || 0}</p>
              <p style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>곡 연주 중</p>
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: 900, color: INK }}>{activeGigsCount || 0}</p>
              <p style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>팀 모집 중</p>
            </div>
            <div>
              <p style={{ fontSize: '20px', fontWeight: 900, color: INK }}>{usersCount || 0}</p>
              <p style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>명 활동 중</p>
            </div>
          </div>
        </div>
      </section>

      {/* 프로필 미완성 배너 */}
      {user && isProfileIncomplete && (
        <section style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px 16px' }}>
          <Link href="/profile/edit" style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#fdf8ee',
              border: '1px solid #f0e6d3',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '13px', color: '#7a6b50' }}>
                프로필을 완성하면 맞춤 추천을 받을 수 있어요
              </span>
              <span style={{ fontSize: '13px', color: ACCENT, fontWeight: 600 }}>→</span>
            </div>
          </Link>
        </section>
      )}

      {/* 곡 기반 프로젝트 */}
      <section style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: INK }}>
            곡 기반 프로젝트
          </h2>
          <Link href="/gigs?tab=project" style={{ fontSize: '12px', color: ACCENT, fontWeight: 500, textDecoration: 'none' }}>
            전체 보기 →
          </Link>
        </div>
        {projectGigs && projectGigs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {projectGigs.map((gig: any) => {
              const pieceNames = getPieceNames(gig)
              const periods = getPeriodTags(gig)
              const authorName = getAuthorName(gig)
              return (
                <Link key={gig.id} href={`/gigs/${gig.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    backgroundColor: WARM_WHITE,
                    borderRadius: '16px',
                    border: '1px solid #f0ebe3',
                    padding: '16px',
                    transition: 'box-shadow 0.2s',
                  }}>
                    {pieceNames.length > 0 && (
                      <div style={{ marginBottom: '6px' }}>
                        {pieceNames.slice(0, 3).map((name: string, i: number) => (
                          <p key={i} style={{ fontSize: '12px', fontWeight: 700, color: ACCENT }}>
                            {name}
                          </p>
                        ))}
                        {pieceNames.length > 3 && (
                          <p style={{ fontSize: '12px', color: '#c4a35a' }}>+{pieceNames.length - 3}곡</p>
                        )}
                      </div>
                    )}
                    <h3 style={{ fontWeight: 700, color: INK, fontSize: '14px', lineHeight: 1.4 }}>{gig.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {periods.map((p: string) => (
                        <span key={p} style={{
                          fontSize: '10px',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          backgroundColor: '#f5eedf',
                          color: '#8a7650',
                          fontWeight: 500,
                        }}>
                          #{periodKo[p] || p}
                        </span>
                      ))}
                      {(gig as any).region?.[0]?.name && (
                        <span style={{ fontSize: '12px', color: '#bbb' }}>{(gig as any).region[0].name}</span>
                      )}
                      {authorName && (
                        <span style={{ fontSize: '11px', color: '#aaa' }}>by {authorName}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{
            backgroundColor: WARM_WHITE,
            borderRadius: '16px',
            border: '1px solid #f0ebe3',
            padding: '24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '14px', color: '#8a7650', fontWeight: 500 }}>연주하고 싶은 곡이 있나요?</p>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>곡 기반 프로젝트를 올려보세요!</p>
            <Link href="/gigs/new?mode=project">
              <button style={{
                marginTop: '12px',
                height: '36px',
                padding: '0 20px',
                borderRadius: '8px',
                backgroundColor: INK,
                color: WARM_WHITE,
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}>
                프로젝트 만들기
              </button>
            </Link>
          </div>
        )}
      </section>

      {/* 최신 공고 */}
      <section style={{ maxWidth: '512px', margin: '0 auto', padding: '0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: INK }}>최신 공고</h2>
          <Link href="/gigs" style={{ fontSize: '12px', color: ACCENT, fontWeight: 500, textDecoration: 'none' }}>
            전체 보기 →
          </Link>
        </div>
        {latestGigs && latestGigs.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {latestGigs.map((gig: any) => {
              const pieceNames = getPieceNames(gig)
              const periods = getPeriodTags(gig)
              const authorName = getAuthorName(gig)
              return (
                <Link key={gig.id} href={`/gigs/${gig.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    backgroundColor: '#fff',
                    borderRadius: '16px',
                    border: '1px solid #f0ebe3',
                    padding: '16px',
                    transition: 'box-shadow 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {gig.is_project ? (
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                          borderRadius: '20px', backgroundColor: '#f5eedf', color: '#8a7650',
                        }}>
                          곡 기반 프로젝트
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '11px', fontWeight: 700, padding: '2px 8px',
                          borderRadius: '20px',
                          backgroundColor: gig.gig_type === 'hiring' ? '#eef0f7' : '#eef7f0',
                          color: gig.gig_type === 'hiring' ? '#4a5578' : '#3d6b4f',
                        }}>
                          {gig.gig_type === 'hiring' ? '연주자 모집' : '팀 찾기'}
                        </span>
                      )}
                      {(gig as any).region?.[0]?.name && (
                        <span style={{ fontSize: '12px', color: '#bbb' }}>{(gig as any).region[0].name}</span>
                      )}
                    </div>
                    {pieceNames.length > 0 && (
                      <p style={{ fontSize: '12px', color: ACCENT, fontWeight: 500, marginBottom: '2px' }}>
                        {pieceNames.slice(0, 2).join(' / ')}
                        {pieceNames.length > 2 ? ` +${pieceNames.length - 2}곡` : ''}
                      </p>
                    )}
                    <h3 style={{ fontWeight: 700, color: INK, fontSize: '14px', lineHeight: 1.4 }}>{gig.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {periods.map((p: string) => (
                        <span key={p} style={{
                          fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                          backgroundColor: '#f5f3ef', color: '#8a8070',
                        }}>
                          #{periodKo[p] || p}
                        </span>
                      ))}
                      {authorName && (
                        <span style={{ fontSize: '11px', color: '#aaa' }}>by {authorName}</span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            border: '1px solid #f0ebe3',
            padding: '32px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '14px', color: '#999' }}>아직 공고가 없어요.</p>
            <p style={{ fontSize: '13px', color: '#bbb', marginTop: '4px' }}>첫 번째 공고를 올려보세요!</p>
          </div>
        )}
      </section>

      {/* 푸터 */}
      <footer style={{ backgroundColor: WARM_WHITE, borderTop: '1px solid #f0ebe3', marginTop: '32px' }}>
        <div style={{ maxWidth: '512px', margin: '0 auto', padding: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '20px', fontWeight: 900, color: ACCENT, letterSpacing: '-0.025em' }}>TUTTI</span>
          <p style={{ fontSize: '11px', color: '#999', marginTop: '12px' }}>© 2026 TUTTI. 클래식 연주자 매칭</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
            <Link href="/terms" style={{ fontSize: '11px', color: '#aaa', textDecoration: 'none' }}>
              이용약관
            </Link>
            <span style={{ color: '#ddd' }}>·</span>
            <Link href="/privacy" style={{ fontSize: '11px', color: '#aaa', textDecoration: 'none' }}>
              개인정보처리방침
            </Link>
            <span style={{ color: '#ddd' }}>·</span>
            <a href="mailto:support@tutti.music" style={{ fontSize: '11px', color: '#aaa', textDecoration: 'none' }}>
              문의: support@tutti.music
            </a>
          </div>
        </div>
      </footer>

      {/* 공통 하단 네비바 */}
      <BottomNavBar />
    </div>
  )
}
