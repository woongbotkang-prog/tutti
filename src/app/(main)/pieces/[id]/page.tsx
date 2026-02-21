import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export const revalidate = 3600 // ISR: 1시간마다 재검증

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { data: piece } = await supabase
    .from('pieces')
    .select('title, description')
    .eq('id', params.id)
    .single()

  return {
    title: piece ? `${piece.title} | TUTTI` : 'TUTTI',
    description: piece?.description?.slice(0, 150) || '클래식 연주자 매칭 플랫폼',
  }
}

const PERIOD_LABELS: Record<string, string> = {
  'baroque': '바로크',
  'classical': '고전',
  'romantic': '낭만',
  'modern': '근현대',
  'contemporary': '현대',
}

const LEVEL_LABELS: Record<string, string> = {
  'beginner': '입문',
  'elementary': '초급',
  'intermediate': '중급',
  'advanced': '고급',
  'professional': '전문가',
}

export default async function PieceDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  // 곡 정보 조회
  const { data: piece, error } = await supabase
    .from('pieces')
    .select(`
      id, title, composer_id, period, difficulty_level, duration_minutes, description,
      composer:composers(id, name, name_ko),
      piece_tags:piece_tags(
        id,
        tag:tags(id, name, name_ko, category, color_code)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !piece) {
    notFound()
  }

  // 이 곡을 포함하는 공고들 조회
  const { data: relatedGigs } = await supabase
    .from('gig_pieces')
    .select(`
      gig:gigs(
        id, title, status, gig_type, created_at, is_project,
        author:user_profiles!gigs_user_id_fkey(display_name)
      )
    `)
    .eq('piece_id', params.id)
    .order('created_at', { ascending: false })

  const gigs = (relatedGigs ?? [])
    .map((item: any) => item.gig)
    .filter((gig: any) => gig !== null)

  // composers는 배열이므로 첫 번째 요소를 가져옴
  const composer = Array.isArray(piece.composer) ? piece.composer[0] : piece.composer
  const composerName = (composer as any)?.name_ko || (composer as any)?.name || '미상'

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* 헤더 — TUTTI 로고 + 뒤로가기 */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-20">
        <Link href="/">
          <button className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </Link>
        <Link href="/" className="shrink-0">
          <span className="text-lg font-black text-accent tracking-tight">TUTTI</span>
        </Link>
        <h1 className="font-bold text-gray-900 flex-1 truncate text-sm">{piece.title}</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            {piece.period && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cream text-accent">
                {PERIOD_LABELS[piece.period] || piece.period}
              </span>
            )}
            {piece.difficulty_level && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cream text-accent">
                {LEVEL_LABELS[piece.difficulty_level] || piece.difficulty_level}
              </span>
            )}
          </div>

          <h2 className="text-xl font-black text-gray-900 mb-1">{piece.title}</h2>
          {composer && (
            <p className="text-sm text-gray-600 font-medium mb-4">
              {composerName}
            </p>
          )}

          {/* 상세 정보 */}
          <div className="grid grid-cols-2 gap-3">
            {piece.duration_minutes && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">소요 시간</p>
                <p className="text-sm font-medium text-gray-900">{piece.duration_minutes}분</p>
              </div>
            )}
            {piece.difficulty_level && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">난이도</p>
                <p className="text-sm font-medium text-gray-900">{LEVEL_LABELS[piece.difficulty_level]}</p>
              </div>
            )}
            {piece.period && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">시대</p>
                <p className="text-sm font-medium text-gray-900">{PERIOD_LABELS[piece.period]}</p>
              </div>
            )}
          </div>
        </div>

        {/* 곡 설명 */}
        {piece.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">곡 설명</h3>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {piece.description}
            </div>
          </div>
        )}

        {/* 태그 */}
        {piece.piece_tags && piece.piece_tags.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">태그</h3>
            <div className="flex flex-wrap gap-2">
              {piece.piece_tags.map((pt: any) => (
                <span
                  key={pt.id}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border"
                  style={{
                    backgroundColor: pt.tag?.color_code ? `${pt.tag.color_code}20` : '#f3f4f6',
                    borderColor: pt.tag?.color_code || '#d1d5db',
                    color: pt.tag?.color_code || '#6b7280',
                  }}
                >
                  {pt.tag?.name_ko || pt.tag?.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 관련 공고 */}
        {gigs.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">
              이 곡이 포함된 공고 ({gigs.length}개)
            </h3>
            <div className="space-y-2">
              {gigs.map((gig: any) => (
                <Link key={gig.id} href={`/gigs/${gig.id}`}>
                  <div className="flex items-start justify-between p-3 bg-gray-50 rounded-xl hover:bg-cream transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        {gig.is_project ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cream text-accent">
                            프로젝트
                          </span>
                        ) : (
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              gig.gig_type === 'hiring'
                                ? 'bg-cream text-accent'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {gig.gig_type === 'hiring' ? '모집' : '찾기'}
                          </span>
                        )}
                        {gig.status !== 'active' && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-500">
                            {gig.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-900 truncate">{gig.title}</p>
                      <p className="text-xs text-gray-500">{gig.author?.display_name}</p>
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-300 flex-shrink-0 ml-2 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 공고 만들기 CTA */}
        <div className="bg-gradient-to-r from-cream to-cream rounded-2xl border border-cream-dark p-5">
          <p className="text-sm text-gray-700 mb-3">
            이 곡으로 공고를 만들어 연주자를 모집하세요!
          </p>
          <Link href="/gigs/new">
            <Button size="sm" className="w-full bg-ink hover:bg-ink-light">
              새 공고 만들기
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
