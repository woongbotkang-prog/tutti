import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import GigOwnerPanel from './GigOwnerPanel'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { data: gig } = await supabase
    .from('gigs')
    .select('title, description')
    .eq('id', params.id)
    .single()

  return {
    title: gig ? `${gig.title} | TUTTI` : 'TUTTI',
    description: gig?.description?.slice(0, 150) || '클래식 연주자 매칭 플랫폼',
  }
}

const LEVEL_LABELS: Record<string, string> = {
  beginner: '입문',
  elementary: '초급',
  intermediate: '중급',
  advanced: '고급',
  professional: '전문가',
}

export default async function GigDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { applied?: string } }) {
  const supabase = await createClient()

  const { data: gig, error } = await supabase
    .from('gigs')
    .select(`
      *,
      author:user_profiles!gigs_user_id_fkey(id, display_name, avatar_url, manner_temperature),
      region:regions(id, name),
      instruments:gig_instruments(
        id, count_needed, notes,
        instrument:instruments(id, name)
      ),
      gig_pieces:gig_pieces(
        id, piece_id, text_input, order_index, notes,
        piece:pieces(id, title, period,
          composer:composers(name_ko, name_en)
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !gig) {
    notFound()
  }

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === gig.user_id

  // 지원 여부 확인
  let hasApplied = false
  if (user && !isOwner) {
    const { data: application } = await supabase
      .from('applications')
      .select('id')
      .eq('gig_id', params.id)
      .eq('applicant_id', user.id)
      .single()
    hasApplied = !!application
  }

  // 작성자인 경우 지원자 목록 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let applications: any[] = []
  if (isOwner) {
    const { data: apps } = await supabase
      .from('applications')
      .select(`
        id, status, message, applied_at,
        applicant:user_profiles!applications_applicant_id_fkey(
          id, display_name, avatar_url, manner_temperature,
          region:regions(name)
        )
      `)
      .eq('gig_id', params.id)
      .order('applied_at', { ascending: false })
    applications = apps || []
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      {/* 헤더 — TUTTI 로고 + 뒤로가기 */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-20">
        <Link href="/gigs">
          <button className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </Link>
        <Link href="/" className="shrink-0">
          <span className="text-lg font-black text-indigo-600 tracking-tight">TUTTI</span>
        </Link>
        <h1 className="font-bold text-gray-900 flex-1 truncate text-sm">{gig.title}</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {(gig.status === 'closed' || gig.status === 'expired' || (gig.expires_at && new Date(gig.expires_at) < new Date())) && (
          <div className="bg-gray-100 border border-gray-200 rounded-2xl p-3 text-center">
            <p className="text-sm text-gray-500 font-medium">마감된 공고입니다</p>
          </div>
        )}
        {searchParams.applied === '1' && (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 font-medium">
            ✅ 지원이 완료되었습니다! 결과는 알림으로 안내드릴게요.
          </div>
        )}
        {/* 이미지 갤러리 */}
        {gig.image_urls && gig.image_urls.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {gig.image_urls.map((url: string, idx: number) => (
              <div key={idx} className="shrink-0 w-48 h-36 rounded-2xl overflow-hidden border border-gray-100">
                <img src={url} alt={`공고 사진 ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            {gig.is_project ? (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">프로젝트</span>
            ) : (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                gig.gig_type === 'hiring' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
              }`}>
                {gig.gig_type === 'hiring' ? '연주자 모집' : '팀 찾기'}
              </span>
            )}
          </div>

          {/* 연주 곡목 */}
          {gig.gig_pieces && gig.gig_pieces.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-4 py-3 mb-3">
              <p className="text-xs font-bold text-purple-500 mb-2">연주 곡목</p>
              <div className="space-y-1.5">
                {gig.gig_pieces
                  .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0))
                  .map((gp: any, idx: number) => (
                    <div key={gp.id} className="flex items-start gap-2">
                      <span className="text-xs font-bold text-purple-400 mt-0.5 w-4">{idx + 1}</span>
                      <div>
                        <p className="text-sm font-bold text-purple-700">
                          {gp.piece?.title || gp.text_input}
                        </p>
                        {(gp.piece?.composer?.name_ko || gp.piece?.composer?.name_en) && (
                          <p className="text-xs text-purple-500">{gp.piece.composer.name_ko || gp.piece.composer.name_en}</p>
                        )}
                        {gp.piece?.period && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-200/50 text-purple-600 inline-block mt-0.5">
                            #{({'baroque':'바로크','classical':'고전','romantic':'낭만','modern':'근현대','contemporary':'현대'} as Record<string,string>)[gp.piece.period] || gp.piece.period}
                          </span>
                        )}
                        {gp.notes && <p className="text-xs text-purple-400 mt-0.5">{gp.notes}</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {/* Fallback for legacy single piece_name */}
          {(!gig.gig_pieces || gig.gig_pieces.length === 0) && gig.is_project && gig.piece_name && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-3 py-2 mb-2">
              <p className="text-sm font-bold text-purple-700">🎼 {gig.piece_name}</p>
            </div>
          )}
          <h2 className="text-xl font-black text-gray-900 mb-1">{gig.title}</h2>
          {gig.author && (
            <p className="text-sm text-gray-600 font-medium mb-4">{gig.author.display_name}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '악기', value: gig.instruments?.map((gi: { instrument: { name: string } | null }) => gi.instrument?.name).filter(Boolean).join(', ') || '미지정' },
              { label: '실력', value: gig.min_skill_level ? LEVEL_LABELS[gig.min_skill_level] || gig.min_skill_level : '제한없음' },
              { label: '지역', value: gig.region?.name || (gig.is_online ? '온라인' : '미지정') },
              { label: '연주일', value: gig.event_date || (gig.event_date_flexible ? '협의' : '미정') },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-gray-900">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 모집 현황 — 파트별 구분 */}
        {(gig.max_applicants || (gig.instruments && gig.instruments.length > 0)) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">모집 현황</h3>

            {/* 파트별 모집 인원 */}
            {gig.instruments && gig.instruments.length > 0 && (
              <div className="space-y-2 mb-3">
                {gig.instruments.map((gi: { id: string; instrument: { id: string; name: string } | null; count_needed: number; notes: string | null }) => (
                  <div key={gi.id} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">
                      {gi.instrument?.name || '미지정'}
                    </span>
                    <span className="text-sm font-bold text-indigo-600">
                      {gi.count_needed}명
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 전체 현황 바 */}
            {gig.max_applicants && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{gig.current_applicants}명 지원 중</span>
                  <span className="text-xs font-bold text-indigo-600">총 {gig.max_applicants}명 모집</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${Math.min((gig.current_applicants / gig.max_applicants) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* 상세 설명 */}
        {gig.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">공고 내용</h3>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {gig.description}
            </div>
          </div>
        )}

        {/* 연습 정보 */}
        {gig.rehearsal_info && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">연습 정보</h3>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{gig.rehearsal_info}</p>
          </div>
        )}

        {/* 보수 */}
        {gig.compensation && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-2">보수</h3>
            <p className="text-sm text-gray-700">{gig.compensation}</p>
          </div>
        )}

        {/* 작성자 관리 패널 */}
        {isOwner && (
          <GigOwnerPanel gigId={gig.id} gigTitle={gig.title} applications={applications} />
        )}
      </main>

      {/* 하단 지원 버튼 — 바텀 네비게이션 바 위에 위치 */}
      {!isOwner && (
        <div className="fixed bottom-[60px] left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
          <div className="max-w-lg mx-auto">
            {!user ? (
              <Link href={`/login?next=/gigs/${params.id}`}>
                <Button size="full" className="bg-indigo-600 hover:bg-indigo-700">
                  로그인 후 지원하기
                </Button>
              </Link>
            ) : hasApplied ? (
              <Button size="full" disabled className="bg-gray-300 text-gray-600 cursor-not-allowed">
                이미 지원한 공고입니다
              </Button>
            ) : gig.status !== 'active' || (gig.expires_at && new Date(gig.expires_at) < new Date()) ? (
              <Button size="full" disabled className="bg-gray-300 text-gray-600 cursor-not-allowed">
                마감된 공고입니다
              </Button>
            ) : (
              <Link href={`/gigs/${params.id}/apply`}>
                <Button size="full" className="bg-indigo-600 hover:bg-indigo-700">
                  지원하기
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
