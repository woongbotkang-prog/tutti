import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import GigOwnerPanel from './GigOwnerPanel'

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
      {/* 헤더 */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 sticky top-0 z-20">
        <Link href="/gigs">
          <button className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </Link>
        <h1 className="font-bold text-gray-900 flex-1 truncate">{gig.title}</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {searchParams.applied === '1' && (
          <div className="rounded-2xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 font-medium">
            ✅ 지원이 완료되었습니다! 결과는 알림으로 안내드릴게요.
          </div>
        )}
        {/* 기본 정보 카드 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              gig.gig_type === 'hiring' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {gig.gig_type === 'hiring' ? '구인' : '구직'}
            </span>
            {gig.is_paid ? (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">유급</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">무급</span>
            )}
          </div>

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

        {/* 모집 현황 */}
        {gig.max_applicants && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">모집 현황</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{gig.current_applicants}명 지원 중</span>
              <span className="text-sm font-bold text-indigo-600">{gig.max_applicants}명 모집</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.min((gig.current_applicants / gig.max_applicants) * 100, 100)}%` }}
              />
            </div>
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
          <GigOwnerPanel gigId={gig.id} applications={applications} />
        )}
      </main>

      {/* 하단 지원 버튼 */}
      {!isOwner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 safe-area-inset-bottom">
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
            ) : gig.status !== 'active' ? (
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
