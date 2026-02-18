'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ChatRoomPreview {
  id: string
  otherUserName: string
  lastMessage: string
  lastMessageAt: string
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

      const { data } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          application:applications(
            gig:gigs(title),
            applicant:user_profiles!applications_applicant_id_fkey(display_name),
            gig_author:user_profiles!gigs_user_id_fkey(display_name)
          ),
          participants:chat_participants(user_id, last_read_at),
          messages:chat_messages(content, created_at, sender_id)
        `)
        .order('created_at', { ascending: false })

      // TODO: 실제 채팅방 데이터 매핑
      setRooms([])
      setLoading(false)
    }
    fetchRooms()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 py-4 border-b border-gray-100">
        <h1 className="text-lg font-black text-gray-900">채팅</h1>
      </header>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <span className="text-5xl mb-4">💬</span>
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
                  <p className="text-xs text-gray-500 truncate">{room.lastMessage}</p>
                  <p className="text-xs text-indigo-400 mt-0.5 truncate">{room.gigTitle}</p>
                </div>
                {room.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center font-bold shrink-0">
                    {room.unreadCount}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
