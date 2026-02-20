'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ChatRoomPreview {
  id: string
  otherUserName: string
  lastMessage: string
  lastMessageAt: string
  lastMessageRaw: string // ISO string for sorting
  unreadCount: number
  gigTitle: string
}

export default function ChatListPage() {
  const [rooms, setRooms] = useState<ChatRoomPreview[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRooms = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // 내가 참여한 채팅방 조회
      const { data: participations } = await supabase
        .from('chat_participants')
        .select('room_id, last_read_at')
        .eq('user_id', user.id)

      if (!participations || participations.length === 0) {
        setLoading(false)
        return
      }

      const roomIds = participations.map(p => p.room_id)

      // 각 채팅방 정보 조회
      const { data: chatRooms } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          created_at,
          application:applications(
            gig:gigs(title)
          )
        `)
        .in('id', roomIds)

      if (!chatRooms) { setLoading(false); return }

      // 각 채팅방의 참여자 및 마지막 메시지 조회
      const roomPreviews = await Promise.all(
        chatRooms.map(async (room) => {
          // 상대방 참여자 조회
          const { data: participants } = await supabase
            .from('chat_participants')
            .select(`
              user_id,
              user:user_profiles(display_name)
            `)
            .eq('room_id', room.id)
            .neq('user_id', user.id)
            .limit(1)

          const otherUser = participants?.[0]

          // 마지막 메시지 조회
          const { data: lastMessages } = await supabase
            .from('chat_messages')
            .select('content, created_at, sender_id')
            .eq('room_id', room.id)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false })
            .limit(1)

          const lastMsg = lastMessages?.[0]

          // 안 읽은 메시지 수 계산
          const myParticipation = participations.find(p => p.room_id === room.id)
          let unreadCount = 0
          if (myParticipation) {
            let countQuery = supabase
              .from('chat_messages')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id)
              .eq('is_deleted', false)
              .neq('sender_id', user.id)

            if (myParticipation.last_read_at) {
              countQuery = countQuery.gt('created_at', myParticipation.last_read_at)
            }

            const { count } = await countQuery
            unreadCount = count || 0
          }

          // gig title 추출
          const application = room.application as { gig?: { title?: string } } | null
          const gigTitle = application?.gig?.title || '공고'

          return {
            id: room.id,
            otherUserName: (otherUser?.user as { display_name?: string } | null)?.display_name || '알 수 없음',
            lastMessage: lastMsg?.content || '대화를 시작해보세요',
            lastMessageAt: lastMsg
              ? new Date(lastMsg.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
              : '',
            lastMessageRaw: lastMsg?.created_at || room.created_at,
            unreadCount,
            gigTitle,
          } as ChatRoomPreview
        })
      )

      // 최신 메시지순 정렬
      roomPreviews.sort((a, b) =>
        new Date(b.lastMessageRaw).getTime() - new Date(a.lastMessageRaw).getTime()
      )

      setRooms(roomPreviews)
      setLoading(false)
    }
    fetchRooms()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-lg font-black text-gray-900">채팅</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto">
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">아직 채팅이 없어요</h2>
          <p className="text-sm text-gray-500 mb-6">
            공고에 지원하거나 지원자를 수락하면<br />채팅이 시작됩니다
          </p>
          <Link
            href="/gigs"
            className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            공고 보러가기
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-50">
          {rooms.map(room => (
            <li key={room.id}>
              <Link href={`/chat/${room.id}`} className="flex items-center gap-4 px-4 py-4 hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                  {room.otherUserName?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="font-bold text-gray-900 text-sm truncate">{room.otherUserName}</p>
                    <p className="text-xs text-gray-400 shrink-0 ml-2">{room.lastMessageAt}</p>
                  </div>
                  <p className={`text-xs truncate ${room.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                    {room.lastMessage}
                  </p>
                  <p className="text-xs text-indigo-400 mt-0.5 truncate">{room.gigTitle}</p>
                </div>
                {room.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                    {room.unreadCount > 9 ? '9+' : room.unreadCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      </main>
    </div>
  )
}
