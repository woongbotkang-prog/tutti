import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '검토 중', color: 'text-yellow-600 bg-yellow-50' },
  accepted: { label: '수락됨', color: 'text-green-600 bg-green-50' },
  rejected: { label: '거절됨', color: 'text-red-600 bg-red-50' },
  withdrawn: { label: '취소됨', color: 'text-gray-600 bg-gray-50' },
}

export default async function ApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: applications } = await supabase
    .from('applications')
    .select(`
      id, status, applied_at,
      gig:gigs(id, title, gig_type, status,
        author:user_profiles!gigs_user_id_fkey(display_name),
        region:regions(name)
      )
    `)
    .eq('applicant_id', user.id)
    .order('applied_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white px-4 py-4 border-b border-gray-100 sticky top-0 z-20">
        <h1 className="text-lg font-black text-gray-900">내 지원 현황</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {!applications || applications.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-sm">아직 지원한 공고가 없어요</p>
            <Link href="/gigs" className="inline-block mt-4 text-sm text-indigo-600 font-medium">공고 보러가기 →</Link>
          </div>
        ) : (
          applications.map(app => {
            const gig = app.gig as unknown as { id: string; title: string; gig_type: string; author: { display_name: string } | null; region: { name: string } | null } | null
            const status = STATUS_LABELS[app.status] ?? STATUS_LABELS.pending
            return (
              <Link key={app.id} href={`/gigs/${gig?.id}`}>
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(app.applied_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{gig?.title}</h3>
                  <p className="text-xs text-gray-500">
                    {gig?.author?.display_name}
                    {gig?.region?.name && ` · ${gig.region.name}`}
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </main>
    </div>
  )
}
