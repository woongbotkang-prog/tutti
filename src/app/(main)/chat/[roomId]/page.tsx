'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
}

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      // 메시지 조회
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', params.roomId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(100)

      if (data) setMessages(data)
      setLoading(false)

      // 마지막 읽은 시간 업데이트
      await supabase
        .from('chat_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('room_id', params.roomId)
        .eq('user_id', user.id)
    }
    init()
  }, [params.roomId])

  // 실시간 구독
  useEffect(() => {
    const channel = supabase
      .channel(`room:${params.roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `room_id=eq.${params.roomId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [params.roomId])

  // 자동 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || sending || !userId) return
    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase.from('chat_messages').insert({
      room_id: params.roomId,
      sender_id: userId,
      content,
    })

    if (error) setNewMessage(content)
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
    </div>
  )

  return (
    <div className="flex flex-col h-screen bg-white">
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
          <h1 className="font-bold text-gray-900">채팅</h1>
          <p className="text-xs text-gray-400">지원 관련 대화</p>
        </div>
      </header>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            첫 번째 메시지를 보내보세요! 👋
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
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
      <div className="border-t border-gray-100 px-4 py-3 bg-white shrink-0 safe-area-inset-bottom">
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
