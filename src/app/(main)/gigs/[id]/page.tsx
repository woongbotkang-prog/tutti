import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

const LEVEL_LABELS: Record<string, string> = {
  beginner: '입문', elementary: '초급', intermediate: '중급', advanced: '고급', professional: '전문가',
}

export default async function GigDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: gig, error } = await supabase
    .from('gigs')
    .select(`
      *,
      author:user_profiles!gigs_user_id_fkey(id, display_name, avatar_url, manner_temperature),
      region:regions(name),
      instruments:gig_instruments(
        id, count_needed,
        instrument:instruments(name)
      )
    `)
    .eq('id', params.id)
    .single()

  if (error || !gig) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  // 이미 지원했는지 확인
  let hasApplied = false
  if (user) {
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('gig_id', params.id)
      .eq('applicant_id', user.id)
      .single()
    hasApplied = !!existing
  }

  const isOwner = user?.id === gig.user_id

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
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
        {/* 기본 정보 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gig.gig_type === 'hiring' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {gig.gig_type === 'hiring' ? '구인' : '구직'}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${gig.is_paid ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
              {gig.is_paid ? '유급' : '무급'}
            </span>
          </div>

          <h2 className="text-xl font-black text-gray-900 mb-1">{gig.title}</h2>

          {/* 작성자 */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
              {(gig.author as { display_name: string } | null)?.display_name?.[0] ?? '?'}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {(gig.author as { display_name: string } | null)?.display_name}
            </span>
            <span className="text-xs text-orange-500 font-bold">
              {(gig.author as { manner_temperature: number } | null)?.manner_temperature ?? 36.5}°
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '악기', value: (gig.instruments as { instrument: { name: string } | null }[])?.map(i => i.instrument?.name).filter(Boolean).join(', ') || '-' },
              { label: '최소 실력', value: gig.min_skill_level ? LEVEL_LABELS[gig.min_skill_level] : '무관' },
              { label: '지역', value: (gig.region as { name: string } | null)?.name ?? '-' },
              { label: '연주일', value: gig.event_date ?? '협의' },
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
              <span className="text-sm text-gray-600">{gig.current_applicants ?? 0}명 지원 중</span>
              <span className="text-sm font-bold text-indigo-600">{gig.max_applicants}명 모집</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${Math.min(((gig.current_applicants ?? 0) / gig.max_applicants) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* 상세 설명 */}
        {gig.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3">공고 내용</h3>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{gig.description}</div>
          </div>
        )}

        {/* 공고 정보 */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <p className="text-xs text-gray-400">
            등록일 {new Date(gig.created_at).toLocaleDateString('ko-KR')}
            {gig.expires_at && ` · ${new Date(gig.expires_at).toLocaleDateString('ko-KR')} 만료`}
          </p>
        </div>
      </main>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4">
        <div className="max-w-lg mx-auto">
          {!user ? (
            <Link href="/login">
              <Button size="full" className="bg-indigo-600 hover:bg-indigo-700">로그인 후 지원하기</Button>
            </Link>
          ) : isOwner ? (
            <Button size="full" variant="outline" disabled>내가 올린 공고입니다</Button>
          ) : hasApplied ? (
            <Button size="full" variant="outline" disabled>이미 지원했습니다 ✓</Button>
          ) : (
            <Link href={`/gigs/${params.id}/apply`}>
              <Button size="full" className="bg-indigo-600 hover:bg-indigo-700">지원하기</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
