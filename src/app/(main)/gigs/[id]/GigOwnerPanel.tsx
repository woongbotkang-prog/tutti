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

export default function GigOwnerPanel({ gigId, gigTitle, applications: initialApps }: GigOwnerPanelProps) {
  const router = useRouter()
  const supabase = createClient()
  const [applications, setApplications] = useState(initialApps)
  const [chatRoomIds, setChatRoomIds] = useState<Record<string, string>>({})
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [respondingId, setRespondingId] = useState<string | null>(null)

  // 기존 수락된 지원의 채팅방 ID를 조회
  useEffect(() => {
    const acceptedApps = applications.filter(app => app.status === 'accepted')
    if (acceptedApps.length === 0) return

    const fetchChatRooms = async () => {
      const { data } = await supabase
        .from('chat_rooms')
        .select('id, application_id')
        .in('application_id', acceptedApps.map(app => app.id))

      if (data && data.length > 0) {
        const roomMap: Record<string, string> = {}
        data.forEach((room: { id: string; application_id: string }) => {
          roomMap[room.application_id] = room.id
        })
        setChatRoomIds(prev => ({ ...prev, ...roomMap }))
      }
    }
    fetchChatRooms()
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

  const handleRespond = async (applicationId: string, applicantId: string, status: 'accepted' | 'rejected') => {
    setRespondingId(applicationId)
    try {
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', applicationId)

      if (error) throw error

      // 알림 생성 (지원자에게)
      if (applicantId) {
        await supabase.from('notifications').insert({
          user_id: applicantId,
          type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
          title: status === 'accepted' ? '지원이 수락되었습니다' : '지원 결과 안내',
          body: status === 'accepted'
            ? `${gigTitle} 공고에 합격했습니다!`
            : `${gigTitle} 공고 지원 결과를 확인해주세요.`,
          data: { gig_id: gigId },
          is_read: false,
        })
      }

      // 수락 시 채팅방 자동 생성
      if (status === 'accepted') {
        // 현재 로그인 유저 (공고 작성자)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // 중복 방지: 이미 이 application에 대한 채팅방이 있는지 확인
          const { data: existingRoom } = await supabase
            .from('chat_rooms')
            .select('id')
            .eq('application_id', applicationId)
            .maybeSingle()

          if (!existingRoom) {
            // 채팅방 생성
            const { data: newRoom, error: roomError } = await supabase
              .from('chat_rooms')
              .insert({
                application_id: applicationId,
                room_type: 'direct',
              })
              .select('id')
              .single()

            if (!roomError && newRoom) {
              // 참여자 추가 (작성자 + 지원자)
              await supabase.from('chat_participants').insert([
                { room_id: newRoom.id, user_id: user.id },
                { room_id: newRoom.id, user_id: applicantId },
              ])
              setChatRoomIds(prev => ({ ...prev, [applicationId]: newRoom.id }))
            }
          } else if (existingRoom) {
            setChatRoomIds(prev => ({ ...prev, [applicationId]: existingRoom.id }))
          }
        }
      }

      setApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, status } : app)
      )
    } catch {
      alert('처리에 실패했습니다.')
    } finally {
      setRespondingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* 지원자 목록 */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-3">
          지원자 ({applications.length}명)
        </h3>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">아직 지원자가 없습니다</p>
        ) : (
          <div className="space-y-3">
            {applications.map(app => {
              const status = STATUS_LABELS[app.status] ?? STATUS_LABELS.pending
              const isPending = app.status === 'pending'
              const isResponding = respondingId === app.id

              return (
                <div key={app.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {app.applicant?.display_name?.[0] ?? '?'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">
                          {app.applicant?.display_name ?? '알 수 없음'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {app.applicant?.manner_temperature?.toFixed(1)}°
                          {app.applicant?.region?.name && ` · ${app.applicant.region.name}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  {app.message && (
                    <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-3">
                      {app.message}
                    </p>
                  )}

                  {isPending && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRespond(app.id, app.applicant?.id ?? '', 'accepted')}
                        disabled={isResponding}
                        className="flex-1 py-2 text-sm font-bold rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        수락
                      </button>
                      <button
                        onClick={() => handleRespond(app.id, app.applicant?.id ?? '', 'rejected')}
                        disabled={isResponding}
                        className="flex-1 py-2 text-sm font-bold rounded-xl bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 transition-colors"
                      >
                        거절
                      </button>
                    </div>
                  )}

                  {app.status === 'accepted' && (
                    <Link
                      href={chatRoomIds[app.id] ? `/chat/${chatRoomIds[app.id]}` : '/chat'}
                      className="block w-full py-2 text-sm font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-center mt-2"
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
