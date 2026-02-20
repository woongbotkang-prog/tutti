'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Applicant {
  id: string
  status: string
  message: string | null
  applied_at: string
  applicant: {
    id: string
    display_name: string
    avatar_url: string | null
    manner_temperature: number
    region?: { name: string } | null
  } | null
}

interface GigOwnerPanelProps {
  gigId: string
  gigTitle: string
  applications: Applicant[]
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '대기 중', color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: '수락됨', color: 'bg-green-100 text-green-700' },
  rejected: { label: '거절됨', color: 'bg-red-100 text-red-700' },
}

const REJECTION_REASONS = [
  { value: 'skill_mismatch', label: '실력 수준이 맞지 않아요' },
  { value: 'schedule_conflict', label: '일정이 맞지 않아요' },
  { value: 'position_filled', label: '해당 파트가 이미 충원되었어요' },
  { value: 'other', label: '기타 사유' },
]

type FilterTab = 'all' | 'pending' | 'accepted' | 'rejected'

export default function GigOwnerPanel({ gigId, gigTitle, applications: initialApps }: GigOwnerPanelProps) {
  const router = useRouter()
  const supabase = createClient()
  const [applications, setApplications] = useState(initialApps)
  const [chatRoomIds, setChatRoomIds] = useState<Record<string, string>>({})
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [filterTab, setFilterTab] = useState<FilterTab>('all')

  // 거절 사유 관련
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionText, setRejectionText] = useState('')

  // 기존 수락된 지원의 채팅방 ID를 조회
  useEffect(() => {
    const acceptedApps = applications.filter(app => app.status === 'accepted')
    if (acceptedApps.length === 0) return

    const fetchOrCreateChatRooms = async () => {
      const { data } = await supabase
        .from('chat_rooms')
        .select('id, application_id')
        .in('application_id', acceptedApps.map(app => app.id))

      const roomMap: Record<string, string> = {}
      if (data && data.length > 0) {
        data.forEach((room: { id: string; application_id: string }) => {
          roomMap[room.application_id] = room.id
        })
      }

      const missingApps = acceptedApps.filter(app => !roomMap[app.id])
      if (missingApps.length > 0) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          for (const app of missingApps) {
            if (!app.applicant?.id) continue
            const { data: roomId } = await supabase
              .rpc('create_chat_room_for_application', {
                p_application_id: app.id,
                p_gig_owner_id: user.id,
                p_applicant_id: app.applicant.id,
              })
            if (roomId) roomMap[app.id] = roomId
          }
        }
      }

      setChatRoomIds(prev => ({ ...prev, ...roomMap }))
    }
    fetchOrCreateChatRooms()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('gigs')
        .update({ status: 'closed' })
        .eq('id', gigId)
      if (error) throw error
      router.push('/gigs')
      router.refresh()
    } catch {
      alert('삭제에 실패했습니다.')
      setDeleting(false)
    }
  }

  const handleAccept = async (applicationId: string, applicantId: string) => {
    setRespondingId(applicationId)
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', applicationId)
      if (error) throw error

      if (applicantId) {
        await supabase.from('notifications').insert({
          user_id: applicantId,
          type: 'application_accepted',
          title: '지원이 수락되었습니다',
          body: `${gigTitle} 공고에 합격했습니다!`,
          data: { gig_id: gigId },
          is_read: false,
        })
      }

      // 채팅방 자동 생성
      if (applicantId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: roomId, error: rpcError } = await supabase
            .rpc('create_chat_room_for_application', {
              p_application_id: applicationId,
              p_gig_owner_id: user.id,
              p_applicant_id: applicantId,
            })
          if (!rpcError && roomId) {
            setChatRoomIds(prev => ({ ...prev, [applicationId]: roomId }))
          }
        }
      }

      setApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, status: 'accepted' } : app)
      )
    } catch {
      alert('처리에 실패했습니다.')
    } finally {
      setRespondingId(null)
    }
  }

  const handleRejectStart = (applicationId: string) => {
    setRejectingId(applicationId)
    setRejectionReason('')
    setRejectionText('')
  }

  const handleRejectConfirm = async (applicationId: string, applicantId: string) => {
    if (!rejectionReason) return
    setRespondingId(applicationId)
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString(),
          rejection_reason_code: rejectionReason,
          rejection_reason_text: rejectionReason === 'other' ? rejectionText.trim() || null : null,
        })
        .eq('id', applicationId)
      if (error) throw error

      if (applicantId) {
        const reasonLabel = REJECTION_REASONS.find(r => r.value === rejectionReason)?.label || ''
        await supabase.from('notifications').insert({
          user_id: applicantId,
          type: 'application_rejected',
          title: '지원 결과 안내',
          body: `${gigTitle} 공고: ${reasonLabel}`,
          data: { gig_id: gigId },
          is_read: false,
        })
      }

      setApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, status: 'rejected' } : app)
      )
      setRejectingId(null)
    } catch {
      alert('처리에 실패했습니다.')
    } finally {
      setRespondingId(null)
    }
  }

  // 현황 계산
  const pendingCount = applications.filter(a => a.status === 'pending').length
  const acceptedCount = applications.filter(a => a.status === 'accepted').length
  const rejectedCount = applications.filter(a => a.status === 'rejected').length

  // 필터 + 정렬 (pending 먼저)
  const statusOrder: Record<string, number> = { pending: 0, accepted: 1, rejected: 2 }
  const filteredApps = applications
    .filter(a => filterTab === 'all' || a.status === filterTab)
    .sort((a, b) => (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3))

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}분 전`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}시간 전`
    const days = Math.floor(hrs / 24)
    return `${days}일 전`
  }

  return (
    <div className="space-y-4">
      {/* 지원 현황 요약 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">지원 현황</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-yellow-50 rounded-xl">
            <p className="text-2xl font-black text-yellow-600">{pendingCount}</p>
            <p className="text-xs text-yellow-600 font-medium">대기 중</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <p className="text-2xl font-black text-green-600">{acceptedCount}</p>
            <p className="text-xs text-green-600 font-medium">수락</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-xl">
            <p className="text-2xl font-black text-gray-500">{rejectedCount}</p>
            <p className="text-xs text-gray-500 font-medium">거절</p>
          </div>
        </div>
      </div>

      {/* 지원자 목록 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">지원자 ({applications.length}명)</h3>
        </div>

        {/* 필터 탭 */}
        {applications.length > 0 && (
          <div className="flex gap-1.5 mb-4">
            {([
              { key: 'all' as FilterTab, label: '전체' },
              { key: 'pending' as FilterTab, label: `대기 (${pendingCount})` },
              { key: 'accepted' as FilterTab, label: `수락 (${acceptedCount})` },
              { key: 'rejected' as FilterTab, label: `거절 (${rejectedCount})` },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                  filterTab === tab.key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {filteredApps.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">
            {filterTab === 'all' ? '아직 지원자가 없습니다' : '해당 상태의 지원자가 없습니다'}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredApps.map(app => {
              const status = STATUS_LABELS[app.status] ?? STATUS_LABELS.pending
              const isPending = app.status === 'pending'
              const isResponding = respondingId === app.id
              const isRejecting = rejectingId === app.id

              return (
                <div key={app.id} className={`border rounded-xl p-4 transition-colors ${
                  isPending ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      {app.applicant?.avatar_url ? (
                        <img src={app.applicant.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {app.applicant?.display_name?.[0] ?? '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm text-gray-900">
                          {app.applicant?.display_name ?? '알 수 없음'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {app.applicant?.manner_temperature?.toFixed(1)}°
                          {app.applicant?.region?.name && ` · ${app.applicant.region.name}`}
                          {' · '}{timeAgo(app.applied_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {app.message && (
                    <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3 leading-relaxed">
                      {app.message}
                    </p>
                  )}

                  {isPending && !isRejecting && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(app.id, app.applicant?.id ?? '')}
                        disabled={isResponding}
                        className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {isResponding ? '처리 중...' : '수락'}
                      </button>
                      <button
                        onClick={() => handleRejectStart(app.id)}
                        disabled={isResponding}
                        className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 transition-colors"
                      >
                        거절
                      </button>
                    </div>
                  )}

                  {/* 거절 사유 선택 */}
                  {isPending && isRejecting && (
                    <div className="space-y-3 bg-red-50/50 rounded-xl p-3 border border-red-100">
                      <p className="text-sm font-bold text-red-700">거절 사유 선택</p>
                      <div className="space-y-1.5">
                        {REJECTION_REASONS.map(reason => (
                          <button
                            key={reason.value}
                            onClick={() => setRejectionReason(reason.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              rejectionReason === reason.value
                                ? 'bg-red-100 text-red-700 font-medium'
                                : 'bg-white text-gray-600 hover:bg-red-50'
                            }`}
                          >
                            {reason.label}
                          </button>
                        ))}
                      </div>
                      {rejectionReason === 'other' && (
                        <textarea
                          placeholder="거절 사유를 입력해주세요 (선택)"
                          value={rejectionText}
                          onChange={e => setRejectionText(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                        />
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRejectConfirm(app.id, app.applicant?.id ?? '')}
                          disabled={!rejectionReason || isResponding}
                          className="flex-1 py-2 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {isResponding ? '처리 중...' : '거절 확인'}
                        </button>
                        <button
                          onClick={() => setRejectingId(null)}
                          className="flex-1 py-2 text-sm font-bold rounded-xl bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  )}

                  {app.status === 'accepted' && (
                    <Link
                      href={chatRoomIds[app.id] ? `/chat/${chatRoomIds[app.id]}` : '/chat'}
                      className="block w-full py-2.5 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-center mt-2"
                    >
                      💬 채팅 바로가기
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 공고 관리 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">공고 관리</h3>
        <Link href={`/gigs/${gigId}/edit`}>
          <button className="w-full py-3 text-sm font-bold rounded-xl border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-colors mb-3">
            공고 수정하기
          </button>
        </Link>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 text-sm font-bold rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 transition-colors"
          >
            공고 마감하기
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">정말로 이 공고를 마감할까요?</p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deleting ? '처리 중...' : '마감하기'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
