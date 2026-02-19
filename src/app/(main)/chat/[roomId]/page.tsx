'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Message {
  id: string
  room_id: string
  content: string
  sender_id: string
  created_at: string
  is_deleted: boolean
}

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const { roomId } = params

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUserName, setOtherUserName] = useState('')
  const [gigTitle, setGigTitle] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const messagesRef = useRef<Message[]>([])

  // messagesRef를 항상 최신으로 유지
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // 자동 스크롤
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }, [])

  // 읽음 처리
  const markAsRead = useCallback(async (uid: string) => {
    await supabase
      .from('chat_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('room_id', roomId)
      .eq('user_id', uid)
  }, [roomId, supabase])

  // 초기화: 인증 → 구독 → 메시지 로드 (순서 중요!)
  useEffect(() => {
    let mounted = true

    const init = async () => {
      // 1. 인증 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      if (!mounted) return
      setUserId(user.id)

      // 2. Realtime 구독 먼저 설정 (메시지 누락 방지)
      const channel = supabase
        .channel(`room:${roomId}`, {
          config: { broadcast: { self: true } },
        })
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        }, (payload) => {
          const newMsg = payload.new as Message
          if (!mounted) return

          setMessages(prev => {
            // 중복 체크 (같은 ID)
            if (prev.some(m => m.id === newMsg.id)) return prev

            // 임시 메시지 교체 (optimistic update)
            const tempIdx = prev.findIndex(
              m => m.id.startsWith('temp-') &&
                   m.content === newMsg.content &&
                   m.sender_id === newMsg.sender_id
            )
            if (tempIdx >= 0) {
              const updated = [...prev]
              updated[tempIdx] = newMsg
              return updated
            }

            return [...prev, newMsg]
          })

          scrollToBottom()

          // 상대방 메시지 수신 시 읽음 처리
          if (newMsg.sender_id !== user.id) {
            markAsRead(user.id)
          }
        })
        .subscribe()

      channelRef.current = channel

      // 3. 채팅방 메타 정보 로드 (병렬)
      const [participantsRes, roomRes, messagesRes] = await Promise.all([
        // 상대방 이름
        supabase
          .from('chat_participants')
          .select('user_id, user:user_profiles(display_name)')
          .eq('room_id', roomId)
          .neq('user_id', user.id)
          .limit(1),
        // 공고 제목
        supabase
          .from('chat_rooms')
          .select('application:applications(gig:gigs(title))')
          .eq('id', roomId)
          .single(),
        // 메시지 로드
        supabase
          .from('chat_messages')
          .select('*')
          .eq('room_id', roomId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: true })
          .limit(100),
      ])

      if (!mounted) return

      // 상대방 이름 설정
      if (participantsRes.data?.[0]) {
        const u = participantsRes.data[0].user as { display_name?: string } | null
        setOtherUserName(u?.display_name || '상대방')
      }

      // 공고 제목 설정
      if (roomRes.data) {
        const app = roomRes.data.application as { gig?: { title?: string } } | null
        setGigTitle(app?.gig?.title || '')
      }

      // 메시지 설정
      if (messagesRes.data) {
        setMessages(messagesRes.data)
      }

      setLoading(false)
      scrollToBottom()

      // 4. 읽음 처리
      await markAsRead(user.id)
    }

    init()

    return () => {
      mounted = false
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [roomId]) // eslint-disable-line react-hooks/exhaustive-deps

  // 메시지 전송
  const handleSend = async () => {
    if (!newMessage.trim() || sending || !userId) return
    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const tempMessage: Message = {
      id: tempId,
      room_id: roomId,
      sender_id: userId,
      content,
      created_at: new Date().toISOString(),
      is_deleted: false,
    }
    setMessages(prev => [...prev, tempMessage])
    scrollToBottom()

    const { error } = await supabase.from('chat_messages').insert({
      room_id: roomId,
      sender_id: userId,
      content,
    })

    if (error) {
      // 실패 시 롤백
      setMessages(prev => prev.filter(m => m.id !== tempId))
      setNewMessage(content)
    }
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white px-4 py-4 flex items-center gap-3 border-b border-gray-100 shrink-0">
        <Link href="/chat">
          <button className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        </Link>
        <div>
          <h1 className="font-bold text-gray-900">{otherUserName || '채팅'}</h1>
          {gigTitle && <p className="text-xs text-gray-400 truncate max-w-[200px]">{gigTitle}</p>}
        </div>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            첫 번째 메시지를 보내보세요!
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white text-gray-900 rounded-bl-sm shadow-sm'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t border-gray-100 px-4 py-3 bg-white shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1}
            className="flex-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 resize-none max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 flex items-center justify-center transition-colors shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
